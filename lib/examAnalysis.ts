import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type ExamAnalysisKey = {
  schoolId: number
  examTitle: string
  grade: number
}

export type ExamAnalysisStats = {
  reviewCount: number
  difficulty: { avg: number | null; histogram: Record<string, number> }
  /** DB 필드 grammarCount·writingCount에 매핑 (객관식·서술형) */
  counts: {
    mcq: { avg: number | null }
    subjective: { avg: number | null }
  }
  /** 집계·요약용 짧은 발췌 (개인 식별 정보 없음) */
  freeTextExcerpts: string[]
}

function avg(nums: Array<number | null | undefined>): number | null {
  const filtered = nums.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
  if (filtered.length === 0) return null
  return filtered.reduce((a, b) => a + b, 0) / filtered.length
}

function difficultyHistogram(difficulties: number[]): Record<string, number> {
  const hist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  for (const d of difficulties) {
    const k = String(d)
    if (hist[k] !== undefined) hist[k]++
  }
  return hist
}

export async function computeExamAnalysisStats(key: ExamAnalysisKey): Promise<{ stats: ExamAnalysisStats; sourceCount: number }> {
  const rows = await prisma.examReview.findMany({
    where: { schoolId: key.schoolId, examTitle: key.examTitle, grade: key.grade },
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      difficulty: true,
      grammarCount: true,
      writingCount: true,
      freeText: true,
    },
  })

  const diffs = rows.map((r) => r.difficulty)
  const sourceCount = rows.length

  const excerpts: string[] = []
  for (const r of rows) {
    const t = (r.freeText ?? '').trim().replace(/\s+/g, ' ')
    if (!t) continue
    const slice = t.length > 140 ? `${t.slice(0, 140)}…` : t
    excerpts.push(slice)
    if (excerpts.length >= 12) break
  }

  const stats: ExamAnalysisStats = {
    reviewCount: sourceCount,
    difficulty: {
      avg: avg(diffs),
      histogram: difficultyHistogram(diffs),
    },
    counts: {
      mcq: { avg: avg(rows.map((r) => r.grammarCount)) },
      subjective: { avg: avg(rows.map((r) => r.writingCount)) },
    },
    freeTextExcerpts: excerpts,
  }

  return { stats, sourceCount }
}

async function generateSummaryText(opts: {
  apiKey: string
  key: ExamAnalysisKey
  stats: ExamAnalysisStats
}): Promise<{ text: string; model: string } | null> {
  if (!opts.apiKey) return null
  if (opts.stats.reviewCount < 3) return null

  const client = new Anthropic({ apiKey: opts.apiKey })
  const model = 'claude-sonnet-4-6'

  const prompt = `너는 고등학교 내신 분석 교사다.
아래는 학생들이 남긴 객관식·서술형 문항 수(자가보고 평균), 체감 난이도, 그리고 자유 후기 발췌다. 통계와 발췌를 바탕으로 선생님이 쓰는 것처럼 한국어로 총평을 작성하라.

조건:
- 과장하지 말고 데이터에 근거해서 말하기
- 다음 섹션을 포함: (1) 총평 (2) 난이도 (3) 객관식·서술형 비중과 출제 느낌 (4) 대비/학습 조언
- 자유 후기 발췌에서 반복되는 표현·팁을 요약해 반영하기 (개인을 특정하지 말 것)
- 불릿/짧은 문단 위주로 8~14줄

대상:
- 학교ID: ${opts.key.schoolId}
- 시험: ${opts.key.examTitle}
- 학년: ${opts.key.grade}

통계(JSON):
${JSON.stringify(opts.stats, null, 2)}
`

  try {
    const res = await client.messages.create({
      model,
      max_tokens: 700,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
    })
    const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
    if (!text.trim()) return null
    return { text, model }
  } catch {
    return null
  }
}

export async function upsertExamReviewAggregate(opts: {
  key: ExamAnalysisKey
  windowStart: Date
  windowEnd: Date
  generateAiSummary?: boolean
}): Promise<void> {
  const { stats, sourceCount } = await computeExamAnalysisStats(opts.key)

  if (sourceCount === 0) {
    await prisma.examReviewAggregate.deleteMany({
      where: {
        schoolId: opts.key.schoolId,
        examTitle: opts.key.examTitle,
        grade: opts.key.grade,
      },
    })
    return
  }

  const ai = opts.generateAiSummary
    ? await generateSummaryText({
        apiKey: process.env.ANTHROPIC_API_KEY ?? '',
        key: opts.key,
        stats,
      })
    : null

  await prisma.examReviewAggregate.upsert({
    where: {
      schoolId_examTitle_grade: {
        schoolId: opts.key.schoolId,
        examTitle: opts.key.examTitle,
        grade: opts.key.grade,
      },
    },
    update: {
      windowStart: opts.windowStart,
      windowEnd: opts.windowEnd,
      sourceCount,
      statsJson: stats as unknown as Prisma.JsonObject,
      aiSummary: ai?.text ?? undefined,
      aiModel: ai?.model ?? undefined,
      aiGeneratedAt: ai ? new Date() : undefined,
    },
    create: {
      schoolId: opts.key.schoolId,
      examTitle: opts.key.examTitle,
      grade: opts.key.grade,
      windowStart: opts.windowStart,
      windowEnd: opts.windowEnd,
      sourceCount,
      statsJson: stats as unknown as Prisma.JsonObject,
      aiSummary: ai?.text ?? null,
      aiModel: ai?.model ?? null,
      aiGeneratedAt: ai ? new Date() : null,
    },
  })
}

const AGG_WINDOW_MS = 1000 * 60 * 60 * 24 * 180

/** 후기 저장·수정·삭제 뒤 친구들 평가/분석 집계를 맞춘다. 실패해도 로그만 남기고 본 요청은 성공 처리한다. */
export async function syncExamReviewAggregateFromReviews(key: ExamAnalysisKey): Promise<void> {
  try {
    const now = new Date()
    await upsertExamReviewAggregate({
      key,
      windowStart: new Date(now.getTime() - AGG_WINDOW_MS),
      windowEnd: now,
      generateAiSummary: true,
    })
  } catch (err) {
    console.error('[syncExamReviewAggregateFromReviews]', JSON.stringify(key), err)
  }
}

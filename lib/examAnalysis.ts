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
  counts: {
    grammar: { avg: number | null }
    vocab: { avg: number | null }
    reading: { avg: number | null }
    writing: { avg: number | null }
    listening: { avg: number | null }
    other: { avg: number | null }
  }
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
      vocabCount: true,
      readingCount: true,
      writingCount: true,
      listeningCount: true,
      otherCount: true,
    },
  })

  const diffs = rows.map((r) => r.difficulty)
  const sourceCount = rows.length

  const stats: ExamAnalysisStats = {
    reviewCount: sourceCount,
    difficulty: {
      avg: avg(diffs),
      histogram: difficultyHistogram(diffs),
    },
    counts: {
      grammar: { avg: avg(rows.map((r) => r.grammarCount)) },
      vocab: { avg: avg(rows.map((r) => r.vocabCount)) },
      reading: { avg: avg(rows.map((r) => r.readingCount)) },
      writing: { avg: avg(rows.map((r) => r.writingCount)) },
      listening: { avg: avg(rows.map((r) => r.listeningCount)) },
      other: { avg: avg(rows.map((r) => r.otherCount)) },
    },
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
아래는 학생들이 구조화로 남긴 통계 요약이다. 이 통계를 바탕으로 선생님이 쓰는 것처럼 한국어로 총평을 작성하라.

조건:
- 과장하지 말고 데이터에 근거해서 말하기
- 다음 섹션을 포함: (1) 총평 (2) 난이도 (3) 영역별 특징 (4) 대비/학습 조언
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


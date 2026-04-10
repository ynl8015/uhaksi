import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getStatus(err: unknown): number | null {
  if (typeof err !== 'object' || err === null) return null
  const anyErr = err as { status?: unknown; response?: { status?: unknown } }
  const status = anyErr?.status ?? anyErr?.response?.status
  return typeof status === 'number' ? status : null
}

async function createMessageWithRetry(args: Anthropic.Messages.MessageCreateParamsNonStreaming) {
  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await client.messages.create(args)
    } catch (e) {
      const status = getStatus(e)
      const retryable = status === 429 || status === 529 || status === 503
      if (!retryable || attempt === maxAttempts) throw e
      const base = Math.min(2000, 400 * Math.pow(2, attempt - 1))
      const jitter = Math.floor(Math.random() * 150)
      await sleep(base + jitter)
    }
  }
  throw new Error('unreachable')
}

function extractJsonObject(text: string): Record<string, unknown> {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('응답에서 JSON을 찾지 못했습니다.')
  return JSON.parse(m[0]) as Record<string, unknown>
}

function firstTextBlock(msg: Anthropic.Messages.Message): string {
  const parts = msg.content.filter((b) => b.type === 'text') as Anthropic.Messages.TextBlock[]
  return parts.map((p) => p.text).join('\n').trim()
}

type ImagePart = {
  type: 'image'
  source: { type: 'base64'; media_type: 'image/jpeg' | 'image/png' | 'image/webp'; data: string }
}

export type StudentIdVisionResult = {
  ok: boolean
  schoolName: string | null
  studentName: string | null
  reason?: string
}

export async function verifyStudentIdWithVision(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
): Promise<StudentIdVisionResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, schoolName: null, studentName: null, reason: 'AI 설정이 필요합니다.' }
  }

  const imageBlock: ImagePart = {
    type: 'image',
    source: { type: 'base64', media_type: mediaType, data: base64 },
  }

  const response = await createMessageWithRetry({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: [
          imageBlock,
          {
            type: 'text',
            text: `이 이미지가 대한민국의 중학교·고등학교 학생증(또는 재학증명에 가까운 공식 학생 신분을 보여주는 카드)으로 보이는지 판단해 주세요.
시험지, 문제집, 답안, 일반 풍경 사진, UI 스크린샷만 있는 경우는 학생증이 아닙니다.
학생증으로 인정할 때는 카드에 보이는 **이름(본명)**과 **학교명**이 둘 다 식별 가능해야 합니다.
- studentName: 카드에 적힌 이름을 그대로 추출 (한글 본명, 띄어쓰기는 이미지와 동일하게)
- schoolName: 학교명을 이미지에 적힌 그대로 한글로 (예: OO중학교, OO고등학교)
이름이나 학교명이 가려져 있거나 판독 불가면 isStudentId를 false로 하세요.

반드시 JSON만 출력하세요. 마크다운 금지.
형식: {"isStudentId": boolean, "studentName": string | null, "schoolName": string | null, "reasonKo": string}`,
          },
        ],
      },
    ],
  })

  let parsed: Record<string, unknown>
  try {
    parsed = extractJsonObject(firstTextBlock(response))
  } catch {
    return {
      ok: false,
      schoolName: null,
      studentName: null,
      reason: '인식에 실패했습니다. 더 선명한 사진으로 다시 시도해 주세요.',
    }
  }

  const isStudentId = parsed.isStudentId === true
  const schoolName =
    typeof parsed.schoolName === 'string' && parsed.schoolName.trim().length > 0
      ? parsed.schoolName.trim()
      : null
  const studentName =
    typeof parsed.studentName === 'string' && parsed.studentName.trim().length > 0
      ? parsed.studentName.trim()
      : null
  const reasonKo = typeof parsed.reasonKo === 'string' ? parsed.reasonKo : undefined

  if (!isStudentId || !schoolName || !studentName) {
    return {
      ok: false,
      schoolName: null,
      studentName: null,
      reason: reasonKo || '학생증으로 확인되지 않았습니다. 이름과 학교가 함께 보이는 사진으로 다시 시도해 주세요.',
    }
  }

  return { ok: true, schoolName, studentName, reason: reasonKo }
}

export type ExamPaperVisionResult = {
  blocked: boolean
  reason?: string
}

export async function detectExamPaperInImage(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
): Promise<ExamPaperVisionResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { blocked: true, reason: '이미지 검사 설정이 필요합니다.' }
  }

  const imageBlock: ImagePart = {
    type: 'image',
    source: { type: 'base64', media_type: mediaType, data: base64 },
  }

  const response = await createMessageWithRetry({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: [
          imageBlock,
          {
            type: 'text',
            text: `이 사진에 학교 시험 문제지, 시험 답안지, 채점된 시험지, 공식 정답지처럼 보이는 내용이 주된 부분으로 포함되어 있나요?
공부 인증용 책상·플래너·필기 노트만 있고 시험지가 아니면 NO입니다.

반드시 JSON만 출력: {"isExamOrAnswerSheet": boolean}`,
          },
        ],
      },
    ],
  })

  try {
    const parsed = extractJsonObject(firstTextBlock(response))
    const isExam = parsed.isExamOrAnswerSheet === true
    return isExam ? { blocked: true } : { blocked: false }
  } catch {
    return { blocked: true, reason: '이미지를 검사하지 못했습니다. 잠시 후 다시 시도해 주세요.' }
  }
}

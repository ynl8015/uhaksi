import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import sharp from 'sharp'

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
  // Fail-fast: 인식은 UX가 중요해서 오래 붙잡기보다 빠르게 실패하고 사용자가 재시도하게 합니다.
  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await client.messages.create(args)
    } catch (e) {
      const status = getStatus(e)
      const retryable = status === 429 || status === 529 || status === 503
      if (!retryable || attempt === maxAttempts) throw e
      // 짧은 백오프로 1~2번만 더 시도
      const base = Math.min(2000, 400 * Math.pow(2, attempt - 1))
      const jitter = Math.floor(Math.random() * 150)
      const backoffMs = base + jitter
      await sleep(backoffMs)
    }
  }
  throw new Error('unreachable')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const datesJson = formData.get('dates') as string
    const dates = datesJson ? JSON.parse(datesJson) : []

    if (!file) {
      return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)
    const base64 = inputBuffer.toString('base64')
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'

    // Some colored timetable images have low text contrast. Provide an enhanced
    // grayscale/high-contrast render to improve vision extraction robustness.
    const enhancedPng = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer()
    const enhancedBase64 = enhancedPng.toString('base64')

    const datesText = dates.length > 0
      ? `시험 날짜 목록 (순서대로): ${dates.join(', ')}`
      : '날짜가 제공되지 않았습니다. 이미지에서 날짜를 직접 추출하세요.'

    const response = await createMessageWithRetry({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: enhancedBase64,
              },
            },
            {
              type: 'text',
              text: `이 이미지는 학교 시험 시간표입니다. 첫 번째는 원본, 두 번째는 대비를 높인(흑백) 버전입니다. 더 잘 보이는 버전을 기준으로 읽으세요.

${datesText}

표에서 학년별, 교시별, 날짜별 과목 정보를 추출해서 아래 JSON 형식으로만 반환하세요.
다른 텍스트나 설명 없이 JSON만 반환하세요.

{
  "subjects": [
    {
      "date": "YYYYMMDD 형식",
      "grade": 학년 숫자 (1, 2, 3),
      "period": 교시 숫자 (1, 2, 3, 4),
      "subject": "과목명"
    }
  ]
}

규칙:
- 날짜 목록이 제공된 경우, 표의 열 순서대로 날짜를 매핑하세요
- 표에 날짜 텍스트가 잘 안 보이면, 제공된 날짜 목록의 순서를 우선으로 사용하세요
- 날짜는 YYYYMMDD 형식
- 학년은 숫자만 (1, 2, 3)
- 교시는 숫자만 (1, 2, 3, 4)
- 과목명만 추출 (괄호 안 숫자 제거)
- 빈 칸은 포함하지 마세요
- JSON만 반환, 절대 다른 텍스트 없이`
            }
          ]
        }
      ]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('Claude 응답:', text)

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'JSON을 찾을 수 없습니다.', raw: text }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)

  } catch (e) {
    console.error('에러:', e)
    const status = getStatus(e)
    if (status === 429 || status === 529 || status === 503) {
      return NextResponse.json(
        { error: 'AI 서버가 혼잡합니다. 잠시 후 다시 시도해주세요.' },
        { status: 503, headers: { 'Retry-After': '30' } }
      )
    }
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
/** UI·저장 공통: AI 총평 최대 길이 (줄바꿈·공백 포함) */
export const AI_SUMMARY_MAX_CHARS = 220

/** 문장 분리 후 최대 개수 (2문단으로 나누기 전) */
const MAX_SENTENCES = 5

/**
 * (1) 총평 같은 번호 접두·마크다운 흔적 제거 후 한 줄로 정리.
 */
function stripNoiseToSingleLine(s: string): string {
  let t = s.replace(/\r\n/g, '\n').trim()
  if (!t) return ''

  const lines0 = t.split('\n')
  let i = 0
  while (i < lines0.length && /^#{1,6}\s/.test(lines0[i].trim())) {
    i++
  }
  t = lines0.slice(i).join('\n').trim()

  t = t
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^(\*{3,}|-{3,}|_{3,})$/.test(line))
    .join('\n')

  const parts = t.split('\n').map((line) => {
    let x = line.trim()
    x = x.replace(/^#{1,6}\s+/, '')
    x = x.replace(/^[-*+]\s+/, '')
    x = x.replace(/^\d+[.)]\s+/, '')
    return x
  })
  t = parts.filter(Boolean).join(' ')

  while (/\*\*[^*]+\*\*/.test(t)) {
    t = t.replace(/\*\*([^*]+)\*\*/g, '$1')
  }
  t = t.replace(/\*\*/g, '')
  t = t.replace(/`([^`]+)`/g, '$1')
  t = t.replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
  t = t.replace(/\*+/g, '')
  t = t.replace(/#{1,6}\s*/g, '')
  t = t.replace(/[(（]\s*\d{1,2}\s*[)）]\s*/g, '')
  t = t.replace(/\s+/g, ' ').trim()
  return t
}

function splitSentences(singleLine: string): string[] {
  let t = singleLine.trim()
  if (!t) return []

  let chunks = t.split(/(?<=[.!?…])\s+/).map((p) => p.trim()).filter(Boolean)
  if (chunks.length === 1 && t.length > 70) {
    const byComma = t.split(/,\s+/).map((p) => p.trim()).filter(Boolean)
    if (byComma.length >= 2 && byComma.length <= 4) {
      chunks = byComma
    }
  }

  return chunks.slice(0, MAX_SENTENCES)
}

/** 첫 문단 / 둘째 문단 — 문단 사이는 \n\n (빈 줄 한 줄) */
function twoParagraphs(sentences: string[]): string {
  if (sentences.length === 0) return ''
  if (sentences.length === 1) return sentences[0]

  const mid = Math.ceil(sentences.length / 2)
  const p1 = sentences.slice(0, mid).join('\n')
  const p2 = sentences.slice(mid).join('\n')
  return `${p1}\n\n${p2}`
}

/** 마침표·물음표 뒤에서만 자르기. 말줄임표는 최후 수단. */
function truncateAtSentenceBoundary(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s
  const head = s.slice(0, maxLen)
  let best = -1
  for (let i = head.length - 1; i >= Math.floor(maxLen * 0.32); i--) {
    const ch = head[i]
    if (ch === '.' || ch === '!' || ch === '?' || ch === '…') {
      const next = head[i + 1]
      if (next === undefined || /\s/.test(next)) {
        best = i + 1
      }
    }
  }
  if (best > 0) return head.slice(0, best).trimEnd()

  const comma = head.lastIndexOf(', ')
  if (comma > Math.floor(maxLen * 0.4)) return head.slice(0, comma + 1).trimEnd()

  return head.trimEnd()
}

/**
 * 길이 상한. 둘째 문단 통째로 버리는 것을 먼저 시도해 중간 끊김을 줄인다.
 */
function capWithParagraphs(text: string, maxChars: number): string {
  const t = text.trim()
  if (t.length <= maxChars) return t

  const blocks = t.split(/\n\n+/)
  if (blocks.length >= 2) {
    const first = blocks[0].trim()
    const rest = blocks.slice(1).join('\n\n').trim()
    if (first.length <= maxChars) return first
    return truncateAtSentenceBoundary(first, maxChars)
  }

  return truncateAtSentenceBoundary(t, maxChars)
}

/**
 * 마크다운·번호 제거 → 문장별 줄 → 2문단 → 220자 이내(문장 끝 우선).
 */
export function plainifyAndCapAiSummary(input: string | null | undefined): string | null {
  if (input == null) return null
  const flat = stripNoiseToSingleLine(input)
  if (!flat) return null

  const sentences = splitSentences(flat)
  const body = sentences.length > 0 ? twoParagraphs(sentences) : flat
  const capped = capWithParagraphs(body, AI_SUMMARY_MAX_CHARS)
  const result = capped.trim()
  return result.length > 0 ? result : null
}

export function sanitizeAiSummaryText(input: string | null | undefined): string | null {
  return plainifyAndCapAiSummary(input)
}

/** UI: 문단별로 나눈 블록 (빈 줄 기준) */
export function splitAiSummaryParagraphs(text: string | null | undefined): string[] {
  if (text == null || !text.trim()) return []
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** UI·저장 공통: AI 총평 최대 길이 (줄바꿈 포함 공백·글자 수) */
export const AI_SUMMARY_MAX_CHARS = 300

/** 화면에 보이는 최대 문장(줄) 수 — 스캔하기 쉽게 */
const MAX_SUMMARY_LINES = 4

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
  // (1) (2) （１） 등
  t = t.replace(/[(（]\s*\d{1,2}\s*[)）]\s*/g, '')
  t = t.replace(/\s+/g, ' ').trim()
  return t
}

/**
 * 마침표·느낌표 등 뒤 공백 기준으로 문장 쪼개기. 한 줄만이면 쉼표로 2~3 덩어리 시도.
 */
function splitIntoShortLines(singleLine: string): string[] {
  let t = singleLine.trim()
  if (!t) return []

  let chunks = t.split(/(?<=[.!?…])\s+/).map((p) => p.trim()).filter(Boolean)
  if (chunks.length === 1 && t.length > 90) {
    const byComma = t.split(/,\s+/).map((p) => p.trim()).filter(Boolean)
    if (byComma.length >= 2 && byComma.length <= 5) {
      chunks = byComma
    }
  }

  return chunks.slice(0, MAX_SUMMARY_LINES)
}

/** 줄 단위로 쌓되 전체 글자 수 상한 준수 */
function capByLines(lines: string[], maxChars: number): string {
  const out: string[] = []
  let used = 0
  for (const line of lines) {
    const sep = out.length > 0 ? 1 : 0
    if (used + sep + line.length <= maxChars) {
      out.push(line)
      used += sep + line.length
      continue
    }
    const room = maxChars - used - sep
    if (room >= 12) {
      const frag = line.slice(0, room - 1).trimEnd()
      if (frag.length > 0) out.push(`${frag}…`)
    }
    break
  }
  if (out.length === 0 && lines[0]) {
    const one = lines[0].slice(0, maxChars - 1).trimEnd()
    return one.length > 0 ? `${one}…` : ''
  }
  return out.join('\n')
}

/**
 * 마크다운·번호 접두 제거 → 짧은 문장별 줄바꿈 → 300자 이내.
 * DB 저장·화면 표시 공통.
 */
export function plainifyAndCapAiSummary(input: string | null | undefined): string | null {
  if (input == null) return null
  const flat = stripNoiseToSingleLine(input)
  if (!flat) return null

  const lines = splitIntoShortLines(flat)
  const merged = lines.length > 0 ? capByLines(lines, AI_SUMMARY_MAX_CHARS) : capByLines([flat], AI_SUMMARY_MAX_CHARS)

  const result = merged.trim()
  return result.length > 0 ? result : null
}

/** @deprecated 이름 호환 */
export function sanitizeAiSummaryText(input: string | null | undefined): string | null {
  return plainifyAndCapAiSummary(input)
}

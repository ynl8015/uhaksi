/** UI·저장 공통: AI 총평 최대 길이 (공백 포함 글자 수) */
export const AI_SUMMARY_MAX_CHARS = 300

/**
 * 마크다운·목록 흔적을 제거하고 한 덩어리 문장 흐름으로 만든 뒤 길이를 제한한다.
 * DB에 이미 저장된 긴/마크다운 응답도 동일하게 정리된다.
 */
export function plainifyAndCapAiSummary(input: string | null | undefined): string | null {
  if (input == null) return null
  let s = input.replace(/\r\n/g, '\n').trim()
  if (!s) return null

  // 선행 마크다운 제목 줄 제거
  const lines0 = s.split('\n')
  let i = 0
  while (i < lines0.length && /^#{1,6}\s/.test(lines0[i].trim())) {
    i++
  }
  s = lines0.slice(i).join('\n').trim()
  if (!s) return null

  // 구분선만 있는 줄 제거
  s = s
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^(\*{3,}|-{3,}|_{3,})$/.test(line))
    .join('\n')

  // 줄 단위: 목록 마커·숫자 목록 앞부분만 가볍게 정리 후 한 줄로 합침
  const parts = s.split('\n').map((line) => {
    let t = line.trim()
    t = t.replace(/^#{1,6}\s+/, '')
    t = t.replace(/^[-*+]\s+/, '')
    t = t.replace(/^\d+[.)]\s+/, '')
    return t
  })
  s = parts.filter(Boolean).join(' ')

  // **굵게** 반복 제거
  while (/\*\*[^*]+\*\*/.test(s)) {
    s = s.replace(/\*\*([^*]+)\*\*/g, '$1')
  }
  s = s.replace(/\*\*/g, '')

  // `코드`, 링크 [텍스트](url) → 텍스트만
  s = s.replace(/`([^`]+)`/g, '$1')
  s = s.replace(/\[([^\]]+)]\([^)]+\)/g, '$1')

  s = s.replace(/\*+/g, '')
  s = s.replace(/#{1,6}\s*/g, '')
  s = s.replace(/\s+/g, ' ').trim()

  if (!s) return null
  const max = AI_SUMMARY_MAX_CHARS
  if (s.length <= max) return s
  const cut = s.slice(0, max - 1).trimEnd()
  return `${cut}…`
}

/** @deprecated 이름 호환 — plainifyAndCapAiSummary와 동일 */
export function sanitizeAiSummaryText(input: string | null | undefined): string | null {
  return plainifyAndCapAiSummary(input)
}

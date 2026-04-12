/**
 * Claude가 마크다운 제목(## …)으로 시작하는 경우 UI에 그대로 노출되는 것을 막는다.
 * DB에 이미 저장된 문자열도 안전하게 보이도록 클라이언트·서버 어디서든 재사용 가능.
 */
export function sanitizeAiSummaryText(input: string | null | undefined): string | null {
  if (input == null) return null
  const raw = input.replace(/\r\n/g, '\n').trim()
  if (!raw) return null

  const lines = raw.split('\n')
  let i = 0
  while (i < lines.length && /^#{1,6}\s/.test(lines[i].trim())) {
    i++
  }
  const body = lines.slice(i).join('\n').trim()
  if (body.length > 0) return body

  const stripped = raw
    .split('\n')
    .map((line) => line.replace(/^#{1,6}\s+/, '').trimEnd())
    .join('\n')
    .trim()
  return stripped.length > 0 ? stripped : null
}

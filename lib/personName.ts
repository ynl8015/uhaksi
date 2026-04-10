/** 학생증 인증 등: 가입 이름과 카드 표기 비교용 (공백·유니코드만 정규화) */
export function normalizePersonNameForMatch(s: string): string {
  return s.normalize('NFC').trim().replace(/\s+/g, '')
}

/** 로그인 아이디: 영문 소문자·숫자만 써도 되고, 밑줄(_)은 넣어도 됨. 4~20자, 저장 시 소문자 */
export const LOGIN_ID_RE = /^[a-z0-9_]{4,20}$/

export function normalizeLoginId(raw: string): string {
  return raw.trim().toLowerCase()
}

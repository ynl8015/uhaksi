/** 커뮤니티 노출용 소속 라벨 (실명 대신 익명 + 학교/운영) */
export function communityAuthorSchool(u: {
  isAdmin: boolean
  verifiedSchoolName: string | null
}): string {
  if (u.isAdmin) return '운영'
  const t = u.verifiedSchoolName?.trim()
  return t && t.length > 0 ? t : '소속 미등록'
}

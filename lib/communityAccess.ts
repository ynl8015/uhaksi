import type { AccountKind } from '@/types/accountKind'

/** 커뮤니티: 인증된 학생 또는 관리자(학생증 인증 생략) */
export function canAccessStudentCommunity(
  u:
    | {
        accountKind: AccountKind
        studentVerified: boolean
        isAdmin: boolean
      }
    | null
    | undefined,
): boolean {
  if (!u) return false
  if (u.isAdmin) return true
  return u.accountKind === 'STUDENT' && u.studentVerified === true
}

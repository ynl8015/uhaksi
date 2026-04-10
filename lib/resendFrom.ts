import { SITE_CONTACT_EMAIL } from '@/lib/siteContact'

/** Resend `from`: 표시 이름 + 도메인 인증 주소 (스팸 필터에 유리) */
export const RESEND_FROM = '우리학교시험 <noreply@uhaksi.kr>'

/** 문의 가능한 주소 — reply-to로 두면 일부 메일함에서 신뢰도에 도움이 될 수 있음 */
export const RESEND_REPLY_TO = SITE_CONTACT_EMAIL

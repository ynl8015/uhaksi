/** 공개 사이트 원점 (trailing slash 없음). 배포 환경에 NEXT_PUBLIC_SITE_URL 필수. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!raw) return 'http://localhost:3000'
  return raw.replace(/\/$/, '')
}

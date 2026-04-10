import { getSiteUrl } from '@/lib/siteUrl'

/** Google 등 구조화 데이터(WebSite) — 홈에만 삽입 */
export default function WebSiteJsonLd() {
  const base = getSiteUrl()
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '우리학교시험',
    alternateName: ['우리 학교 시험', 'uhaksi'],
    url: base,
    description: '전국 고등학교 시험 범위, 교재, 출제 유형을 공유하는 서비스',
    inLanguage: 'ko-KR',
  }
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}

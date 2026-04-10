import type { CommunityCategory } from '@/types/communityCategory'

export type { CommunityCategory }

export const COMMUNITY_TAB_LABELS: Record<CommunityCategory, string> = {
  QA: '질문·답변',
  STUDY_TIP: '공부법 팁',
  STUDY_PROOF: '공부 인증',
}

export const communityShell = {
  pageBg: '#f4f5f7',
  cardBg: '#ffffff',
  line: '#e8eaed',
  lineSoft: '#f0f1f3',
  tabOn: '#111827',
  tabOff: '#ffffff',
  tabBorder: '#e5e7eb',
} as const

const COMMUNITY_TIMEZONE = 'Asia/Seoul' as const

/** 서버(UTC)·클라이언트(로컬)와 무관하게 항상 한국 표준시로 표시 */
export function formatCommunityDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    timeZone: COMMUNITY_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PersonGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ color: '#9ca3af', flexShrink: 0 }}
    >
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 20.25v-.35c0-2.35 2.15-4.15 6.5-4.15s6.5 1.8 6.5 4.15v.35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CommunityMetaRow({
  school,
  date,
  tightTop,
}: {
  school: string
  date: string
  /** 제목 바로 아래 한 줄 레이아웃에서 위쪽 여백을 줄일 때 */
  tightTop?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px 10px',
        fontSize: '12px',
        color: '#6b7280',
        marginTop: tightTop ? 0 : '6px',
      }}
    >
      <PersonGlyph />
      <span style={{ fontWeight: 700, color: '#374151' }}>익명</span>
      <span style={{ color: '#d1d5db', userSelect: 'none' }}>|</span>
      <span style={{ fontWeight: 600, color: '#4b5563' }}>{school}</span>
      <span style={{ color: '#d1d5db', userSelect: 'none' }}>·</span>
      <time dateTime={date} style={{ fontWeight: 500 }}>
        {formatCommunityDate(date)}
      </time>
    </div>
  )
}

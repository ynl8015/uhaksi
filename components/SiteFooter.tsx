import Link from 'next/link'
import { SITE_CONTACT_EMAIL } from '@/lib/siteContact'

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          maxWidth: '980px',
          margin: '0 auto',
          padding: '32px 24px 40px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text)' }}>
          우리학교시험
        </p>
        <div
          style={{
            marginTop: '14px',
            fontSize: '12px',
            lineHeight: 1.65,
            color: 'var(--muted)',
            maxWidth: '720px',
          }}
        >
          <p style={{ margin: 0 }}>
            전국 고등학교 시험 범위·유형 정보를 공유하는 서비스입니다.
          </p>
          <p style={{ margin: '10px 0 0' }}>
            문의:{' '}
            <a href={`mailto:${SITE_CONTACT_EMAIL}`} style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}>
              {SITE_CONTACT_EMAIL}
            </a>
          </p>
        </div>

        <nav
          style={{
            marginTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px 18px',
            fontSize: '12px',
            fontWeight: 600,
          }}
          aria-label="법적 안내"
        >
          <Link href="/terms" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            이용약관
          </Link>
          <Link href="/privacy" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 800 }}>
            개인정보처리방침
          </Link>
        </nav>

        <p style={{ margin: '18px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
          © {year} 우리학교시험. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

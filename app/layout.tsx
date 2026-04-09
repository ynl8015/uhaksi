import type { Metadata } from 'next'
import Image from 'next/image'
import './globals.css'
import Link from 'next/link'
import Providers from '@/components/Providers'
import AuthButton from '@/components/AuthButton'
import appIcon from './icon.png'

export const metadata: Metadata = {
  title: '우리학교시험 | 학교 시험 정보 공유',
  description: '전국 고등학교 시험 범위, 교재, 출제 유형을 공유하는 서비스',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '우리학교시험 | 학교 시험 정보 공유',
    description: '전국 고등학교 시험 범위, 교재, 출제 유형을 공유하는 서비스',
    url: '/',
    siteName: '우리학교시험',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <Providers>
          <nav
            style={{
              background: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
              position: 'sticky',
              top: 0,
              zIndex: 50,
              backdropFilter: 'saturate(180%) blur(8px)',
            }}
          >
            <div
              style={{
                maxWidth: '980px',
                margin: '0 auto',
                padding: '0 24px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link
                  href="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                  }}
                >
                  <Image
                    src={appIcon}
                    alt="우리학교시험"
                    width={36}
                    height={36}
                    priority
                    style={{ display: 'block', borderRadius: '10px', flexShrink: 0 }}
                  />
                  <span
                    style={{ fontSize: '18px', fontWeight: 1000, letterSpacing: '-0.5px', color: 'var(--text)' }}
                  >
                    우리학교시험
                  </span>
                </Link>
                <span
                  aria-hidden
                  style={{
                    color: 'var(--muted)',
                    fontSize: '15px',
                    fontWeight: 300,
                    opacity: 0.65,
                    userSelect: 'none',
                  }}
                >
                  |
                </span>
                <Link
                  href="/community"
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--muted)',
                    textDecoration: 'none',
                    letterSpacing: '-0.2px',
                  }}
                >
                  커뮤니티
                </Link>
              </div>
              <AuthButton />
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  )
}
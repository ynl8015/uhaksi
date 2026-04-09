import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import Providers from '@/components/Providers'
import AuthButton from '@/components/AuthButton'
import Badge from '@/components/ui/Badge'

export const metadata: Metadata = {
  title: '우리학교시험 | 학교 시험 정보 공유',
  description: '전국 고등학교 시험 범위, 교재, 출제 유형을 공유하는 서비스',
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
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 1000, letterSpacing: '-0.5px', color: 'var(--text)' }}>
                  우리학교시험
                </span>
                <Badge tone="accent">시험정보</Badge>
              </Link>
              <AuthButton />
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  )
}
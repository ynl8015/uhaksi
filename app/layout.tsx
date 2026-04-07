import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Providers from "@/components/Providers";
import AuthButton from "@/components/AuthButton";

export const metadata: Metadata = {
  title: "우리학교시험 | 학교 시험 정보 공유",
  description: "전국 고등학교 시험 범위, 교재, 출제 유형을 공유하는 서비스",
};

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
          <nav style={{ background: 'var(--sage-dark)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ color: '#f0f7f2', fontSize: '17px', fontWeight: '600', textDecoration: 'none', letterSpacing: '-0.3px' }}>
              우리학교시험
            </Link>
            <AuthButton />
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  )
}
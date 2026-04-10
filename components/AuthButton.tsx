'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import Button from '@/components/ui/Button'

function PendingVerifyBadge() {
  const [hover, setHover] = useState(false)
  return (
    <Link
      href="/account/verify"
      title="학생증 인증하고 커뮤니티 이용하기"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.03em',
        color: hover ? 'var(--accent-strong)' : 'var(--muted)',
        padding: '3px 9px',
        borderRadius: '999px',
        border: `1px solid ${hover ? 'var(--accent)' : 'rgba(17, 24, 39, 0.14)'}`,
        background: hover ? 'var(--accent-soft)' : 'rgba(17, 24, 39, 0.04)',
        textDecoration: 'none',
        lineHeight: 1.25,
        transition: 'color 0.15s ease, border-color 0.15s ease, background 0.15s ease, transform 0.15s ease',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover ? '0 2px 8px rgba(17, 24, 39, 0.06)' : 'none',
      }}
    >
      미인증
    </Link>
  )
}

export default function AuthButton() {
  const { data: session } = useSession()

  const navBtnStyle = {
    background: 'transparent',
    color: 'var(--text)',
    borderColor: 'var(--border)',
    padding: '7px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 700,
  } as const

  if (session) {
    const u = session.user
    const showPendingBadge =
      u?.accountKind === 'STUDENT' && u.studentVerified === false && u.isAdmin !== true

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            href="/account"
            title="마이페이지"
            style={{
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: 800,
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
            }}
            className="auth-name-link"
          >
            {u?.name}님
          </Link>
          {showPendingBadge ? <PendingVerifyBadge /> : null}
        </div>
        <Button type="button" onClick={() => signOut()} variant="secondary" style={navBtnStyle}>
          로그아웃
        </Button>
      </div>
    )
  }

  return (
    <Link href="/login" style={{ textDecoration: 'none' }}>
      <Button type="button" variant="secondary" style={navBtnStyle}>
        로그인
      </Button>
    </Link>
  )
}

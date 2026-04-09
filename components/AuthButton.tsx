'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

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
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'var(--text)', fontSize: '14px', fontWeight: 800 }}>
          {session.user?.name}님
        </span>
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
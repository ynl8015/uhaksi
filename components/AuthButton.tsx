'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#c8dece', fontSize: '13px' }}>
          {session.user?.name}님
        </span>
        <button
          onClick={() => signOut()}
          style={{
            background: 'transparent',
            color: '#c8dece',
            border: '0.5px solid rgba(255,255,255,0.25)',
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <Link href="/login" style={{
      background: 'transparent',
      color: '#c8dece',
      border: '0.5px solid rgba(255,255,255,0.25)',
      padding: '7px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'none',
    }}>
      로그인
    </Link>
  )
}
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#c8dece', fontSize: '13px' }}>
          {session.user?.name}님
        </span>
        <Button
          type="button"
          onClick={() => signOut()}
          variant="secondary"
          style={{
            background: 'transparent',
            color: '#c8dece',
            borderColor: 'rgba(255,255,255,0.25)',
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          로그아웃
        </Button>
      </div>
    )
  }

  return (
    <Link href="/login" style={{ textDecoration: 'none' }}>
      <Button
        type="button"
        variant="secondary"
        style={{
          background: 'transparent',
          color: '#c8dece',
          borderColor: 'rgba(255,255,255,0.25)',
          padding: '7px 16px',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        로그인
      </Button>
    </Link>
  )
}
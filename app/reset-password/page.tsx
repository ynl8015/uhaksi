'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'

function ResetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    fontSize: '15px',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const submit = async () => {
    setMessage('')
    if (password.length < 8) {
      setMessage('비밀번호는 8자 이상이어야 해요.')
      return
    }
    if (password !== password2) {
      setMessage('비밀번호가 서로 달라요.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setMessage(data.error ?? '다시 시도해주세요.')
      return
    }
    router.push('/login?reset=ok')
  }

  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
        background: 'var(--pastel-mint)',
        padding: '24px',
      }}
    >
      <div className="ui-card" style={{ padding: '28px', width: '100%', maxWidth: '420px', boxShadow: 'var(--ui-shadow-lg)' }}>
        <h1 style={{ color: 'var(--text)', fontSize: '22px', fontWeight: 1000, marginBottom: '8px', letterSpacing: '-0.4px' }}>
          새 비밀번호 설정
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '22px', lineHeight: 1.6 }}>
          새로 쓸 비밀번호를 입력해주세요.
        </p>

        {!token ? (
          <p style={{ color: '#991b1b', fontSize: '14px', marginBottom: '16px' }}>유효한 링크가 아니에요.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input
              className="ui-input"
              type="password"
              placeholder="새 비밀번호 (8자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              className="ui-input"
              type="password"
              placeholder="새 비밀번호 확인"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              style={inputStyle}
            />
            <Button onClick={submit} disabled={loading} variant="primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
              {loading ? '저장 중…' : '비밀번호 변경'}
            </Button>
          </div>
        )}

        {message ? (
          <p style={{ color: 'var(--accent-strong)', fontSize: '14px', marginBottom: '16px' }}>{message}</p>
        ) : null}

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
          <Link href="/login" style={{ color: 'var(--accent-strong)', fontWeight: 900, textDecoration: 'none' }}>
            로그인으로
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  )
}

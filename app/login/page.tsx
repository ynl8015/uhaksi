'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'

function LoginPageInner() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const error = searchParams.get('error')

  const handleLogin = async () => {
    setLoading(true)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/')
    } else {
      setMessage('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()

    if (res.ok) {
      setMessage('인증 이메일을 발송했습니다. 이메일을 확인해주세요.')
    } else {
      setMessage(data.error)
    }
    setLoading(false)
  }

  const inputStyle = {
    fontSize: '15px',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
        background: 'var(--pastel-blue)',
        padding: '24px',
      }}
    >
      <div className="ui-card" style={{ padding: '28px', width: '100%', maxWidth: '420px', boxShadow: 'var(--ui-shadow-lg)' }}>
        <h1 style={{ color: 'var(--text)', fontSize: '22px', fontWeight: 1000, marginBottom: '8px', letterSpacing: '-0.4px' }}>
          {mode === 'login' ? '로그인' : '회원가입'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '22px', lineHeight: 1.6 }}>
          {mode === 'login' ? '우리학교시험에 오신걸 환영해요' : '이메일로 가입하고 시험 정보를 공유해요'}
        </p>

        {verified && (
          <div
            style={{
              background: 'var(--pastel-mint)',
              border: '1px solid rgba(17, 24, 39, 0.08)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '16px',
              color: 'var(--text)',
              fontSize: '14px',
            }}
          >
            이메일 인증이 완료됐어요! 로그인해주세요.
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(180, 35, 24, 0.08)',
              border: '1px solid rgba(180, 35, 24, 0.18)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '16px',
              color: '#991b1b',
              fontSize: '14px',
            }}
          >
            유효하지 않은 인증 링크입니다.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {mode === 'register' && (
            <input
              className="ui-input"
              type="text"
              placeholder="이름 (예: 홍길동)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            className="ui-input"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            className="ui-input"
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
            style={inputStyle}
          />
        </div>

        {message && (
          <p style={{ color: 'var(--accent-strong)', fontSize: '14px', marginBottom: '16px' }}>
            {message}
          </p>
        )}

        <Button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          disabled={loading}
          variant="primary"
          style={{ width: '100%', padding: '12px', fontSize: '15px', marginBottom: '16px' }}
        >
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </Button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
          {mode === 'login' ? '아직 계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage('') }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-strong)', cursor: 'pointer', fontSize: '14px', fontWeight: 900 }}
          >
            {mode === 'login' ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  )
}
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
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
    padding: '11px 14px',
    border: '1px solid var(--sage-border)',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    color: 'var(--sage-text)',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  return (
    <main style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 60px)',
      background: 'var(--sage-lightest)',
      padding: '24px',
    }}>
      <div style={{
        background: 'white',
        border: '0.5px solid var(--sage-border)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h1 style={{ color: 'var(--sage-text)', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
          {mode === 'login' ? '로그인' : '회원가입'}
        </h1>
        <p style={{ color: 'var(--sage-muted)', fontSize: '14px', marginBottom: '32px' }}>
          {mode === 'login' ? '우리학교시험에 오신걸 환영해요' : '이메일로 가입하고 시험 정보를 공유해요'}
        </p>

        {verified && (
          <div style={{ background: '#e8f2ec', border: '0.5px solid var(--sage-border)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: 'var(--sage-text)', fontSize: '14px' }}>
            이메일 인증이 완료됐어요! 로그인해주세요.
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', border: '0.5px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#991b1b', fontSize: '14px' }}>
            유효하지 않은 인증 링크입니다.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="이름 (예: 홍길동)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
            style={inputStyle}
          />
        </div>

        {message && (
          <p style={{ color: 'var(--sage-button)', fontSize: '14px', marginBottom: '16px' }}>
            {message}
          </p>
        )}

        <button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          disabled={loading}
          style={{
            width: '100%',
            background: 'var(--sage-button)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: '16px',
          }}
        >
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--sage-muted)' }}>
          {mode === 'login' ? '아직 계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage('') }}
            style={{ background: 'none', border: 'none', color: 'var(--sage-button)', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            {mode === 'login' ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>
    </main>
  )
}
'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'

type Tab = 'id' | 'password'

function ForgotInner() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'id' ? 'id' : 'password'
  const [tab, setTab] = useState<Tab>(initialTab)

  const [name, setName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')

  const [email, setEmail] = useState('')

  const [message, setMessage] = useState('')
  const [idVerified, setIdVerified] = useState(false)
  const [foundLoginId, setFoundLoginId] = useState('')
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    fontSize: '15px',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const findId = async () => {
    setLoading(true)
    setMessage('')
    setIdVerified(false)
    setFoundLoginId('')
    const res = await fetch('/api/auth/find-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: signupEmail.trim(),
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (res.ok && data.ok && typeof data.loginId === 'string') {
      setFoundLoginId(data.loginId)
      setIdVerified(true)
      return
    }
    setMessage(data.error ?? '다시 시도해주세요.')
  }

  const forgotPw = async () => {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setMessage(data.error ?? '요청에 실패했어요.')
      return
    }
    setMessage(data.message ?? '')
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
          계정 찾기
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
          가입할 때 적은 <b>이메일 주소</b>와 <b>이름</b>으로 본인 확인을 하면, 로그인할 때 쓰는 <b>아이디</b>가 무엇인지 알려드려요.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setTab('id')
              setMessage('')
              setIdVerified(false)
              setFoundLoginId('')
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '12px',
              border: tab === 'id' ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: tab === 'id' ? 'var(--accent-soft)' : 'var(--bg)',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('password')
              setMessage('')
              setIdVerified(false)
              setFoundLoginId('')
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '12px',
              border: tab === 'password' ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: tab === 'password' ? 'var(--accent-soft)' : 'var(--bg)',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            비밀번호 찾기
          </button>
        </div>

        {tab === 'id' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input
              className="ui-input"
              type="text"
              placeholder="가입 시 이름 (예: 홍길동)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              className="ui-input"
              type="email"
              placeholder="가입 시 등록한 이메일 주소"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && findId()}
              style={inputStyle}
            />
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
              로그인 <b>아이디</b>는 이메일과 <b>다른</b> 값이에요. 아이디를 잊었다면 이름·이메일로 찾을 수 있어요.
            </p>
            <Button onClick={findId} disabled={loading} variant="primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
              {loading ? '확인 중…' : '본인 확인하기'}
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input
              className="ui-input"
              type="email"
              placeholder="가입한 이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && forgotPw()}
              style={inputStyle}
            />
            <Button onClick={forgotPw} disabled={loading} variant="primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
              {loading ? '발송 중…' : '재설정 링크 보내기'}
            </Button>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.55 }}>
              인증을 마친 계정만 메일이 발송돼요. 메일의 링크는 1시간 동안 유효해요.
            </p>
          </div>
        )}

        {idVerified && foundLoginId ? (
          <div
            style={{
              background: 'var(--pastel-mint)',
              border: '1px solid rgba(17, 24, 39, 0.08)',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
              color: 'var(--text)',
              fontSize: '15px',
              lineHeight: 1.65,
            }}
          >
            본인 확인이 완료됐어요.
            <br />
            <br />
            회원님의 <strong>로그인 아이디</strong>는 아래와 같아요.
            <br />
            <strong style={{ fontSize: '17px', letterSpacing: '0.03em' }}>{foundLoginId}</strong>
            <br />
            <br />
            이 아이디와 비밀번호로 로그인해 주세요. (이메일은 로그인에 쓰지 않아요.)
          </div>
        ) : null}

        {message && !idVerified ? (
          <p style={{ color: tab === 'password' ? 'var(--text)' : 'var(--accent-strong)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.55 }}>
            {message}
          </p>
        ) : null}

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
          <Link href="/login" style={{ color: 'var(--accent-strong)', fontWeight: 900, textDecoration: 'none' }}>
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function ForgotPage() {
  return (
    <Suspense fallback={null}>
      <ForgotInner />
    </Suspense>
  )
}

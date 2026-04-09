'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default function StudentVerifyPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'loading') {
    return (
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px 48px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>불러오는 중…</p>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px 48px' }}>
        <Card pastel="yellow" style={{ padding: '20px' }}>
          <p className="ui-title" style={{ margin: '0 0 8px', color: 'var(--text)' }}>
            로그인이 필요해요
          </p>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
            학생증 인증은 로그인 후 진행할 수 있어요.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link href="/login" style={{ fontWeight: 800, color: 'var(--accent-strong)', textDecoration: 'none' }}>
              로그인하기 →
            </Link>
          </div>
        </Card>
      </main>
    )
  }

  const u = session?.user
  if (!u) return null

  if (u.isAdmin) {
    return (
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px 48px' }}>
        <Card pastel="mint" style={{ padding: '20px' }}>
          <Badge tone="accent">관리자</Badge>
          <p className="ui-title" style={{ margin: '12px 0 8px', color: 'var(--text)' }}>
            관리자 계정이에요
          </p>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65 }}>
            학생증 인증 없이 커뮤니티를 이용할 수 있어요. 일반 학생 계정과 동일한 권한으로 글을 읽고 쓸 수 있습니다.
          </p>
          <div style={{ marginTop: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button type="button" variant="primary" size="md" onClick={() => router.push('/community')}>
              커뮤니티 가기
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={() => router.push('/')}>
              홈으로
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  if (u.accountKind !== 'STUDENT') {
    return (
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px 48px' }}>
        <Card pastel="mint" style={{ padding: '20px' }}>
          <Badge tone="accent">안내</Badge>
          <p className="ui-title" style={{ margin: '12px 0 8px', color: 'var(--text)' }}>
            학생 계정만 인증할 수 있어요
          </p>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65 }}>
            회원가입 시 &quot;학생&quot;으로 선택한 계정만 학생증 인증과 커뮤니티 이용이 가능해요.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link href="/" style={{ fontWeight: 800, color: 'var(--accent-strong)', textDecoration: 'none' }}>
              홈으로
            </Link>
          </div>
        </Card>
      </main>
    )
  }

  if (u.studentVerified && u.verifiedSchoolName) {
    return (
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px 48px' }}>
        <Card pastel="mint" style={{ padding: '20px' }}>
          <Badge tone="accent">인증 완료</Badge>
          <p className="ui-title" style={{ margin: '12px 0 8px', color: 'var(--text)' }}>
            {u.verifiedSchoolName}
          </p>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65 }}>
            학생 인증이 완료된 계정이에요. 커뮤니티를 이용할 수 있어요.
          </p>
          <div style={{ marginTop: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button type="button" variant="primary" size="md" onClick={() => router.push('/community')}>
              커뮤니티 가기
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={() => router.push('/')}>
              홈으로
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setMessage('학생증 사진을 선택해 주세요.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/account/student-verify', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(typeof data.error === 'string' ? data.error : '인증에 실패했어요.')
        setLoading(false)
        return
      }
      await update({
        studentVerified: true,
        verifiedSchoolName: data.schoolName ?? null,
      })
      router.refresh()
      setMessage('')
    } catch {
      setMessage('네트워크 오류가 났어요. 잠시 후 다시 시도해 주세요.')
    }
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px 48px' }}>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 1000,
          letterSpacing: '-0.4px',
          color: 'var(--text)',
          margin: '0 0 8px',
        }}
      >
        학생증 인증
      </h1>
      <p style={{ margin: '0 0 22px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65 }}>
        학생증(또는 재학을 확인할 수 있는 카드) 사진을 올리면 AI가 학교명을 확인해요. 인증 후 커뮤니티를 이용할 수
        있어요.
      </p>

      <Card pastel="yellow" style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
            사진 선택 (JPG / PNG / WEBP, 최대 5MB)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(ev) => setFile(ev.target.files?.[0] ?? null)}
            style={{ fontSize: '14px', width: '100%' }}
          />
          {message ? (
            <p style={{ margin: '14px 0 0', color: 'var(--accent-strong)', fontSize: '14px' }}>{message}</p>
          ) : null}
          <div style={{ marginTop: '18px' }}>
            <Button type="submit" variant="primary" size="md" disabled={loading || !file}>
              {loading ? '확인 중…' : '인증 요청'}
            </Button>
          </div>
        </form>
      </Card>

      <p style={{ margin: '20px 0 0', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
        개인정보가 보이는 부분은 가리고 올리셔도 돼요. 다만 학교명이 잘 보이도록 촬영해 주세요.
      </p>
    </main>
  )
}

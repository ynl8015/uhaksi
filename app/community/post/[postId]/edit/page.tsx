'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import {
  COMMUNITY_TAB_LABELS,
  type CommunityCategory,
  communityShell as shell,
} from '@/components/CommunityShared'
import { canAccessStudentCommunity } from '@/lib/communityAccess'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      if (typeof r.result === 'string') resolve(r.result)
      else reject(new Error('read'))
    }
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

type Loaded = {
  id: number
  category: CommunityCategory
  title: string | null
  body: string
  imageData: string | null
  isAuthor: boolean
}

export default function CommunityPostEditPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const rawId = params.postId
  const postId = typeof rawId === 'string' ? Number(rawId) : Number(Array.isArray(rawId) ? rawId[0] : NaN)

  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [loadError, setLoadError] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitMsg, setSubmitMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canAccess = canAccessStudentCommunity(session?.user)

  const load = useCallback(async () => {
    if (!Number.isFinite(postId)) {
      setLoadError('잘못된 주소예요.')
      return
    }
    setLoadError('')
    try {
      const res = await fetch(`/api/community/posts/${postId}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoadError(typeof data.error === 'string' ? data.error : '불러오지 못했어요.')
        return
      }
      const p = data.post as Loaded & { authorSchool?: string }
      if (!p?.isAuthor) {
        router.replace(`/community/post/${postId}`)
        return
      }
      setLoaded({
        id: p.id,
        category: p.category,
        title: p.title,
        body: p.body,
        imageData: p.imageData,
        isAuthor: p.isAuthor,
      })
      setTitle(p.title ?? '')
      setBody(p.body ?? '')
    } catch {
      setLoadError('네트워크 오류가 났어요.')
    }
  }, [postId, router])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated' || !canAccess) return
    load()
  }, [status, canAccess, load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loaded) return
    setSubmitMsg('')
    const trimmed = body.trim()
    if (!trimmed) {
      setSubmitMsg('내용을 입력해 주세요.')
      return
    }
    if (loaded.category === 'STUDY_PROOF' && !loaded.imageData && !imageFile) {
      setSubmitMsg('공부 인증에는 사진이 필요해요.')
      return
    }

    setSubmitting(true)
    try {
      const payload: { title?: string; body?: string; imageData?: string } = {
        title: title.trim(),
        body: trimmed,
      }
      if (loaded.category === 'STUDY_PROOF' && imageFile) {
        payload.imageData = await fileToDataUrl(imageFile)
      }

      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitMsg(typeof data.error === 'string' ? data.error : '저장에 실패했어요.')
        setSubmitting(false)
        return
      }
      router.push(`/community/post/${postId}`)
    } catch {
      setSubmitMsg('네트워크 오류가 났어요.')
    }
    setSubmitting(false)
  }

  if (status === 'loading' || (canAccess && !loaded && !loadError)) {
    return (
      <main style={{ minHeight: 'calc(100vh - 64px)', background: shell.pageBg, padding: '28px 20px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>불러오는 중…</p>
      </main>
    )
  }

  if (status === 'unauthenticated' || !canAccess) {
    return (
      <main style={{ minHeight: 'calc(100vh - 64px)', background: shell.pageBg, padding: '28px 20px' }}>
        <Card pastel="yellow" style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
          <p style={{ margin: 0, fontWeight: 800 }}>수정할 수 없어요</p>
          <Link href="/community" style={{ marginTop: '12px', display: 'inline-block' }}>
            커뮤니티로
          </Link>
        </Card>
      </main>
    )
  }

  if (loadError || !loaded) {
    return (
      <main style={{ minHeight: 'calc(100vh - 64px)', background: shell.pageBg, padding: '28px 20px' }}>
        <p style={{ color: '#dc2626' }}>{loadError || '글을 찾을 수 없어요.'}</p>
        <Link href={`/community/post/${postId}`}>← 돌아가기</Link>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: shell.pageBg,
        padding: '28px 20px 48px',
      }}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#111827' }}>글 수정</h1>
          <Link href={`/community/post/${postId}`} style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', textDecoration: 'none' }}>
            취소
          </Link>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#9ca3af' }}>
          {COMMUNITY_TAB_LABELS[loaded.category]} · 게시판은 바꿀 수 없어요.
        </p>

        <section
          style={{
            background: shell.cardBg,
            border: `1px solid ${shell.line}`,
            borderRadius: '14px',
            padding: '22px',
          }}
        >
          {loaded.category === 'STUDY_PROOF' ? (
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#9ca3af', lineHeight: 1.55 }}>
              사진을 바꾸려면 새 파일을 선택하세요. 선택하지 않으면 기존 사진이 유지돼요.
            </p>
          ) : null}
          <form onSubmit={handleSubmit}>
            <input
              className="ui-input"
              placeholder="제목 (선택)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '10px',
                fontSize: '14px',
                boxSizing: 'border-box',
                border: `1px solid ${shell.line}`,
                borderRadius: '10px',
                background: '#fafafa',
              }}
            />
            <textarea
              className="ui-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              style={{
                width: '100%',
                resize: 'vertical',
                fontSize: '14px',
                lineHeight: 1.6,
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                border: `1px solid ${shell.line}`,
                borderRadius: '10px',
                background: '#fafafa',
              }}
            />
            {loaded.category === 'STUDY_PROOF' ? (
              <div style={{ marginTop: '14px' }}>
                {loaded.imageData && !imageFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={loaded.imageData}
                    alt=""
                    style={{ maxWidth: '100%', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${shell.lineSoft}` }}
                  />
                ) : null}
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>새 사진 (선택)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(ev) => setImageFile(ev.target.files?.[0] ?? null)}
                  style={{ display: 'block', marginTop: '6px', fontSize: '13px' }}
                />
              </div>
            ) : null}
            {submitMsg ? <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#dc2626' }}>{submitMsg}</p> : null}
            <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button type="submit" variant="primary" size="md" disabled={submitting}>
                {submitting ? '저장 중…' : '저장하기'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

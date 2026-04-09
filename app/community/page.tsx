'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import {
  type CommunityCategory,
  COMMUNITY_TAB_LABELS,
  CommunityMetaRow,
  communityShell as shell,
} from '@/components/CommunityShared'
import { canAccessStudentCommunity } from '@/lib/communityAccess'

function parseTab(q: string | null): CommunityCategory {
  if (q === 'STUDY_TIP' || q === 'STUDY_PROOF' || q === 'QA') return q
  return 'QA'
}

type PostRow = {
  id: number
  title: string | null
  body: string
  imageData: string | null
  createdAt: string
  authorSchool: string
}

function CommunityPostCard({ post }: { post: PostRow }) {
  const displayTitle = post.title?.trim() || '제목 없음'
  const titleMuted = !post.title?.trim()

  return (
    <Link
      href={`/community/post/${post.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <article
        style={{
          background: shell.cardBg,
          border: `1px solid ${shell.line}`,
          borderRadius: '14px',
          padding: '22px',
          marginBottom: '14px',
          boxShadow: '0 1px 2px rgba(17, 24, 39, 0.04)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          cursor: 'pointer',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '-0.35px',
            lineHeight: 1.45,
            color: titleMuted ? '#9ca3af' : '#111827',
          }}
        >
          {displayTitle}
        </h2>
        <CommunityMetaRow school={post.authorSchool} date={post.createdAt} />

        <div
          style={{
            marginTop: '14px',
            fontSize: '14px',
            lineHeight: 1.65,
            color: '#4b5563',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 4,
          }}
        >
          {post.body}
        </div>

        {post.imageData ? (
          <div
            style={{
              marginTop: '12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#9ca3af',
            }}
          >
            사진 첨부 · 자세히 보기
          </div>
        ) : null}
      </article>
    </Link>
  )
}

function CommunityFeedInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<CommunityCategory>('QA')
  const [posts, setPosts] = useState<PostRow[]>([])
  const [loadError, setLoadError] = useState('')
  const [loadingList, setLoadingList] = useState(true)

  const canAccess = canAccessStudentCommunity(session?.user)

  useEffect(() => {
    setTab(parseTab(searchParams.get('category')))
  }, [searchParams])

  const setTabAndUrl = (c: CommunityCategory) => {
    setTab(c)
    router.replace(`/community?category=${c}`)
  }

  const loadPosts = useCallback(async (category: CommunityCategory) => {
    setLoadingList(true)
    setLoadError('')
    try {
      const res = await fetch(`/api/community/posts?category=${category}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoadError(typeof data.error === 'string' ? data.error : '목록을 불러오지 못했어요.')
        setPosts([])
        setLoadingList(false)
        return
      }
      setPosts(Array.isArray(data.posts) ? data.posts : [])
    } catch {
      setLoadError('네트워크 오류가 났어요.')
      setPosts([])
    }
    setLoadingList(false)
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || !canAccess) {
      setLoadingList(false)
      setPosts([])
      return
    }
    loadPosts(tab)
  }, [status, canAccess, tab, loadPosts])

  if (status === 'loading') {
    return (
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 48px', background: shell.pageBg }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>불러오는 중…</p>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 48px', background: shell.pageBg }}>
        <Card pastel="yellow" style={{ padding: '20px' }}>
          <Badge tone="accent">커뮤니티</Badge>
          <p className="ui-title" style={{ margin: '12px 0 8px', color: 'var(--text)' }}>
            로그인이 필요해요
          </p>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65 }}>
            커뮤니티는 로그인 후, 학생 인증을 마친 분만 이용할 수 있어요.
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

  if (!canAccessStudentCommunity(u)) {
    if (u.accountKind !== 'STUDENT') {
      return (
        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 48px', background: shell.pageBg }}>
          <Card pastel="mint" style={{ padding: '20px' }}>
            <Badge tone="accent">안내</Badge>
            <p className="ui-title" style={{ margin: '12px 0 8px', color: 'var(--text)' }}>
              학생 전용 공간이에요
            </p>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65 }}>
              커뮤니티는 회원가입 시 &quot;학생&quot;으로 가입하고 학생증 인증을 완료한 경우에만 이용할 수 있어요.
            </p>
          </Card>
        </main>
      )
    }
    return (
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 48px', background: shell.pageBg }}>
        <Card pastel="yellow" style={{ padding: '20px' }}>
          <Badge tone="accent">학생 인증</Badge>
          <p className="ui-title" style={{ margin: '12px 0 8px', color: 'var(--text)' }}>
            학생증 인증을 먼저 완료해 주세요
          </p>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65 }}>
            상단 이름 옆 <b>미인증</b>을 누르거나, 학생증 인증 페이지에서 사진을 올려 주세요.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Button type="button" variant="primary" size="md" onClick={() => router.push('/account/verify')}>
              학생증 인증하기
            </Button>
          </div>
        </Card>
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
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <header
          style={{
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 900,
                letterSpacing: '-0.6px',
                color: '#111827',
              }}
            >
              커뮤니티
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
              {u.isAdmin ? (
                <span style={{ fontWeight: 700, color: '#374151' }}>운영 · 관리자</span>
              ) : u.verifiedSchoolName ? (
                <>
                  활동 소속 <span style={{ fontWeight: 700, color: '#374151' }}>{u.verifiedSchoolName}</span>
                </>
              ) : (
                '인증된 학생 계정'
              )}
            </p>
          </div>
          <Link
            href={`/community/write?category=${tab}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#111827',
              background: '#ffffff',
              border: `1px solid ${shell.line}`,
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(17, 24, 39, 0.04)',
              flexShrink: 0,
            }}
          >
            글쓰기+
          </Link>
        </header>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
          {(Object.keys(COMMUNITY_TAB_LABELS) as CommunityCategory[]).map((c) => {
            const on = tab === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setTabAndUrl(c)}
                style={{
                  padding: '9px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '999px',
                  border: `1px solid ${on ? shell.tabOn : shell.tabBorder}`,
                  background: on ? shell.tabOn : shell.tabOff,
                  color: on ? '#ffffff' : '#4b5563',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                }}
              >
                {COMMUNITY_TAB_LABELS[c]}
              </button>
            )
          })}
        </div>

        {loadingList ? (
          <p style={{ color: '#6b7280', fontSize: '14px' }}>불러오는 중…</p>
        ) : loadError ? (
          <p style={{ color: '#dc2626', fontSize: '14px' }}>{loadError}</p>
        ) : posts.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>아직 글이 없어요.</p>
        ) : (
          <div>
            {posts.map((p) => (
              <CommunityPostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: 'calc(100vh - 64px)', background: shell.pageBg, padding: '28px 20px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>불러오는 중…</p>
        </main>
      }
    >
      <CommunityFeedInner />
    </Suspense>
  )
}

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
  CommunityMetaRow,
  PersonGlyph,
  communityShell as shell,
  formatCommunityDate,
} from '@/components/CommunityShared'
import { canAccessStudentCommunity } from '@/lib/communityAccess'

function listHrefForCategory(category: CommunityCategory) {
  return `/community?category=${category}`
}

type CommentRow = {
  id: number
  body: string
  createdAt: string
  authorSchool: string
  isAuthor: boolean
}

type PostDetail = {
  id: number
  category: CommunityCategory
  title: string | null
  body: string
  imageData: string | null
  createdAt: string
  authorSchool: string
  isAuthor: boolean
  comments: CommentRow[]
}

export default function CommunityPostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const rawId = params.postId
  const postId = typeof rawId === 'string' ? Number(rawId) : Number(Array.isArray(rawId) ? rawId[0] : NaN)

  const [post, setPost] = useState<PostDetail | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)

  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const [commentErr, setCommentErr] = useState('')

  const [deletingPost, setDeletingPost] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentDraft, setEditCommentDraft] = useState('')
  const [savingCommentId, setSavingCommentId] = useState<number | null>(null)
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null)

  const canAccess = canAccessStudentCommunity(session?.user)

  const loadPost = useCallback(async () => {
    if (!Number.isFinite(postId)) {
      setLoadError('잘못된 주소예요.')
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')
    try {
      const res = await fetch(`/api/community/posts/${postId}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoadError(typeof data.error === 'string' ? data.error : '글을 불러오지 못했어요.')
        setPost(null)
        setLoading(false)
        return
      }
      setPost(data.post as PostDetail)
    } catch {
      setLoadError('네트워크 오류가 났어요.')
      setPost(null)
    }
    setLoading(false)
  }, [postId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false)
      return
    }
    if (status === 'loading') return
    if (!canAccess) {
      setLoading(false)
      return
    }
    loadPost()
  }, [status, canAccess, loadPost])

  const sendComment = async () => {
    const t = commentText.trim()
    if (!t || !Number.isFinite(postId)) return
    setSending(true)
    setCommentErr('')
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: t }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCommentErr(typeof data.error === 'string' ? data.error : '댓글 등록에 실패했어요.')
        setSending(false)
        return
      }
      setCommentText('')
      await loadPost()
    } catch {
      setCommentErr('네트워크 오류가 났어요.')
    }
    setSending(false)
  }

  const deletePost = async () => {
    if (!post || !Number.isFinite(postId)) return
    if (!window.confirm('이 글을 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return
    setDeletingPost(true)
    try {
      const res = await fetch(`/api/community/posts/${postId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(typeof data.error === 'string' ? data.error : '삭제에 실패했어요.')
        setDeletingPost(false)
        return
      }
      router.push(listHrefForCategory(post.category))
    } catch {
      alert('네트워크 오류가 났어요.')
    }
    setDeletingPost(false)
  }

  const saveCommentEdit = async (commentId: number) => {
    const t = editCommentDraft.trim()
    if (!t || !Number.isFinite(postId)) return
    setSavingCommentId(commentId)
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: t }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(typeof data.error === 'string' ? data.error : '수정에 실패했어요.')
        setSavingCommentId(null)
        return
      }
      setEditingCommentId(null)
      setEditCommentDraft('')
      await loadPost()
    } catch {
      alert('네트워크 오류가 났어요.')
    }
    setSavingCommentId(null)
  }

  const deleteComment = async (commentId: number) => {
    if (!Number.isFinite(postId)) return
    if (!window.confirm('이 댓글을 삭제할까요?')) return
    setDeletingCommentId(commentId)
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(typeof data.error === 'string' ? data.error : '삭제에 실패했어요.')
        setDeletingCommentId(null)
        return
      }
      if (editingCommentId === commentId) {
        setEditingCommentId(null)
        setEditCommentDraft('')
      }
      await loadPost()
    } catch {
      alert('네트워크 오류가 났어요.')
    }
    setDeletingCommentId(null)
  }

  if (status === 'loading' || (loading && !post)) {
    return (
      <main style={{ minHeight: 'calc(100vh - 64px)', background: shell.pageBg, padding: '28px 20px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>불러오는 중…</p>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <main style={{ minHeight: 'calc(100vh - 64px)', background: shell.pageBg, padding: '28px 20px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <Card pastel="yellow" style={{ padding: '20px' }}>
            <p style={{ margin: 0, fontWeight: 800 }}>로그인이 필요해요</p>
            <Link href="/login" style={{ marginTop: '12px', display: 'inline-block', fontWeight: 800, color: 'var(--accent-strong)' }}>
              로그인하기
            </Link>
          </Card>
        </div>
      </main>
    )
  }

  if (!session?.user || !canAccessStudentCommunity(session.user)) {
    return (
      <main style={{ minHeight: 'calc(100vh - 64px)', background: shell.pageBg, padding: '28px 20px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ color: '#6b7280' }}>이 글을 볼 권한이 없어요.</p>
          <Link href="/community" style={{ marginTop: '12px', display: 'inline-block', fontWeight: 700, color: '#374151' }}>
            ← 커뮤니티
          </Link>
        </div>
      </main>
    )
  }

  if (loadError || !post) {
    return (
      <main style={{ minHeight: 'calc(100vh - 64px)', background: shell.pageBg, padding: '28px 20px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ color: '#dc2626', fontSize: '14px' }}>{loadError || '글을 찾을 수 없어요.'}</p>
          <button
            type="button"
            onClick={() => router.push('/community')}
            style={{
              marginTop: '14px',
              border: 'none',
              background: 'none',
              padding: 0,
              fontWeight: 700,
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← 목록으로
          </button>
        </div>
      </main>
    )
  }

  const displayTitle = post.title?.trim() || '제목 없음'
  const titleMuted = !post.title?.trim()
  const listHref = listHrefForCategory(post.category)

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: shell.pageBg,
        padding: '28px 20px 48px',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '18px' }}>
          <Link
            href={listHref}
            style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', textDecoration: 'none' }}
          >
            ← {COMMUNITY_TAB_LABELS[post.category]}
          </Link>
        </div>

        <article
          style={{
            background: shell.cardBg,
            border: `1px solid ${shell.line}`,
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 1px 2px rgba(17, 24, 39, 0.04)',
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', color: '#9ca3af' }}>
            {COMMUNITY_TAB_LABELS[post.category]}
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.4px',
              lineHeight: 1.45,
              color: titleMuted ? '#9ca3af' : '#111827',
            }}
          >
            {displayTitle}
          </h1>
          <CommunityMetaRow school={post.authorSchool} date={post.createdAt} />

          {post.isAuthor ? (
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px 14px', alignItems: 'center' }}>
              <Link
                href={`/community/post/${postId}/edit`}
                style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-strong)', textDecoration: 'none' }}
              >
                수정
              </Link>
              <button
                type="button"
                disabled={deletingPost}
                onClick={() => void deletePost()}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  fontSize: '13px',
                  fontWeight: 700,
                  color: deletingPost ? '#d1d5db' : '#dc2626',
                  cursor: deletingPost ? 'default' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {deletingPost ? '삭제 중…' : '삭제'}
              </button>
            </div>
          ) : null}

          <div
            style={{
              marginTop: '20px',
              fontSize: '15px',
              lineHeight: 1.8,
              color: '#1f2937',
              whiteSpace: 'pre-wrap',
            }}
          >
            {post.body}
          </div>

          {post.imageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageData}
              alt=""
              style={{
                marginTop: '18px',
                maxWidth: '100%',
                borderRadius: '10px',
                border: `1px solid ${shell.lineSoft}`,
              }}
            />
          ) : null}
        </article>

        <section
          style={{
            marginTop: '16px',
            background: shell.cardBg,
            border: `1px solid ${shell.line}`,
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 1px 2px rgba(17, 24, 39, 0.04)',
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: '#111827' }}>
            댓글 {post.comments.length}
          </h2>
          {post.comments.length === 0 ? (
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#9ca3af' }}>첫 댓글을 남겨 보세요.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: '0 0 18px', padding: 0 }}>
              {post.comments.map((c, i) => (
                <li
                  key={c.id}
                  style={{
                    padding: '14px 0',
                    borderBottom: i === post.comments.length - 1 ? 'none' : `1px solid ${shell.lineSoft}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '5px 8px',
                      fontSize: '11px',
                    }}
                  >
                    <PersonGlyph size={13} />
                    <span style={{ fontWeight: 700, color: '#4b5563' }}>익명</span>
                    <span style={{ color: '#e5e7eb' }}>|</span>
                    <span style={{ fontWeight: 600, color: '#6b7280' }}>{c.authorSchool}</span>
                    <span style={{ color: '#e5e7eb' }}>·</span>
                    <time style={{ color: '#9ca3af' }} dateTime={c.createdAt}>
                      {formatCommunityDate(c.createdAt)}
                    </time>
                    {c.isAuthor ? (
                      <>
                        <span style={{ color: '#e5e7eb' }}>·</span>
                        {editingCommentId === c.id ? (
                          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <button
                              type="button"
                              disabled={savingCommentId === c.id || !editCommentDraft.trim()}
                              onClick={() => void saveCommentEdit(c.id)}
                              style={{
                                border: 'none',
                                background: 'none',
                                padding: 0,
                                fontSize: '11px',
                                fontWeight: 800,
                                color: savingCommentId === c.id || !editCommentDraft.trim() ? '#d1d5db' : 'var(--accent-strong)',
                                cursor: savingCommentId === c.id || !editCommentDraft.trim() ? 'default' : 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              {savingCommentId === c.id ? '저장 중…' : '저장'}
                            </button>
                            <button
                              type="button"
                              disabled={savingCommentId === c.id}
                              onClick={() => {
                                setEditingCommentId(null)
                                setEditCommentDraft('')
                              }}
                              style={{
                                border: 'none',
                                background: 'none',
                                padding: 0,
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#6b7280',
                                cursor: savingCommentId === c.id ? 'default' : 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              취소
                            </button>
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={deletingCommentId === c.id}
                              onClick={() => {
                                setEditingCommentId(c.id)
                                setEditCommentDraft(c.body)
                              }}
                              style={{
                                border: 'none',
                                background: 'none',
                                padding: 0,
                                fontSize: '11px',
                                fontWeight: 800,
                                color: deletingCommentId === c.id ? '#d1d5db' : 'var(--accent-strong)',
                                cursor: deletingCommentId === c.id ? 'default' : 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              disabled={deletingCommentId === c.id}
                              onClick={() => void deleteComment(c.id)}
                              style={{
                                border: 'none',
                                background: 'none',
                                padding: 0,
                                fontSize: '11px',
                                fontWeight: 700,
                                color: deletingCommentId === c.id ? '#d1d5db' : '#dc2626',
                                cursor: deletingCommentId === c.id ? 'default' : 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              {deletingCommentId === c.id ? '삭제 중…' : '삭제'}
                            </button>
                          </>
                        )}
                      </>
                    ) : null}
                  </div>
                  {editingCommentId === c.id ? (
                    <textarea
                      className="ui-input"
                      value={editCommentDraft}
                      onChange={(e) => setEditCommentDraft(e.target.value)}
                      rows={3}
                      style={{
                        marginTop: '8px',
                        width: '100%',
                        resize: 'vertical',
                        fontSize: '14px',
                        lineHeight: 1.65,
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        border: `1px solid ${shell.line}`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        background: '#fafafa',
                        color: '#374151',
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '14px',
                        lineHeight: 1.65,
                        color: '#374151',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {c.body}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <textarea
            className="ui-input"
            placeholder="댓글을 입력하세요."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              resize: 'vertical',
              fontSize: '14px',
              lineHeight: 1.5,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              border: `1px solid ${shell.line}`,
              borderRadius: '10px',
              padding: '12px 14px',
              background: '#fafafa',
            }}
          />
          {commentErr ? <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}>{commentErr}</p> : null}
          <div style={{ marginTop: '12px' }}>
            <Button type="button" variant="primary" size="md" disabled={sending || !commentText.trim()} onClick={sendComment}>
              {sending ? '등록 중…' : '댓글 등록'}
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}

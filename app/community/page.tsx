import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  type CommunityCategory,
  COMMUNITY_TAB_LABELS,
  CommunityMetaRow,
  communityShell as shell,
} from '@/components/CommunityShared'
import { canAccessStudentCommunity } from '@/lib/communityAccess'
import {
  getCommunityPostsForFeed,
  parseCommunityCategoryParam,
  type CommunityFeedPost,
} from '@/lib/communityFeed'

export const dynamic = 'force-dynamic'

type SearchProps = {
  searchParams: Promise<{ category?: string }>
}

function CommunityPostCard({ post }: { post: CommunityFeedPost }) {
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

const gateMuted = '#6b7280'
const gateTitle = '#111827'

function CommunityGateLayout({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: shell.pageBg,
        padding: '36px 20px 48px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          marginTop: '8vh',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </main>
  )
}

export default async function CommunityPage({ searchParams }: SearchProps) {
  const sp = await searchParams
  const tab = parseCommunityCategoryParam(sp.category)

  const session = await getServerSession(authOptions)
  const u = session?.user

  if (!u) {
    return (
      <CommunityGateLayout>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 320,
            aspectRatio: '4 / 3',
            margin: '0 auto 28px',
          }}
        >
          <Image
            src="/학생.png"
            alt="학생 캐릭터 일러스트"
            fill
            sizes="320px"
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>
        <p
          style={{
            margin: '0 0 10px',
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '-0.45px',
            lineHeight: 1.45,
            color: gateTitle,
          }}
        >
          이곳은 학생들만을 위한 공간입니다
        </p>
        <p
          style={{
            margin: '0 0 28px',
            fontSize: '15px',
            lineHeight: 1.65,
            color: gateMuted,
            fontWeight: 500,
          }}
        >
          로그인해 주세요
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '200px',
            padding: '12px 22px',
            fontSize: '15px',
            fontWeight: 700,
            color: '#ffffff',
            background: 'var(--accent-strong, #ea580c)',
            borderRadius: '999px',
            textDecoration: 'none',
            boxShadow: '0 2px 10px rgba(234, 88, 12, 0.28)',
          }}
        >
          로그인
        </Link>
      </CommunityGateLayout>
    )
  }

  if (!canAccessStudentCommunity(u)) {
    if (u.accountKind !== 'STUDENT') {
      return (
        <CommunityGateLayout>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.45px',
              lineHeight: 1.45,
              color: gateTitle,
            }}
          >
            학생 회원 전용이에요
          </p>
          <p style={{ margin: '0 0 28px', fontSize: '15px', lineHeight: 1.65, color: gateMuted, fontWeight: 500 }}>
            커뮤니티는 가입 시 학생으로 선택하고, 학생증 인증을 마친 분만 이용할 수 있어요.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '200px',
              padding: '12px 22px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#374151',
              background: '#ffffff',
              border: `1px solid ${shell.line}`,
              borderRadius: '999px',
              textDecoration: 'none',
            }}
          >
            홈으로
          </Link>
        </CommunityGateLayout>
      )
    }
    return (
      <CommunityGateLayout>
        <p
          style={{
            margin: '0 0 10px',
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '-0.45px',
            lineHeight: 1.45,
            color: gateTitle,
          }}
        >
          학생증 인증이 필요해요
        </p>
        <p style={{ margin: '0 0 28px', fontSize: '15px', lineHeight: 1.65, color: gateMuted, fontWeight: 500 }}>
          상단 프로필의 <strong style={{ color: '#374151' }}>미인증</strong>을 누르거나, 인증 페이지에서 학생증 사진을 올려 주세요.
        </p>
        <Link
          href="/account/verify"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '200px',
            padding: '12px 22px',
            fontSize: '15px',
            fontWeight: 700,
            color: '#ffffff',
            background: 'var(--accent-strong, #ea580c)',
            borderRadius: '999px',
            textDecoration: 'none',
            boxShadow: '0 2px 10px rgba(234, 88, 12, 0.28)',
          }}
        >
          학생증 인증하기
        </Link>
      </CommunityGateLayout>
    )
  }

  const feed = await getCommunityPostsForFeed(session, tab)
  const posts = feed.ok ? feed.posts : []

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
              <Link
                key={c}
                href={`/community?category=${c}`}
                scroll={false}
                prefetch
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
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                {COMMUNITY_TAB_LABELS[c]}
              </Link>
            )
          })}
        </div>

        {posts.length === 0 ? (
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

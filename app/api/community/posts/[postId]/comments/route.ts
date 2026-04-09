import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAccessStudentCommunity } from '@/lib/communityAccess'
import { communityAuthorSchool } from '@/lib/communityDisplay'

type Params = { params: Promise<{ postId: string }> }

function canUseCommunity(session: Session | null): boolean {
  return canAccessStudentCommunity(session?.user)
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  if (!canUseCommunity(session)) {
    return NextResponse.json(
      { error: '인증된 학생만 댓글을 쓸 수 있어요.', code: 'COMMUNITY_FORBIDDEN' },
      { status: 403 },
    )
  }

  const userId = Number(session.user.id)
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: '세션이 올바르지 않습니다.' }, { status: 401 })
  }

  const { postId: postIdRaw } = await params
  const postId = Number(postIdRaw)
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: '잘못된 글입니다.' }, { status: 400 })
  }

  const post = await prisma.studentCommunityPost.findUnique({
    where: { id: postId },
    select: { id: true },
  })
  if (!post) {
    return NextResponse.json({ error: '글을 찾을 수 없어요.' }, { status: 404 })
  }

  const body = await request.json()
  const text = typeof body.body === 'string' ? body.body.trim() : ''
  if (!text || text.length > 2000) {
    return NextResponse.json({ error: '댓글은 1자 이상 2000자 이하로 입력해 주세요.' }, { status: 400 })
  }

  const row = await prisma.studentCommunityComment.create({
    data: {
      postId,
      userId,
      body: text,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: { select: { isAdmin: true, verifiedSchoolName: true } },
    },
  })

  const comment = {
    id: row.id,
    body: row.body,
    createdAt: row.createdAt,
    authorSchool: communityAuthorSchool(row.user),
  }

  return NextResponse.json({ comment })
}

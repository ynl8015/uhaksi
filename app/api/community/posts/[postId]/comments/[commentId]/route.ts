import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAccessStudentCommunity } from '@/lib/communityAccess'
import { communityAuthorSchool } from '@/lib/communityDisplay'

type Params = { params: Promise<{ postId: string; commentId: string }> }

function canUseCommunity(session: Session | null): boolean {
  return canAccessStudentCommunity(session?.user)
}

function sessionUserId(session: Session | null): number | null {
  const raw = session?.user?.id
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  if (!canUseCommunity(session)) {
    return NextResponse.json(
      { error: '권한이 없어요.', code: 'COMMUNITY_FORBIDDEN' },
      { status: 403 },
    )
  }

  const userId = sessionUserId(session)
  if (userId === null) {
    return NextResponse.json({ error: '세션이 올바르지 않습니다.' }, { status: 401 })
  }

  const { postId: postRaw, commentId: commentRaw } = await params
  const postId = Number(postRaw)
  const commentId = Number(commentRaw)
  if (!Number.isFinite(postId) || !Number.isFinite(commentId)) {
    return NextResponse.json({ error: '잘못된 요청이에요.' }, { status: 400 })
  }

  const row = await prisma.studentCommunityComment.findFirst({
    where: { id: commentId, postId },
    select: { id: true, userId: true },
  })
  if (!row) {
    return NextResponse.json({ error: '댓글을 찾을 수 없어요.' }, { status: 404 })
  }
  if (row.userId !== userId) {
    return NextResponse.json({ error: '본인 댓글만 수정할 수 있어요.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const text = body && typeof body.body === 'string' ? body.body.trim() : ''
  if (!text || text.length > 2000) {
    return NextResponse.json({ error: '댓글은 1자 이상 2000자 이하로 입력해 주세요.' }, { status: 400 })
  }

  const updated = await prisma.studentCommunityComment.update({
    where: { id: commentId },
    data: { body: text },
    select: {
      id: true,
      body: true,
      createdAt: true,
      userId: true,
      user: { select: { isAdmin: true, verifiedSchoolName: true } },
    },
  })

  return NextResponse.json({
    comment: {
      id: updated.id,
      body: updated.body,
      createdAt: updated.createdAt,
      authorSchool: communityAuthorSchool(updated.user),
      isAuthor: true,
    },
  })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  if (!canUseCommunity(session)) {
    return NextResponse.json(
      { error: '권한이 없어요.', code: 'COMMUNITY_FORBIDDEN' },
      { status: 403 },
    )
  }

  const userId = sessionUserId(session)
  if (userId === null) {
    return NextResponse.json({ error: '세션이 올바르지 않습니다.' }, { status: 401 })
  }

  const { postId: postRaw, commentId: commentRaw } = await params
  const postId = Number(postRaw)
  const commentId = Number(commentRaw)
  if (!Number.isFinite(postId) || !Number.isFinite(commentId)) {
    return NextResponse.json({ error: '잘못된 요청이에요.' }, { status: 400 })
  }

  const row = await prisma.studentCommunityComment.findFirst({
    where: { id: commentId, postId },
    select: { id: true, userId: true },
  })
  if (!row) {
    return NextResponse.json({ error: '댓글을 찾을 수 없어요.' }, { status: 404 })
  }
  if (row.userId !== userId) {
    return NextResponse.json({ error: '본인 댓글만 삭제할 수 있어요.' }, { status: 403 })
  }

  await prisma.studentCommunityComment.delete({ where: { id: commentId } })
  return NextResponse.json({ ok: true })
}

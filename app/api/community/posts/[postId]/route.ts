import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAccessStudentCommunity } from '@/lib/communityAccess'
import { communityAuthorSchool } from '@/lib/communityDisplay'
import { getCommunityPostDetail } from '@/lib/communityPostDetail'
import { detectExamPaperInImage } from '@/lib/visionModeration'
import { parseDataUrlImage } from '@/lib/dataUrlImage'

type Params = { params: Promise<{ postId: string }> }

function canUseCommunity(session: Session | null): boolean {
  return canAccessStudentCommunity(session?.user)
}

function sessionUserId(session: Session | null): number | null {
  const raw = session?.user?.id
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  const { postId: raw } = await params
  const id = Number(raw)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: '잘못된 글입니다.' }, { status: 400 })
  }

  const result = await getCommunityPostDetail(session, id)
  if (!result.ok) {
    if (result.code === 'FORBIDDEN') {
      return NextResponse.json(
        { error: '인증된 학생만 글을 볼 수 있어요.', code: 'COMMUNITY_FORBIDDEN' },
        { status: 403 },
      )
    }
    return NextResponse.json({ error: '글을 찾을 수 없어요.' }, { status: 404 })
  }

  return NextResponse.json({ post: result.post })
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

  const { postId: raw } = await params
  const id = Number(raw)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: '잘못된 글입니다.' }, { status: 400 })
  }

  const existing = await prisma.studentCommunityPost.findUnique({
    where: { id },
    select: { userId: true, category: true, imageData: true },
  })
  if (!existing) {
    return NextResponse.json({ error: '글을 찾을 수 없어요.' }, { status: 404 })
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: '본인 글만 수정할 수 있어요.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '요청 본문이 올바르지 않아요.' }, { status: 400 })
  }

  const data: {
    title?: string | null
    body?: string
    imageData?: string | null
  } = {}

  if ('title' in body) {
    const t = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : ''
    data.title = t || null
  }

  if ('body' in body) {
    const text = typeof body.body === 'string' ? body.body.trim() : ''
    if (!text || text.length > 8000) {
      return NextResponse.json({ error: '내용은 1자 이상 8000자 이하로 입력해 주세요.' }, { status: 400 })
    }
    data.body = text
  }

  if ('imageData' in body && body.imageData !== undefined) {
    if (existing.category !== 'STUDY_PROOF') {
      return NextResponse.json({ error: '이 카테고리에는 사진을 바꿀 수 없어요.' }, { status: 400 })
    }
    const imageData = typeof body.imageData === 'string' ? body.imageData.trim() : ''
    if (!imageData || imageData.length > 2_500_000) {
      return NextResponse.json({ error: '공부 인증에는 사진이 필요해요.' }, { status: 400 })
    }
    const parsed = parseDataUrlImage(imageData)
    if (!parsed) {
      return NextResponse.json({ error: '이미지 형식이 올바르지 않아요.' }, { status: 400 })
    }
    const examCheck = await detectExamPaperInImage(parsed.base64, parsed.mediaType)
    if (examCheck.blocked) {
      return NextResponse.json(
        {
          error: '시험지는 올릴 수 없어요. 공부 인증용 사진만 올려 주세요.',
          code: 'EXAM_IMAGE_BLOCKED',
        },
        { status: 400 },
      )
    }
    data.imageData = imageData
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: '수정할 내용을 보내주세요.' }, { status: 400 })
  }

  const updated = await prisma.studentCommunityPost.update({
    where: { id },
    data,
    select: {
      id: true,
      category: true,
      title: true,
      body: true,
      imageData: true,
      createdAt: true,
      userId: true,
      user: { select: { isAdmin: true, verifiedSchoolName: true } },
    },
  })

  return NextResponse.json({
    post: {
      id: updated.id,
      category: updated.category,
      title: updated.title,
      body: updated.body,
      imageData: updated.imageData,
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

  const { postId: raw } = await params
  const id = Number(raw)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: '잘못된 글입니다.' }, { status: 400 })
  }

  const existing = await prisma.studentCommunityPost.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!existing) {
    return NextResponse.json({ error: '글을 찾을 수 없어요.' }, { status: 404 })
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: '본인 글만 삭제할 수 있어요.' }, { status: 403 })
  }

  await prisma.studentCommunityPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

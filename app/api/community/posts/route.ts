import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CommunityCategory } from '@/types/communityCategory'
import { detectExamPaperInImage } from '@/lib/visionModeration'
import { parseDataUrlImage } from '@/lib/dataUrlImage'
import { canAccessStudentCommunity } from '@/lib/communityAccess'
import { communityAuthorSchool } from '@/lib/communityDisplay'

const CATEGORIES: CommunityCategory[] = ['QA', 'STUDY_TIP', 'STUDY_PROOF']

function canUseCommunity(session: Session | null): boolean {
  return canAccessStudentCommunity(session?.user)
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!canUseCommunity(session)) {
    return NextResponse.json(
      { error: '인증된 학생만 커뮤니티를 볼 수 있어요.', code: 'COMMUNITY_FORBIDDEN' },
      { status: 403 },
    )
  }

  const categoryParam = request.nextUrl.searchParams.get('category')
  if (!categoryParam || !CATEGORIES.includes(categoryParam as CommunityCategory)) {
    return NextResponse.json({ error: '유효한 category가 필요합니다.' }, { status: 400 })
  }

  const category = categoryParam as CommunityCategory

  const rows = await prisma.studentCommunityPost.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      category: true,
      title: true,
      body: true,
      imageData: true,
      createdAt: true,
      user: { select: { isAdmin: true, verifiedSchoolName: true } },
    },
  })

  const posts = rows.map((p) => ({
    id: p.id,
    category: p.category,
    title: p.title,
    body: p.body,
    imageData: p.imageData,
    createdAt: p.createdAt,
    authorSchool: communityAuthorSchool(p.user),
  }))

  return NextResponse.json({ posts })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  if (!canUseCommunity(session)) {
    return NextResponse.json(
      { error: '인증된 학생만 글을 쓸 수 있어요.', code: 'COMMUNITY_FORBIDDEN' },
      { status: 403 },
    )
  }

  const userId = Number(session.user.id)
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: '세션이 올바르지 않습니다.' }, { status: 401 })
  }

  const body = await request.json()
  const categoryRaw = body?.category
  if (!categoryRaw || !CATEGORIES.includes(categoryRaw as CommunityCategory)) {
    return NextResponse.json({ error: '유효한 카테고리를 선택해 주세요.' }, { status: 400 })
  }
  const category = categoryRaw as CommunityCategory

  const title =
    typeof body.title === 'string' ? body.title.trim().slice(0, 120) : ''
  const textBody = typeof body.body === 'string' ? body.body.trim() : ''
  const imageData = typeof body.imageData === 'string' ? body.imageData.trim() : ''

  if (!textBody || textBody.length > 8000) {
    return NextResponse.json({ error: '내용은 1자 이상 8000자 이하로 입력해 주세요.' }, { status: 400 })
  }

  let imageToStore: string | null = null

  if (category === 'STUDY_PROOF') {
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

    imageToStore = imageData
  } else if (imageData) {
    return NextResponse.json({ error: '이 카테고리에는 사진을 첨부할 수 없어요.' }, { status: 400 })
  }

  const created = await prisma.studentCommunityPost.create({
    data: {
      userId,
      category,
      title: title || null,
      body: textBody,
      imageData: imageToStore,
    },
    select: {
      id: true,
      category: true,
      title: true,
      body: true,
      imageData: true,
      createdAt: true,
      user: { select: { isAdmin: true, verifiedSchoolName: true } },
    },
  })

  const post = {
    id: created.id,
    category: created.category,
    title: created.title,
    body: created.body,
    imageData: created.imageData,
    createdAt: created.createdAt,
    authorSchool: communityAuthorSchool(created.user),
  }

  return NextResponse.json({ post })
}

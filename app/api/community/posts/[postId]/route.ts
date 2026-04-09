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

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!canUseCommunity(session)) {
    return NextResponse.json(
      { error: '인증된 학생만 글을 볼 수 있어요.', code: 'COMMUNITY_FORBIDDEN' },
      { status: 403 },
    )
  }

  const { postId: raw } = await params
  const id = Number(raw)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: '잘못된 글입니다.' }, { status: 400 })
  }

  const row = await prisma.studentCommunityPost.findUnique({
    where: { id },
    select: {
      id: true,
      category: true,
      title: true,
      body: true,
      imageData: true,
      createdAt: true,
      user: { select: { isAdmin: true, verifiedSchoolName: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        take: 200,
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: { select: { isAdmin: true, verifiedSchoolName: true } },
        },
      },
    },
  })

  if (!row) {
    return NextResponse.json({ error: '글을 찾을 수 없어요.' }, { status: 404 })
  }

  const post = {
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    imageData: row.imageData,
    createdAt: row.createdAt,
    authorSchool: communityAuthorSchool(row.user),
    comments: row.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      authorSchool: communityAuthorSchool(c.user),
    })),
  }

  return NextResponse.json({ post })
}

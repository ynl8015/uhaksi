import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { canAccessStudentCommunity } from '@/lib/communityAccess'
import { communityAuthorSchool } from '@/lib/communityDisplay'
import type { CommunityCategory } from '@/types/communityCategory'

export type CommunityCommentDetail = {
  id: number
  body: string
  createdAt: string
  authorSchool: string
  isAuthor: boolean
}

export type CommunityPostDetail = {
  id: number
  category: CommunityCategory
  title: string | null
  body: string
  imageData: string | null
  createdAt: string
  authorSchool: string
  isAuthor: boolean
  comments: CommunityCommentDetail[]
}

function sessionUserId(session: Session | null): number | null {
  const raw = session?.user?.id
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export async function getCommunityPostDetail(
  session: Session | null,
  postId: number,
): Promise<
  { ok: false; code: 'FORBIDDEN' | 'BAD_ID' | 'NOT_FOUND' } | { ok: true; post: CommunityPostDetail }
> {
  if (!canAccessStudentCommunity(session?.user)) {
    return { ok: false, code: 'FORBIDDEN' }
  }
  if (!Number.isFinite(postId)) {
    return { ok: false, code: 'BAD_ID' }
  }

  const uid = sessionUserId(session)

  const row = await prisma.studentCommunityPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      category: true,
      title: true,
      body: true,
      imageData: true,
      createdAt: true,
      userId: true,
      user: { select: { isAdmin: true, verifiedSchoolName: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        take: 200,
        select: {
          id: true,
          body: true,
          createdAt: true,
          userId: true,
          user: { select: { isAdmin: true, verifiedSchoolName: true } },
        },
      },
    },
  })

  if (!row) {
    return { ok: false, code: 'NOT_FOUND' }
  }

  const post: CommunityPostDetail = {
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    imageData: row.imageData,
    createdAt: row.createdAt.toISOString(),
    authorSchool: communityAuthorSchool(row.user),
    isAuthor: uid !== null && row.userId === uid,
    comments: row.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      authorSchool: communityAuthorSchool(c.user),
      isAuthor: uid !== null && c.userId === uid,
    })),
  }

  return { ok: true, post }
}

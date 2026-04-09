import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email
  if (!userEmail) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } })
  if (!user) return NextResponse.json({ error: '유저를 찾을 수 없습니다.' }, { status: 404 })

  const { id } = await params
  const reviewId = Number(id)
  if (!Number.isFinite(reviewId)) return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 })

  const existing = await prisma.examReview.findUnique({ where: { id: reviewId }, select: { createdByUserId: true } })
  if (!existing) return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 })
  if (existing.createdByUserId !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const body = await request.json()
  const difficulty = typeof body.difficulty === 'number' ? body.difficulty : undefined
  if (difficulty !== undefined && (difficulty < 1 || difficulty > 5)) {
    return NextResponse.json({ error: 'difficulty는 1~5여야 합니다.' }, { status: 400 })
  }

  await prisma.examReview.update({
    where: { id: reviewId },
    data: {
      ...(difficulty !== undefined ? { difficulty } : {}),
      ...(typeof body.grammarCount === 'number' || body.grammarCount === null ? { grammarCount: body.grammarCount } : {}),
      ...(typeof body.vocabCount === 'number' || body.vocabCount === null ? { vocabCount: body.vocabCount } : {}),
      ...(typeof body.readingCount === 'number' || body.readingCount === null ? { readingCount: body.readingCount } : {}),
      ...(typeof body.writingCount === 'number' || body.writingCount === null ? { writingCount: body.writingCount } : {}),
      ...(typeof body.listeningCount === 'number' || body.listeningCount === null ? { listeningCount: body.listeningCount } : {}),
      ...(typeof body.otherCount === 'number' || body.otherCount === null ? { otherCount: body.otherCount } : {}),
      ...(typeof body.freeText === 'string' || body.freeText === null ? { freeText: body.freeText } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email
  if (!userEmail) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } })
  if (!user) return NextResponse.json({ error: '유저를 찾을 수 없습니다.' }, { status: 404 })

  const { id } = await params
  const reviewId = Number(id)
  if (!Number.isFinite(reviewId)) return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 })

  const existing = await prisma.examReview.findUnique({ where: { id: reviewId }, select: { createdByUserId: true } })
  if (!existing) return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 })
  if (existing.createdByUserId !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  await prisma.examReview.delete({ where: { id: reviewId } })
  return NextResponse.json({ ok: true })
}


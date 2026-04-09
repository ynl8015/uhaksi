import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncExamReviewAggregateFromReviews } from '@/lib/examAnalysis'
import { getSessionUserId } from '@/lib/sessionUser'

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const uid = await getSessionUserId()
  if (!uid) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: uid }, select: { id: true } })
  if (!user) return NextResponse.json({ error: '유저를 찾을 수 없습니다.' }, { status: 404 })

  const { id } = await params
  const reviewId = Number(id)
  if (!Number.isFinite(reviewId)) return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 })

  const existing = await prisma.examReview.findUnique({
    where: { id: reviewId },
    select: { createdByUserId: true, schoolId: true, examTitle: true, grade: true },
  })
  if (!existing) return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 })
  if (existing.createdByUserId !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const body = await request.json()
  const difficulty = typeof body.difficulty === 'number' ? body.difficulty : undefined
  if (difficulty !== undefined && (difficulty < 1 || difficulty > 5)) {
    return NextResponse.json({ error: 'difficulty는 1~5여야 합니다.' }, { status: 400 })
  }

  function optCountInPatch(v: unknown): number | null | undefined {
    if (v === undefined) return undefined
    if (v === null || v === '') return null
    const n = Number(v)
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return undefined
    return n
  }

  const grammarFromBody =
    'mcqCount' in body ? body.mcqCount : 'grammarCount' in body ? body.grammarCount : undefined
  const writingFromBody =
    'subjectiveCount' in body ? body.subjectiveCount : 'writingCount' in body ? body.writingCount : undefined
  const grammarCount = optCountInPatch(grammarFromBody)
  const writingCount = optCountInPatch(writingFromBody)

  await prisma.examReview.update({
    where: { id: reviewId },
    data: {
      ...(difficulty !== undefined ? { difficulty } : {}),
      ...(grammarCount !== undefined ? { grammarCount } : {}),
      ...(writingCount !== undefined ? { writingCount } : {}),
      ...(typeof body.vocabCount === 'number' || body.vocabCount === null ? { vocabCount: body.vocabCount } : {}),
      ...(typeof body.readingCount === 'number' || body.readingCount === null ? { readingCount: body.readingCount } : {}),
      ...(typeof body.listeningCount === 'number' || body.listeningCount === null ? { listeningCount: body.listeningCount } : {}),
      ...(typeof body.otherCount === 'number' || body.otherCount === null ? { otherCount: body.otherCount } : {}),
      ...(typeof body.freeText === 'string' || body.freeText === null ? { freeText: body.freeText } : {}),
    },
  })

  await syncExamReviewAggregateFromReviews({
    schoolId: existing.schoolId,
    examTitle: existing.examTitle,
    grade: existing.grade,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const uid = await getSessionUserId()
  if (!uid) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: uid }, select: { id: true } })
  if (!user) return NextResponse.json({ error: '유저를 찾을 수 없습니다.' }, { status: 404 })

  const { id } = await params
  const reviewId = Number(id)
  if (!Number.isFinite(reviewId)) return NextResponse.json({ error: '잘못된 id 입니다.' }, { status: 400 })

  const existing = await prisma.examReview.findUnique({
    where: { id: reviewId },
    select: { createdByUserId: true, schoolId: true, examTitle: true, grade: true },
  })
  if (!existing) return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 })
  if (existing.createdByUserId !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const key = { schoolId: existing.schoolId, examTitle: existing.examTitle, grade: existing.grade }
  await prisma.examReview.delete({ where: { id: reviewId } })
  await syncExamReviewAggregateFromReviews(key)
  return NextResponse.json({ ok: true })
}


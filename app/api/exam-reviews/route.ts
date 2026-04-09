import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { syncExamReviewAggregateFromReviews } from '@/lib/examAnalysis'

function toInt(v: string | null): number | null {
  if (v === null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function optCount(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return null
  return n
}

export async function GET(request: NextRequest) {
  const schoolId = toInt(request.nextUrl.searchParams.get('schoolId'))
  const examTitle = request.nextUrl.searchParams.get('examTitle')
  const grade = toInt(request.nextUrl.searchParams.get('grade'))

  if (!schoolId || !examTitle || !grade) {
    return NextResponse.json({ error: 'schoolId, examTitle, grade are required' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email ?? null
  const user = userEmail
    ? await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } })
    : null

  const mine = user
    ? await prisma.examReview.findUnique({
        where: {
          schoolId_examTitle_grade_createdByUserId: {
            schoolId,
            examTitle,
            grade,
            createdByUserId: user.id,
          },
        },
        select: {
          id: true,
          grade: true,
          difficulty: true,
          grammarCount: true,
          writingCount: true,
          freeText: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    : null

  return NextResponse.json({ mine })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email
  if (!userEmail) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } })
  if (!user) {
    return NextResponse.json({ error: '유저를 찾을 수 없습니다.' }, { status: 404 })
  }

  const body = await request.json()
  const schoolId = Number(body.schoolId)
  const examTitle = String(body.examTitle ?? '').trim()
  const grade = Number(body.grade)
  const difficulty = Number(body.difficulty)

  if (!Number.isFinite(schoolId) || !examTitle || !Number.isFinite(grade) || !Number.isFinite(difficulty)) {
    return NextResponse.json({ error: '필수 값이 누락됐습니다.' }, { status: 400 })
  }
  if (difficulty < 1 || difficulty > 5) {
    return NextResponse.json({ error: 'difficulty는 1~5여야 합니다.' }, { status: 400 })
  }

  const mcq = optCount(body.mcqCount ?? body.grammarCount)
  const subjective = optCount(body.subjectiveCount ?? body.writingCount)
  const counts = {
    grammarCount: mcq,
    vocabCount: null,
    readingCount: null,
    writingCount: subjective,
    listeningCount: null,
    otherCount: null,
  } as const

  const created = await prisma.examReview.upsert({
    where: {
      schoolId_examTitle_grade_createdByUserId: {
        schoolId,
        examTitle,
        grade,
        createdByUserId: user.id,
      },
    },
    update: {
      difficulty,
      ...counts,
      freeText: typeof body.freeText === 'string' ? body.freeText : null,
    },
    create: {
      schoolId,
      examTitle,
      grade,
      createdByUserId: user.id,
      difficulty,
      ...counts,
      freeText: typeof body.freeText === 'string' ? body.freeText : null,
    },
    select: { id: true },
  })

  await syncExamReviewAggregateFromReviews({ schoolId, examTitle, grade })

  return NextResponse.json({ ok: true, id: created.id })
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { upsertExamReviewAggregate } from '@/lib/examAnalysis'
import { purgeStaleExamData } from '@/lib/dataRetention'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.ADMIN_RECOMPUTE_SECRET
  if (!secret) return false
  const header = request.headers.get('x-admin-secret')
  return header === secret
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const runPurge = body.purge !== false
  const purgeResult = runPurge ? await purgeStaleExamData() : null

  const schoolId = typeof body.schoolId === 'number' ? body.schoolId : null
  const examTitle = typeof body.examTitle === 'string' ? body.examTitle : null
  const grade = typeof body.grade === 'number' ? body.grade : null
  const generateAiSummary = body.generateAiSummary !== false

  const now = new Date()
  const windowStart = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 180) // last 180 days
  const windowEnd = now

  const keys =
    schoolId && examTitle && grade
      ? [{ schoolId, examTitle, grade }]
      : await prisma.examReview.findMany({
          distinct: ['schoolId', 'examTitle', 'grade'],
          select: { schoolId: true, examTitle: true, grade: true },
          take: 500,
        })

  let updated = 0
  for (const k of keys) {
    await upsertExamReviewAggregate({
      key: k,
      windowStart,
      windowEnd,
      generateAiSummary,
    })
    updated++
  }

  return NextResponse.json({ ok: true, updated, purge: purgeResult })
}


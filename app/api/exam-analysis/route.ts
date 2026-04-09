import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toInt(v: string | null): number | null {
  if (v === null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function GET(request: NextRequest) {
  const schoolId = toInt(request.nextUrl.searchParams.get('schoolId'))
  const examTitle = request.nextUrl.searchParams.get('examTitle')
  const grade = toInt(request.nextUrl.searchParams.get('grade'))

  if (!schoolId || !examTitle || !grade) {
    return NextResponse.json({ error: 'schoolId, examTitle, grade are required' }, { status: 400 })
  }

  const agg = await prisma.examReviewAggregate.findUnique({
    where: {
      schoolId_examTitle_grade: { schoolId, examTitle, grade },
    },
  })

  return NextResponse.json({ aggregate: agg ?? null })
}


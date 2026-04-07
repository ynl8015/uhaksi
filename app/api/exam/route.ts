import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { schoolName, title, startDate, endDate, subjects } = await request.json()

  if (!schoolName || !title || !startDate || !endDate) {
    return NextResponse.json({ error: '필수 값이 누락됐습니다.' }, { status: 400 })
  }

  const school = await prisma.school.findUnique({
    where: { name: schoolName }
  })

  if (!school) {
    return NextResponse.json({ error: '학교를 찾을 수 없습니다.' }, { status: 404 })
  }

  function parseDate(yyyymmdd: string) {
    const year = parseInt(yyyymmdd.slice(0, 4))
    const month = parseInt(yyyymmdd.slice(4, 6)) - 1
    const day = parseInt(yyyymmdd.slice(6, 8))
    return new Date(year, month, day)
  }
  
  const exam = await prisma.exam.create({
    data: {
      schoolId: school.id,
      title,
      startDate: parseDate(startDate),
      endDate: parseDate(endDate),
      subjects: {
        create: subjects ?? []
      }
    },
    include: { subjects: true }
  })

  return NextResponse.json(exam)
}
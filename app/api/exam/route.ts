import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { schoolId, title, startDate, endDate, subjects, subjectRanges } = await request.json()

    if (!schoolId || !title || !startDate || !endDate) {
      return NextResponse.json({ error: '필수 값이 누락됐습니다.' }, { status: 400 })
    }

    const school = await prisma.school.findUnique({
      where: { id: Number(schoolId) }
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

    const existingExam = await prisma.exam.findFirst({
      where: { schoolId: school.id, title }
    })

    let exam

    if (existingExam) {
      await prisma.examSubject.deleteMany({
        where: { examId: existingExam.id }
      })
      await prisma.subjectRange.deleteMany({
        where: { examId: existingExam.id }
      })
      exam = await prisma.exam.update({
        where: { id: existingExam.id },
        data: {
          subjects: {
            create: subjects ?? []
          },
          subjectRanges: {
            create: (subjectRanges ?? []).map(
              (r: {
                grade?: number | null
                subject: string
                label?: string | null
                content?: string | null
                sortOrder?: number | null
              }) => ({
              grade: typeof r.grade === 'number' ? r.grade : null,
              subject: r.subject,
              label: r.label?.trim() ? r.label.trim() : null,
              content: r.content?.trim() ? r.content.trim() : null,
              sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : 0,
            }))
          }
        },
        include: { subjects: true, subjectRanges: true }
      })
    } else {
      exam = await prisma.exam.create({
        data: {
          schoolId: school.id,
          title,
          startDate: parseDate(startDate),
          endDate: parseDate(endDate),
          subjects: {
            create: subjects ?? []
          },
          subjectRanges: {
            create: (subjectRanges ?? []).map(
              (r: {
                grade?: number | null
                subject: string
                label?: string | null
                content?: string | null
                sortOrder?: number | null
              }) => ({
              grade: typeof r.grade === 'number' ? r.grade : null,
              subject: r.subject,
              label: r.label?.trim() ? r.label.trim() : null,
              content: r.content?.trim() ? r.content.trim() : null,
              sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : 0,
            }))
          }
        },
        include: { subjects: true, subjectRanges: true }
      })
    }

    return NextResponse.json(exam)

  } catch (e) {
    console.error('에러:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { examId } = await request.json()
    if (!examId) {
      return NextResponse.json({ error: '필수 값이 누락됐습니다.' }, { status: 400 })
    }

    const id = Number(examId)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: '잘못된 examId 입니다.' }, { status: 400 })
    }

    await prisma.examSubject.deleteMany({ where: { examId: id } })
    await prisma.subjectRange.deleteMany({ where: { examId: id } })
    await prisma.exam.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('에러:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
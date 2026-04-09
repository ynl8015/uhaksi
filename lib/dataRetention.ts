import { prisma } from '@/lib/prisma'

/** 시험 종료일이 이 날짜 미만이면 삭제 (당해·직전 연도만 유지). */
export function examRetentionCutoffDate(now = new Date()): Date {
  const y = now.getFullYear() - 1
  return new Date(y, 0, 1)
}

/**
 * 오래된 시험·후기·빈 집계를 정리합니다.
 * 예: 2027년이면 2026-01-01 이전에 끝난 시험 행과, 그 시점 이전에 작성된 후기를 삭제합니다.
 */
export async function purgeStaleExamData(now = new Date()): Promise<{
  cutoff: string
  examsDeleted: number
  reviewsDeleted: number
  aggregatesDeleted: number
}> {
  const cutoff = examRetentionCutoffDate(now)

  const staleExams = await prisma.exam.findMany({
    where: { endDate: { lt: cutoff } },
    select: { id: true },
  })
  const examIds = staleExams.map((e) => e.id)

  if (examIds.length > 0) {
    await prisma.examSubject.deleteMany({ where: { examId: { in: examIds } } })
    await prisma.subjectRange.deleteMany({ where: { examId: { in: examIds } } })
  }
  const examsDeleted = examIds.length > 0 ? (await prisma.exam.deleteMany({ where: { id: { in: examIds } } })).count : 0

  const reviewsDeleted = (await prisma.examReview.deleteMany({ where: { createdAt: { lt: cutoff } } })).count

  const aggregates = await prisma.examReviewAggregate.findMany({
    select: { id: true, schoolId: true, examTitle: true, grade: true },
  })
  let aggregatesDeleted = 0
  for (const a of aggregates) {
    const n = await prisma.examReview.count({
      where: { schoolId: a.schoolId, examTitle: a.examTitle, grade: a.grade },
    })
    if (n === 0) {
      await prisma.examReviewAggregate.delete({ where: { id: a.id } })
      aggregatesDeleted++
    }
  }

  return {
    cutoff: cutoff.toISOString(),
    examsDeleted,
    reviewsDeleted,
    aggregatesDeleted,
  }
}

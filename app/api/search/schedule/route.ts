import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const schoolName = request.nextUrl.searchParams.get('school')
  if (!schoolName) return NextResponse.json([])

  const school = await prisma.school.findUnique({
    where: { name: schoolName },
    select: { neisRegionCode: true, neisCode: true }
  })

  if (!school?.neisCode || !school?.neisRegionCode) {
    return NextResponse.json([])
  }

  const year = new Date().getFullYear()
  const url = `https://open.neis.go.kr/hub/SchoolSchedule?KEY=${process.env.NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${school.neisRegionCode}&SD_SCHUL_CODE=${school.neisCode}&AA_FROM_YMD=${year}0101&AA_TO_YMD=${year}1231`

  const res = await fetch(url)
  const data = await res.json()

  if (!data.SchoolSchedule) return NextResponse.json([])

  const rows = data.SchoolSchedule[1].row

  // 시험 관련 이벤트만 필터링
  const examKeywords = ['고사', '시험', '지필', '평가']
  const examRows = rows.filter((row: { EVENT_NM: string }) =>
    examKeywords.some(keyword => row.EVENT_NM.includes(keyword))
  )

  // 같은 시험 이름끼리 묶기
  const grouped: Record<string, string[]> = {}
  for (const row of examRows) {
    if (!grouped[row.EVENT_NM]) grouped[row.EVENT_NM] = []
    grouped[row.EVENT_NM].push(row.AA_YMD)
  }

  const result = Object.entries(grouped).map(([name, dates]) => ({
    name,
    dates: dates.sort(),
    startDate: dates.sort()[0],
    endDate: dates.sort()[dates.length - 1],
  }))

  return NextResponse.json(result)
}
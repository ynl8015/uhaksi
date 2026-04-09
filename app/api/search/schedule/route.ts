import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractExamPeriodsFromNeis } from '@/lib/neisExam'
import { resolveNeisSchoolCodesByAddress } from '@/lib/neisSchool'

export async function GET(request: NextRequest) {
  const schoolIdParam = request.nextUrl.searchParams.get('schoolId')
  const schoolName = request.nextUrl.searchParams.get('school')
  if (!schoolIdParam && !schoolName) return NextResponse.json([])

  const school = schoolIdParam
    ? await prisma.school.findUnique({
        where: { id: Number(schoolIdParam) },
        select: { name: true, neisRegionCode: true, neisCode: true, address: true },
      })
    : await prisma.school.findFirst({
        where: { name: schoolName ?? '' },
        select: { name: true, neisRegionCode: true, neisCode: true, address: true },
      })

  const apiKey = process.env.NEIS_API_KEY ?? ''

  // 같은 이름의 학교가 여러 지역에 존재해서 DB의 코드가 덮여쓰여질 수 있어,
  // 주소 기반으로 NEIS schoolInfo에서 코드를 재결정합니다.
  const resolved = await resolveNeisSchoolCodesByAddress({
    apiKey,
    schoolName: school?.name ?? schoolName ?? '',
    address: school?.address,
  })

  const neisRegionCode = resolved?.neisRegionCode ?? school?.neisRegionCode
  const neisCode = resolved?.neisCode ?? school?.neisCode

  if (!neisCode || !neisRegionCode) return NextResponse.json([])

  const year = new Date().getFullYear()
  const url = `https://open.neis.go.kr/hub/SchoolSchedule?KEY=${process.env.NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${neisRegionCode}&SD_SCHUL_CODE=${neisCode}&AA_FROM_YMD=${year}0101&AA_TO_YMD=${year}1231`

  const res = await fetch(url)
  const data = await res.json()

  if (!data.SchoolSchedule) return NextResponse.json([])

  const rows = data.SchoolSchedule[1].row
  const result = extractExamPeriodsFromNeis(rows)
  return NextResponse.json(result)
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const schoolName = request.nextUrl.searchParams.get('school')
  const from = request.nextUrl.searchParams.get('from') // yyyymmdd
  const to = request.nextUrl.searchParams.get('to') // yyyymmdd

  if (!schoolName) return NextResponse.json({ error: 'school is required' }, { status: 400 })

  const school = await prisma.school.findFirst({
    where: { name: schoolName },
    select: { neisRegionCode: true, neisCode: true },
  })

  if (!school?.neisCode || !school?.neisRegionCode) {
    return NextResponse.json({ error: 'school missing neis codes' }, { status: 404 })
  }

  const year = new Date().getFullYear()
  const aaFrom = from ?? `${year}0101`
  const aaTo = to ?? `${year}1231`

  const url =
    `https://open.neis.go.kr/hub/SchoolSchedule?` +
    `KEY=${process.env.NEIS_API_KEY}` +
    `&Type=json` +
    `&pIndex=1&pSize=1000` +
    `&ATPT_OFCDC_SC_CODE=${school.neisRegionCode}` +
    `&SD_SCHUL_CODE=${school.neisCode}` +
    `&AA_FROM_YMD=${aaFrom}` +
    `&AA_TO_YMD=${aaTo}`

  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  const rows = (data?.SchoolSchedule?.[1]?.row ?? []) as Array<{ AA_YMD: string; EVENT_NM: string; EVENT_CNTNT?: string }>

  const candidates = rows.filter((r) => /(중간|기말|지필|고사|시험|평가)/.test(r.EVENT_NM))
  return NextResponse.json({
    school: { name: schoolName, ...school },
    range: { from: aaFrom, to: aaTo },
    total: rows.length,
    candidates: candidates
      .sort((a, b) => (a.AA_YMD + a.EVENT_NM).localeCompare(b.AA_YMD + b.EVENT_NM))
      .map((r) => ({ AA_YMD: r.AA_YMD, EVENT_NM: r.EVENT_NM, EVENT_CNTNT: r.EVENT_CNTNT })),
  })
}


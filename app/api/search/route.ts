import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  const exact = request.nextUrl.searchParams.get('exact')

  if (!q || q.length < 1) {
    return NextResponse.json([])
  }

  if (exact === 'true') {
    const school = await prisma.school.findFirst({
      where: {
        name: { contains: q }
      },
      select: { name: true }
    })
    return NextResponse.json(school ?? null)
  }

  const schools = await prisma.school.findMany({
    where: {
      name: { contains: q }
    },
    take: 10,
    select: { name: true }
  })

  return NextResponse.json(schools)
}
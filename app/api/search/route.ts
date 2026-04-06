import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.length < 1) {
    return NextResponse.json([])
  }

  const schools = await prisma.school.findMany({
    where: {
      name: {
        contains: q,
      }
    },
    take: 10,
    select: {
      name: true,
    }
  })

  return NextResponse.json(schools)
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url))
  }

  const user = await prisma.user.findFirst({
    where: { verifyToken: token }
  })

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url))
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verifyToken: null,
    }
  })

  return NextResponse.redirect(new URL('/login?verified=true', request.url))
}
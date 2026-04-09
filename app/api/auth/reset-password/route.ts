import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { token, password } = await request.json()
  const rawToken = typeof token === 'string' ? token.trim() : ''
  const rawPassword = typeof password === 'string' ? password : ''

  if (!rawToken) {
    return NextResponse.json({ error: '유효하지 않은 링크예요.' }, { status: 400 })
  }
  if (rawPassword.length < 8) {
    return NextResponse.json({ error: '비밀번호는 8자 이상이어야 해요.' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: rawToken,
      passwordResetExpires: { gt: new Date() },
    },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ error: '링크가 만료됐거나 이미 사용됐어요. 다시 비밀번호 찾기를 진행해주세요.' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  })

  return NextResponse.json({ message: '비밀번호가 변경됐어요. 로그인해주세요.' })
}

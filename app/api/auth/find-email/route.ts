import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { name, email } = await request.json()
  const rawName = typeof name === 'string' ? name.trim() : ''
  const emailNorm = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (!rawName) {
    return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 })
  }
  if (!emailNorm || !emailNorm.includes('@')) {
    return NextResponse.json({ error: '가입 시 등록한 이메일 주소를 입력해주세요.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: emailNorm },
    select: { name: true, loginId: true },
  })

  if (!user || user.name.trim() !== rawName) {
    return NextResponse.json({ error: '이름과 이메일이 일치하는 계정을 찾지 못했어요.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, loginId: user.loginId })
}

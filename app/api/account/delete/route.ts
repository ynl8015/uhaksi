import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const userId = Number(session.user.id)
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: '세션이 올바르지 않습니다.' }, { status: 401 })
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!password) {
    return NextResponse.json({ error: '비밀번호를 입력해 주세요.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      password: true,
      emailVerified: true,
      isAdmin: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
  }

  if (user.isAdmin) {
    return NextResponse.json(
      { error: '관리자 계정은 이 경로로 탈퇴할 수 없어요. 운영 측에 문의해 주세요.' },
      { status: 403 },
    )
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: '이메일 인증을 완료한 뒤 탈퇴할 수 있어요.' },
      { status: 403 },
    )
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않아요.' }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.examReview.deleteMany({ where: { createdByUserId: userId } })
    await tx.user.delete({ where: { id: userId } })
  })

  return NextResponse.json({ ok: true })
}

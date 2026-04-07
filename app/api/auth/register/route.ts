import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: '이름, 이메일, 비밀번호를 모두 입력해주세요.' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const verifyToken = crypto.randomBytes(32).toString('hex')

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      verifyToken,
    }
  })

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verifyToken}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: '우리학교시험 이메일 인증',
    html: `
      <h2>이메일 인증</h2>
      <p>아래 버튼을 클릭해서 이메일 인증을 완료해주세요.</p>
      <a href="${verifyUrl}" style="background:#3a7d52;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
        이메일 인증하기
      </a>
      <p style="color:#888;font-size:12px;margin-top:16px;">링크는 24시간 동안 유효합니다.</p>
    `
  })

  return NextResponse.json({ message: '인증 이메일을 발송했습니다.' })
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import crypto from 'crypto'
import { LOGIN_ID_RE, normalizeLoginId } from '@/lib/loginId'

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: '메일 설정이 필요해요. (RESEND_API_KEY 누락)' }, { status: 500 })
  }
  const resend = new Resend(apiKey)

  const { loginId, email, password, name } = await request.json()

  const rawName = typeof name === 'string' ? name.trim() : ''
  const loginNorm = typeof loginId === 'string' ? normalizeLoginId(loginId) : ''
  const emailNorm = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (!rawName || !loginNorm || !emailNorm || !password) {
    return NextResponse.json({ error: '아이디, 이름, 이메일, 비밀번호를 모두 입력해주세요.' }, { status: 400 })
  }

  if (!LOGIN_ID_RE.test(loginNorm)) {
    return NextResponse.json(
      { error: '아이디는 영문 소문자와 숫자로 4~20자로 만들어 주세요. (밑줄 _ 은 선택)' },
      { status: 400 },
    )
  }

  if (!emailNorm.includes('@')) {
    return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 })
  }

  const [byLogin, byEmail] = await Promise.all([
    prisma.user.findUnique({ where: { loginId: loginNorm }, select: { id: true } }),
    prisma.user.findUnique({ where: { email: emailNorm }, select: { id: true } }),
  ])
  if (byLogin) {
    return NextResponse.json({ error: '이미 사용 중인 아이디예요.' }, { status: 400 })
  }
  if (byEmail) {
    return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const verifyToken = crypto.randomBytes(32).toString('hex')

  await prisma.user.create({
    data: {
      loginId: loginNorm,
      email: emailNorm,
      name: rawName,
      password: hashedPassword,
      verifyToken,
    },
  })

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verifyToken}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: emailNorm,
    subject: '우리학교시험 이메일 인증',
    html: `
      <h2>이메일 인증</h2>
      <p>아래 버튼을 클릭해서 이메일 인증을 완료해주세요.</p>
      <a href="${verifyUrl}" style="background:#3a7d52;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
        이메일 인증하기
      </a>
      <p style="color:#888;font-size:12px;margin-top:16px;">링크는 24시간 동안 유효합니다.</p>
    `,
  })

  return NextResponse.json({ message: '인증 이메일을 발송했습니다.' })
}

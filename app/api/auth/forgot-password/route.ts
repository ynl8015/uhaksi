import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: '메일 설정이 필요해요. (RESEND_API_KEY 누락)' }, { status: 500 })
  }
  const resend = new Resend(apiKey)

  const { email } = await request.json()
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (!normalized || !normalized.includes('@')) {
    return NextResponse.json({ error: '올바른 이메일을 입력해주세요.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, emailVerified: true },
  })

  // 존재·미인증 여부를 응답으로 구분하지 않음(계정 노출 방지). 다만 실제로는 이 경우 메일을 보내지 않음.
  const generic = {
    message:
      '요청은 접수됐어요. 가입한 이메일이 맞고, 가입 후 이메일 인증까지 마친 계정에만 재설정 메일이 발송돼요. 해당된다면 1~2분 뒤 받은편지함·스팸함을 확인해 주세요. (미가입·인증 전이면 메일은 가지 않아요.)',
  }

  if (!user || !user.emailVerified) {
    return NextResponse.json(generic)
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expires,
    },
  })

  const base = process.env.NEXTAUTH_URL ?? ''
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`

  try {
    await resend.emails.send({
      from: 'noreply@uhaksi.kr',
      to: normalized,
      subject: '우리학교시험 비밀번호 재설정',
      html: `
        <h2>비밀번호 재설정</h2>
        <p>아래 버튼을 눌러 새 비밀번호를 설정해주세요.</p>
        <a href="${resetUrl}" style="background:#ff6f0f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
          비밀번호 재설정하기
        </a>
        <p style="color:#888;font-size:12px;margin-top:16px;">링크는 1시간 동안만 유효합니다. 본인이 요청하지 않았다면 이 메일은 무시해도 돼요.</p>
      `,
    })
  } catch {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: null, passwordResetExpires: null },
    })
    return NextResponse.json({ error: '메일 발송에 실패했어요. 잠시 후 다시 시도해주세요.' }, { status: 500 })
  }

  return NextResponse.json(generic)
}

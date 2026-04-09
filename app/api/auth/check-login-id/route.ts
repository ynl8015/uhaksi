import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LOGIN_ID_RE, normalizeLoginId } from '@/lib/loginId'

/**
 * POST { loginId } — 회원가입 시 아이디 사용 가능 여부 (쿼리스트링 인코딩 이슈 방지)
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ available: false, reason: 'bad_request' as const }, { status: 400 })
  }
  const raw = typeof (body as { loginId?: unknown }).loginId === 'string' ? (body as { loginId: string }).loginId : ''
  const loginNorm = normalizeLoginId(raw)

  if (!loginNorm) {
    return NextResponse.json({ available: false, reason: 'empty' as const })
  }
  if (!LOGIN_ID_RE.test(loginNorm)) {
    return NextResponse.json({ available: false, reason: 'format' as const })
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { loginId: loginNorm },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json({ available: false, reason: 'taken' as const })
    }

    return NextResponse.json({ available: true, reason: 'ok' as const })
  } catch {
    return NextResponse.json({ available: false, reason: 'server' as const }, { status: 500 })
  }
}

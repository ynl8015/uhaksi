import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyStudentIdWithVision } from '@/lib/visionModeration'

const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const userId = Number(session.user.id)
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: '세션이 올바르지 않습니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountKind: true, studentVerifiedAt: true, isAdmin: true },
  })

  if (!user) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
  }

  if (user.isAdmin) {
    return NextResponse.json(
      { error: '관리자 계정은 학생증 인증 없이 커뮤니티를 이용할 수 있어요.' },
      { status: 403 },
    )
  }

  if (user.accountKind !== 'STUDENT') {
    return NextResponse.json(
      { error: '학생으로 가입한 계정만 학생증 인증을 할 수 있어요.' },
      { status: 403 },
    )
  }

  if (user.studentVerifiedAt) {
    return NextResponse.json({ error: '이미 인증이 완료된 계정이에요.' }, { status: 400 })
  }

  const formData = await request.formData()
  const file = formData.get('image')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: '학생증 사진을 올려주세요.' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: '파일 크기는 5MB 이하여야 해요.' }, { status: 400 })
  }

  const type = (file as File).type
  if (type !== 'image/jpeg' && type !== 'image/png' && type !== 'image/webp') {
    return NextResponse.json({ error: 'JPG, PNG, WEBP 이미지만 업로드할 수 있어요.' }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const base64 = buf.toString('base64')
  const mediaType = type as 'image/jpeg' | 'image/png' | 'image/webp'

  const vision = await verifyStudentIdWithVision(base64, mediaType)
  if (!vision.ok || !vision.schoolName) {
    return NextResponse.json(
      { error: vision.reason || '학생증으로 확인되지 않았어요. 더 선명한 사진으로 다시 시도해 주세요.' },
      { status: 400 },
    )
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      studentVerifiedAt: new Date(),
      verifiedSchoolName: vision.schoolName,
    },
  })

  return NextResponse.json({ ok: true, schoolName: vision.schoolName })
}

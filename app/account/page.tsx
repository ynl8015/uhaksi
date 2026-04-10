import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AccountMyPanel, { type AccountMyPanelUser } from '@/components/AccountMyPanel'

export const metadata: Metadata = {
  title: '마이페이지 | 우리학교시험',
  description: '내 계정 정보 확인 및 회원 탈퇴',
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/account')
  }

  const userId = Number(session.user.id)
  if (!Number.isFinite(userId)) {
    redirect('/login?callbackUrl=/account')
  }

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      loginId: true,
      email: true,
      name: true,
      emailVerified: true,
      accountKind: true,
      studentVerifiedAt: true,
      verifiedSchoolName: true,
      isAdmin: true,
      createdAt: true,
    },
  })

  if (!row) {
    redirect('/login?callbackUrl=/account')
  }

  const user: AccountMyPanelUser = {
    loginId: row.loginId,
    email: row.email,
    name: row.name,
    emailVerified: row.emailVerified,
    accountKind: row.accountKind,
    studentVerifiedAt: row.studentVerifiedAt?.toISOString() ?? null,
    verifiedSchoolName: row.verifiedSchoolName,
    isAdmin: row.isAdmin,
    createdAt: row.createdAt.toISOString(),
  }

  return <AccountMyPanel user={user} />
}

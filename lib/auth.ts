import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import { normalizeLoginId } from '@/lib/loginId'
import type { AccountKind } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        loginId: { label: '아이디', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const loginId = credentials?.loginId ? normalizeLoginId(credentials.loginId) : ''
        const password = credentials?.password
        if (!loginId || !password) return null

        const user = await prisma.user.findUnique({
          where: { loginId },
        })

        if (!user) return null
        if (!user.emailVerified) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          accountKind: user.accountKind,
          studentVerified: Boolean(user.studentVerifiedAt),
          verifiedSchoolName: user.verifiedSchoolName,
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          name?: string | null
          email?: string | null
          accountKind: AccountKind
          studentVerified: boolean
          verifiedSchoolName: string | null
          isAdmin: boolean
        }
        token.name = u.name
        token.email = u.email
        token.accountKind = u.accountKind
        token.studentVerified = u.studentVerified
        token.verifiedSchoolName = u.verifiedSchoolName ?? null
        token.isAdmin = u.isAdmin
      }
      if (trigger === 'update' && session) {
        if (typeof session.studentVerified === 'boolean') {
          token.studentVerified = session.studentVerified
        }
        if ('verifiedSchoolName' in session) {
          token.verifiedSchoolName = session.verifiedSchoolName as string | null
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.accountKind = (token.accountKind as AccountKind) ?? 'OTHER'
        session.user.studentVerified = Boolean(token.studentVerified)
        session.user.verifiedSchoolName =
          typeof token.verifiedSchoolName === 'string' ? token.verifiedSchoolName : null
        session.user.isAdmin = Boolean(token.isAdmin)
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

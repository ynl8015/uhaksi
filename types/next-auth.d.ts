import type { AccountKind } from '@/types/accountKind'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    accountKind?: AccountKind
    studentVerified?: boolean
    verifiedSchoolName?: string | null
    isAdmin?: boolean
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      accountKind: AccountKind
      studentVerified: boolean
      verifiedSchoolName: string | null
      isAdmin: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accountKind?: AccountKind
    studentVerified?: boolean
    verifiedSchoolName?: string | null
    isAdmin?: boolean
  }
}

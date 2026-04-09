import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/** JWT 세션의 유저 DB id (없으면 null) */
export async function getSessionUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions)
  const raw = session?.user?.id
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

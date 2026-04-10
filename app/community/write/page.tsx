import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canAccessStudentCommunity } from '@/lib/communityAccess'
import { parseCommunityCategoryParam } from '@/lib/communityFeed'
import CommunityWriteClient from '@/components/CommunityWriteClient'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function CommunityWritePage({ searchParams }: Props) {
  const sp = await searchParams
  const initialCategory = parseCommunityCategoryParam(sp.category)
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <CommunityWriteClient gate="login" initialCategory={initialCategory} />
  }
  if (!canAccessStudentCommunity(session.user)) {
    return <CommunityWriteClient gate="forbidden" initialCategory={initialCategory} />
  }

  return <CommunityWriteClient gate="ok" initialCategory={initialCategory} />
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canAccessStudentCommunity } from '@/lib/communityAccess'
import { getCommunityPostDetail } from '@/lib/communityPostDetail'
import CommunityPostDetailClient from '@/components/CommunityPostDetailClient'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ postId: string }>
}

export default async function CommunityPostDetailPage({ params }: Props) {
  const { postId: raw } = await params
  const postId = Number(raw)
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <CommunityPostDetailClient gate="login" postId={postId} initialPost={null} />
  }

  if (!canAccessStudentCommunity(session.user)) {
    return <CommunityPostDetailClient gate="forbidden" postId={postId} initialPost={null} />
  }

  if (!Number.isFinite(postId)) {
    return (
      <CommunityPostDetailClient gate="error" postId={0} initialPost={null} loadError="잘못된 주소예요." />
    )
  }

  const result = await getCommunityPostDetail(session, postId)
  if (!result.ok) {
    if (result.code === 'FORBIDDEN') {
      return <CommunityPostDetailClient gate="forbidden" postId={postId} initialPost={null} />
    }
    const msg =
      result.code === 'NOT_FOUND' ? '글을 찾을 수 없어요.' : '글을 불러오지 못했어요.'
    return <CommunityPostDetailClient gate="error" postId={postId} initialPost={null} loadError={msg} />
  }

  return <CommunityPostDetailClient gate="ok" postId={postId} initialPost={result.post} />
}

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canAccessStudentCommunity } from '@/lib/communityAccess'
import { getCommunityPostDetail } from '@/lib/communityPostDetail'
import CommunityPostEditClient from '@/components/CommunityPostEditClient'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ postId: string }>
}

export default async function CommunityPostEditPage({ params }: Props) {
  const { postId: raw } = await params
  const postId = Number(raw)
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <CommunityPostEditClient gate="login" postId={postId} initial={null} />
  }

  if (!canAccessStudentCommunity(session.user)) {
    return <CommunityPostEditClient gate="forbidden" postId={postId} initial={null} />
  }

  if (!Number.isFinite(postId)) {
    return (
      <CommunityPostEditClient gate="error" postId={0} initial={null} loadError="잘못된 주소예요." />
    )
  }

  const result = await getCommunityPostDetail(session, postId)
  if (!result.ok) {
    if (result.code === 'FORBIDDEN') {
      return <CommunityPostEditClient gate="forbidden" postId={postId} initial={null} />
    }
    const msg = result.code === 'NOT_FOUND' ? '글을 찾을 수 없어요.' : '불러오지 못했어요.'
    return <CommunityPostEditClient gate="error" postId={postId} initial={null} loadError={msg} />
  }

  if (!result.post.isAuthor) {
    redirect(`/community/post/${postId}`)
  }

  const initial = {
    id: result.post.id,
    category: result.post.category,
    title: result.post.title,
    body: result.post.body,
    imageData: result.post.imageData,
  }

  return <CommunityPostEditClient gate="ok" postId={postId} initial={initial} />
}

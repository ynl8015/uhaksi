import { prisma } from '@/lib/prisma'
import ExamList from '@/components/ExamList'
import LockedSection from '@/components/LockedSection'

type Props = {
  params: Promise<{ name: string }>
}

export default async function SchoolPage({ params }: Props) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  const school = await prisma.school.findUnique({
    where: { name: decodedName },
    include: {
      exams: {
        include: {
          subjects: true
        }
      }
    }
  })

  return (
    <main>
      <h1>{decodedName}</h1>
      {school?.address && <p>{school.address}</p>}

      <ExamList exams={school?.exams ?? []} />
      <LockedSection />
    </main>
  )
}
import { prisma } from '@/lib/prisma'
import ExamList from '@/components/ExamList'
import LockedSection from '@/components/LockedSection'
import ExamSchedule from '@/components/ExamSchedule'

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
      <section style={{
        background: 'var(--sage-lightest)',
        padding: '40px 24px',
        borderBottom: '0.5px solid var(--sage-border)',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{ color: 'var(--sage-muted)', fontSize: '13px', marginBottom: '6px' }}>
            고등학교
          </p>
          <h1 style={{ color: 'var(--sage-text)', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.3px', marginBottom: '8px' }}>
            {decodedName}
          </h1>
          {school?.address && (
            <p style={{ color: 'var(--sage-muted)', fontSize: '14px', margin: 0 }}>
              {school.address}
            </p>
          )}
        </div>
      </section>

      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ color: 'var(--sage-text)', fontSize: '17px', fontWeight: '600', marginBottom: '20px' }}>
          시험 일정
        </h2>
        {school?.neisCode && school?.neisRegionCode ? (
          <ExamSchedule
            schoolName={decodedName}
            neisRegionCode={school.neisRegionCode}
            neisCode={school.neisCode}
          />
        ) : (
          <p style={{ color: 'var(--sage-muted)', fontSize: '14px' }}>시험 일정 정보가 없습니다.</p>
        )}
      </section>

      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px 40px' }}>
        <h2 style={{ color: 'var(--sage-text)', fontSize: '17px', fontWeight: '600', marginBottom: '20px' }}>
          과목별 시험 정보
        </h2>
        <ExamList exams={school?.exams ?? []} />
      </section>

      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px 40px' }}>
        <h2 style={{ color: 'var(--sage-text)', fontSize: '17px', fontWeight: '600', marginBottom: '20px' }}>
          시험 상세 분석
        </h2>
        <LockedSection />
      </section>
    </main>
  )
}
import SearchBar from '@/components/SearchBar'

export default function Home() {
  return (
    <main>
      <section style={{
        background: 'var(--sage-lightest)',
        padding: '72px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--sage-button)', fontSize: '13px', fontWeight: '500', letterSpacing: '0.08em', marginBottom: '14px' }}>
          전국 고등학교 시험 정보 공유
        </p>
        <h1 style={{ color: 'var(--sage-text)', fontSize: '34px', fontWeight: '700', lineHeight: '1.35', marginBottom: '14px', letterSpacing: '-0.5px' }}>
          우리 학교 시험,<br />어디서 찾으세요?
        </h1>
        <p style={{ color: 'var(--sage-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '36px' }}>
          시험 범위, 교재, 출제 유형까지<br />과외 선생님과 학생 모두를 위한 시험 정보
        </p>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <SearchBar />
        </div>
      </section>

      <section style={{ padding: '56px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '680px', width: '100%' }}>
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12h6M9 16h4" strokeLinecap="round"/>
                </svg>
              ),
              title: '시험 범위',
              desc: '과목별 범위와 교재를 한눈에',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: '출제 유형',
              desc: '어법, 어휘, 서술형 유형별 문항 수',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: '시험 총평',
              desc: '난이도와 총평으로 미리 파악하기',
            },
          ].map((item) => (
            <div key={item.title} style={{
              background: 'white',
              border: '0.5px solid var(--sage-border)',
              borderRadius: '12px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ color: 'var(--sage-button)' }}>{item.icon}</div>
              <p style={{ color: 'var(--sage-text)', fontSize: '14px', fontWeight: '600', margin: 0 }}>{item.title}</p>
              <p style={{ color: 'var(--sage-muted)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
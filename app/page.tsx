import SearchBar from '@/components/SearchBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Image from 'next/image'

export default function Home() {
  return (
    <main>
      <section
        style={{
          background: 'var(--pastel-yellow)',
          padding: '78px 24px 56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ marginBottom: '14px' }}>
          <Badge tone="accent">전국 고등학교 시험 정보 공유</Badge>
        </div>
        <h1
          style={{
            color: 'var(--text)',
            fontSize: '38px',
            fontWeight: 1000,
            lineHeight: '1.22',
            marginBottom: '12px',
            letterSpacing: '-0.8px',
          }}
        >
          우리 학교 시험,<br />어디서 찾으세요?
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.75', marginBottom: '24px' }}>
          시험 범위부터 출제 유형까지,<br />급할 때 바로 찾는 학교 시험 정보
        </p>
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            filter: 'drop-shadow(0 10px 28px rgba(17, 24, 39, 0.08))',
            position: 'relative',
            zIndex: 50,
          }}
        >
          <SearchBar />
        </div>
      </section>

      <section style={{ padding: '40px 24px 28px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 0 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            maxWidth: '820px',
            width: '100%',
          }}
        >
          {[
            {
              icon: { src: '/시험.png', alt: '시험 범위' },
              title: '시험범위',
              desc: '친구에게 물어보기 애매한 순간,\n검색 한 번으로 확인해요.',
              pastel: 'blue' as const,
            },
            {
              icon: { src: '/선생님.png', alt: '선생님/학부모' },
              title: '학원 선생님·학부모',
              desc: '학생에게 묻지 않아도\n시험범위를 정확하게 알아요.',
              pastel: 'mint' as const,
            },
            {
              icon: { src: '/출제유형.png', alt: '진학 학교 시험 유형' },
              title: '진학할 학교가 궁금할 때',
              desc: '시험 유형이 궁금하다면,\n선배들의 후기를 먼저 봐요.',
              pastel: 'purple' as const,
            },
          ].map((item) => (
            <Card
              key={item.title}
              pastel={item.pastel}
              style={{
                padding: '26px 18px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Image
                src={item.icon.src}
                alt={item.icon.alt}
                width={112}
                height={88}
                style={{
                  display: 'block',
                  width: '112px',
                  height: '88px',
                  objectFit: 'contain',
                  marginBottom: '2px',
                  filter: 'drop-shadow(0 10px 18px rgba(17, 24, 39, 0.12))',
                }}
                priority
              />
              <p
                className="ui-subtitle"
                style={{
                  color: 'var(--text)',
                  margin: '2px 0 0',
                  fontSize: '14px',
                  fontWeight: 950,
                  letterSpacing: '-0.15px',
                }}
              >
                {item.title}
              </p>
              <p
                style={{
                  color: 'var(--muted)',
                  fontSize: '13px',
                  lineHeight: '1.65',
                  margin: '4px 0 0',
                  maxWidth: '260px',
                  whiteSpace: 'pre-line',
                }}
              >
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
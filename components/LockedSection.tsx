'use client'

export default function LockedSection() {
  return (
    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '0.5px solid var(--sage-border)' }}>
      <div style={{ filter: 'blur(5px)', pointerEvents: 'none', padding: '24px', background: 'var(--sage-lightest)' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--sage-muted)', fontSize: '12px', marginBottom: '8px' }}>시험 난이도</p>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1,2,3,4,5].map((i) => (
              <div key={i} style={{
                width: '32px', height: '8px', borderRadius: '4px',
                background: i <= 4 ? 'var(--sage-button)' : 'var(--sage-border)',
              }} />
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--sage-muted)', fontSize: '12px', marginBottom: '8px' }}>출제 유형</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['어법 5문항', '어휘 3문항', '서술형 2문항', '내용일치 4문항'].map((tag) => (
              <span key={tag} style={{
                background: 'var(--sage-light)',
                color: 'var(--sage-text)',
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '0.5px solid var(--sage-border)',
              }}>{tag}</span>
            ))}
          </div>
        </div>
        <div>
          <p style={{ color: 'var(--sage-muted)', fontSize: '12px', marginBottom: '8px' }}>총평</p>
          <p style={{ color: 'var(--sage-text)', fontSize: '14px', lineHeight: '1.6' }}>
            작년보다 전반적으로 어려웠으며 서술형 비중이 높았습니다. 어법 문제는 평이한 수준이었으나 어휘 문제가 까다로웠습니다.
          </p>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: 'rgba(244, 248, 245, 0.6)',
      }}>
        <p style={{ color: 'var(--sage-text)', fontSize: '15px', fontWeight: '600' }}>
          로그인 후 확인할 수 있어요
        </p>
        <button style={{
          background: 'var(--sage-button)',
          color: 'white',
          border: 'none',
          padding: '10px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
        }}>
          로그인하기
        </button>
      </div>
    </div>
  )
}
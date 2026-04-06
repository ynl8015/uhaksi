'use client'

export default function LockedSection() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
        <p>시험 난이도: ★★★★☆</p>
        <p>출제 유형: 어법 5문제, 어휘 3문제, 서술형 2문제</p>
        <p>총평: 작년보다 어려웠으며 서술형 비중이 높았습니다.</p>
      </div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <p>로그인 후 확인할 수 있습니다</p>
        <button>로그인하기</button>
      </div>
    </div>
  )
}
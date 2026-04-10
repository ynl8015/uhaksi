import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { SITE_CONTACT_EMAIL } from '@/lib/siteContact'

export const metadata: Metadata = {
  title: '개인정보처리방침 | 우리학교시험',
  description: '우리학교시험 개인정보처리방침',
}

const h2: CSSProperties = {
  margin: '28px 0 10px',
  fontSize: '16px',
  fontWeight: 800,
  color: 'var(--text)',
  letterSpacing: '-0.2px',
}

const p: CSSProperties = { margin: '0 0 12px', color: 'var(--muted)' }
const ul: CSSProperties = { margin: '0 0 12px', paddingLeft: '20px', color: 'var(--muted)' }
const li: CSSProperties = { marginBottom: '6px' }

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 56px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.4px' }}>
        개인정보처리방침
      </h1>
      <p style={{ ...p, marginBottom: '24px', fontSize: '13px' }}>
        시행일: 2026년 4월 10일
      </p>

      <article style={{ fontSize: '14px', lineHeight: 1.75 }}>
        <p style={p}>
          우리학교시험(이하 &quot;서비스&quot;)은 「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한
          고충을 신속히 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>

        <h2 style={h2}>1. 개인정보의 처리 목적</h2>
        <p style={p}>서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 목적이 변경되는 경우에는 사전 동의를 받습니다.</p>
        <ul style={ul}>
          <li style={li}>회원 가입·본인 확인, 이메일 인증, 로그인·계정 관리</li>
          <li style={li}>학생 회원의 학생증 기반 재학 확인 및 인증된 학교명 표시(커뮤니티 등)</li>
          <li style={li}>시험 정보·후기·커뮤니티 게시물 등 서비스 제공 및 품질 개선</li>
          <li style={li}>부정 이용 방지, 비인가 사용 방지, 분쟁 조정·민원 처리</li>
          <li style={li}>서비스 안내·고지(법령상 필요한 경우)</li>
        </ul>

        <h2 style={h2}>2. 처리하는 개인정보 항목</h2>
        <p style={p}>
          <strong style={{ color: 'var(--text)' }}>(1) 회원가입 및 계정</strong>
        </p>
        <ul style={ul}>
          <li style={li}>필수: 로그인 아이디, 비밀번호(암호화 저장), 이메일 주소, 이름(표시명), 계정 유형(학생/기타)</li>
          <li style={li}>선택: 별도로 요청하는 경우에 한함</li>
        </ul>
        <p style={p}>
          <strong style={{ color: 'var(--text)' }}>(2) 학생증 인증(학생 회원)</strong>
        </p>
        <ul style={ul}>
          <li style={li}>
            업로드하신 학생증 이미지는 인증 처리를 위해 일시적으로 분석될 수 있습니다. 인증 결과로 확인된 학교명은 회원 정보에
            저장되며, 이미지 파일 자체는 회원 정보에 영구 저장하지 않는 것을 원칙으로 합니다. 다만 서비스 보안·분쟁 대응을 위해
            일시 로그 등 최소한의 기록이 남을 수 있습니다.
          </li>
        </ul>
        <p style={p}>
          <strong style={{ color: 'var(--text)' }}>(3) 서비스 이용 과정에서 자동 수집될 수 있는 항목</strong>
        </p>
        <ul style={ul}>
          <li style={li}>접속 로그, IP 주소, 쿠키, 기기·브라우저 정보, 이용 기록 등</li>
        </ul>
        <p style={p}>
          <strong style={{ color: 'var(--text)' }}>(4) 회원이 입력하는 콘텐츠</strong>
        </p>
        <ul style={ul}>
          <li style={li}>시험 범위·일정 등 사용자 생성 정보</li>
          <li style={li}>시험 후기(난이도, 문항 수, 선택 입력 텍스트 등)</li>
          <li style={li}>커뮤니티 글·댓글, 공부 인증 등에 첨부하는 이미지(해당 기능 이용 시)</li>
        </ul>

        <h2 style={h2}>3. 개인정보의 처리 및 보유 기간</h2>
        <ul style={ul}>
          <li style={li}>회원 정보: 회원 탈퇴 또는 처리 목적 달성 시 지체 없이 파기합니다. 다만 관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.</li>
          <li style={li}>전자상거래 등에서의 소비자보호에 관한 법률 등에 따른 거래·분쟁 기록은 법정 기간에 따라 보관할 수 있습니다.</li>
          <li style={li}>현재 웹상에서 즉시 탈퇴 기능이 없는 경우, 삭제·열람 요청은 아래 연락처로 요청하실 수 있습니다.</li>
        </ul>

        <h2 style={h2}>4. 개인정보의 제3자 제공</h2>
        <p style={p}>
          서비스는 원칙적으로 이용자의 개인정보를 제1조의 범위 내에서만 처리하며, 이용자의 동의 없이 제3자에게 제공하지 않습니다.
          다만 법령에 특별한 규정이 있는 경우는 예외로 합니다.
        </p>

        <h2 style={h2}>5. 개인정보 처리의 위탁 및 국외 이전</h2>
        <p style={p}>
          서비스는 원활한 운영을 위해 다음과 같이 개인정보 처리 업무를 위탁하거나, 기술 처리 과정에서 해외 사업자의 시스템을 이용할 수
          있습니다.
        </p>
        <ul style={ul}>
          <li style={li}>
            <strong style={{ color: 'var(--text)' }}>클라우드·호스팅</strong>: 웹 애플리케이션 및 데이터베이스 운영(예: Vercel 등).
            이전되는 국가·항목·기간은 해당 사업자의 정책 및 계약에 따르며, 필요 시 추가 고지합니다.
          </li>
          <li style={li}>
            <strong style={{ color: 'var(--text)' }}>AI·이미지 분석</strong>: 학생증 진위·학교명 추출, 일부 이미지 검수, 후기 요약 등에
            Anthropic 등 외부 AI API를 사용할 수 있습니다. 이 과정에서 이미지·텍스트가 암호화된 통신으로 해당 사업자에 전송될 수
            있습니다.
          </li>
          <li style={li}>
            <strong style={{ color: 'var(--text)' }}>이메일 발송</strong>: 가입 인증·비밀번호 재설정 등에 Resend 등 이메일 발송
            서비스를 이용할 수 있습니다.
          </li>
        </ul>

        <h2 style={h2}>6. 쿠키 및 세션</h2>
        <p style={p}>
          서비스는 로그인 유지 등을 위해 쿠키 및 세션(JWT 기반 인증 등)을 사용할 수 있습니다. 브라우저 설정에서 쿠키 저장을 거부할
          수 있으나, 일부 기능이 제한될 수 있습니다.
        </p>

        <h2 style={h2}>7. 정보주체의 권리·의무 및 행사 방법</h2>
        <p style={p}>
          이용자는 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등을 할 수 있습니다. 요청은{' '}
          <a href={`mailto:${SITE_CONTACT_EMAIL}`} style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>
            {SITE_CONTACT_EMAIL}
          </a>
          로 하실 수 있으며, 서비스는 지체 없이 조치하겠습니다.
        </p>

        <h2 style={h2}>8. 개인정보의 파기</h2>
        <p style={p}>
          보유기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구 불가능한 방법으로 삭제하며,
          종이 문서는 분쇄 또는 소각합니다.
        </p>

        <h2 style={h2}>9. 개인정보의 안전성 확보 조치</h2>
        <ul style={ul}>
          <li style={li}>비밀번호 암호화 저장, 전송 구간 SSL 적용 등 기술적 조치</li>
          <li style={li}>접근 권한 관리 및 최소화</li>
          <li style={li}>보안 점검 및 침해 대응</li>
        </ul>

        <h2 style={h2}>10. 아동의 개인정보</h2>
        <p style={p}>
          만 14세 미만 아동의 개인정보를 처리하기 위해서는 법정대리인의 동의가 필요합니다. 운영자는 법정대리인의 동의 없이 만 14세
          미만 아동으로부터 개인정보를 수집하지 않도록 합니다.
        </p>

        <h2 style={h2}>11. 개인정보 보호책임자</h2>
        <p style={{ ...p, marginBottom: 0 }}>
          개인정보 처리에 관한 문의·불만·피해 구제는 아래로 연락해 주세요.
          <br />
          <br />
          이메일:{' '}
          <a href={`mailto:${SITE_CONTACT_EMAIL}`} style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>
            {SITE_CONTACT_EMAIL}
          </a>
        </p>

        <h2 style={h2}>12. 고지의 의무</h2>
        <p style={{ ...p, marginBottom: 0 }}>
          본 방침의 내용 추가·삭제·수정이 있는 경우 시행일 7일 전(이용자에게 불리한 변경은 30일 전)부터 서비스 내 공지합니다.
        </p>
      </article>
    </main>
  )
}

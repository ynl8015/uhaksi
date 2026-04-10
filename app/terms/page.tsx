import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONTACT_EMAIL } from '@/lib/siteContact'

export const metadata: Metadata = {
  title: '이용약관 | 우리학교시험',
  description: '우리학교시험 서비스 이용약관',
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

export default function TermsPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 56px' }}>
      <p style={{ margin: '0 0 20px' }}>
        <Link href="/" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', textDecoration: 'none' }}>
          ← 홈
        </Link>
      </p>
      <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.4px' }}>
        이용약관
      </h1>
      <p style={{ ...p, marginBottom: '24px', fontSize: '13px' }}>
        시행일: 2026년 4월 10일
      </p>

      <article style={{ fontSize: '14px', lineHeight: 1.75 }}>
        <h2 style={h2}>제1조 (목적)</h2>
        <p style={p}>
          본 약관은 우리학교시험(이하 &quot;서비스&quot;)이 제공하는 전국 고등학교 시험 정보 공유·검색 및 관련 부가 기능의 이용과 운영에
          관한 회원과 운영자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>

        <h2 style={h2}>제2조 (용어의 정의)</h2>
        <ul style={ul}>
          <li style={li}>
            &quot;서비스&quot;란 학교 시험 일정·범위 등 정보를 열람·등록하고, 학생 인증 회원을 대상으로 커뮤니티·시험 후기 등을 이용할 수
            있도록 운영되는 우리학교시험 웹 서비스를 말합니다.
          </li>
          <li style={li}>
            &quot;회원&quot;이란 본 약관에 동의하고 가입 절차를 완료한 자를 말합니다.
          </li>
          <li style={li}>
            &quot;게시물&quot;이란 회원이 서비스에 게시한 글, 댓글, 이미지 등 모든 형태의 정보를 말합니다.
          </li>
        </ul>

        <h2 style={h2}>제3조 (약관의 효력 및 변경)</h2>
        <p style={p}>
          본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다. 운영자는 관련 법령을 위배하지 않는
          범위에서 약관을 개정할 수 있으며, 개정 시 적용일자 및 사유를 명시하여 사전에 공지합니다. 회원이 개정 후에도 서비스를 계속
          이용하는 경우 변경에 동의한 것으로 봅니다.
        </p>

        <h2 style={h2}>제4조 (서비스의 내용)</h2>
        <p style={p}>서비스는 예를 들어 다음과 같은 기능을 제공할 수 있습니다.</p>
        <ul style={ul}>
          <li style={li}>학교별 시험 일정·시험 범위 등 정보의 조회 및 회원에 의한 등록·수정</li>
          <li style={li}>시험 후기 작성 및 익명 집계·통계·AI 요약 형태의 제공</li>
          <li style={li}>학생 인증을 완료한 회원을 대상으로 한 학생 커뮤니티(질문·팁·공부 인증 등)</li>
          <li style={li}>기타 운영자가 추가·변경하는 기능</li>
        </ul>
        <p style={p}>
          일부 기능은 공공 데이터(예: 나이스 등)를 활용할 수 있으며, 해당 데이터의 정확성·최신성은 출처 기관의 정책에 따릅니다. 회원이
          등록한 사용자 생성 정보는 회원의 책임 하에 제공됩니다.
        </p>

        <h2 style={h2}>제5조 (회원가입 및 계정)</h2>
        <ul style={ul}>
          <li style={li}>만 14세 미만은 법정대리인의 동의 없이 가입할 수 없습니다.</li>
          <li style={li}>
            회원은 실명이 아닌 닉네임 형태의 이름 등을 사용할 수 있으나, 타인을 사칭하거나 운영자·제3자를 기망할 수 없습니다.
          </li>
          <li style={li}>계정 정보(아이디·비밀번호 등) 관리 책임은 회원에게 있으며, 제3자에게 양도·대여할 수 없습니다.</li>
          <li style={li}>
            커뮤니티 등 일부 기능은 &quot;학생&quot; 유형 가입 및 학생증 인증 절차를 완료한 회원 또는 운영자가 허용한 계정에 한해
            이용할 수 있습니다.
          </li>
        </ul>

        <h2 style={h2}>제6조 (회원의 의무 및 금지행위)</h2>
        <p style={p}>회원은 다음 각 호의 행위를 하여서는 안 됩니다.</p>
        <ul style={ul}>
          <li style={li}>관계 법령, 본 약관, 서비스 내 공지·운영정책에 위반되는 행위</li>
          <li style={li}>타인의 개인정보·저작권·초상권 등 권리를 침해하는 행위</li>
          <li style={li}>특정 학교·교원·학생을 식별·비방·협박하거나 학교 평판을 훼손하는 행위</li>
          <li style={li}>음란·폭력·혐오·불법 행위를 조장하거나 불법 정보를 유포하는 행위</li>
          <li style={li}>시스템·보안을 침해하거나 자동화 수단으로 부당하게 서비스에 부하를 주는 행위</li>
          <li style={li}>서비스가 정한 이미지 검수·운영 취지에 반하는 콘텐츠를 게시하는 행위(예: 공부 인증란에 시험지·답안 사진 등)</li>
        </ul>

        <h2 style={h2}>제7조 (게시물의 관리 및 저작권)</h2>
        <p style={p}>
          회원이 작성한 게시물의 저작권은 회원에게 귀속됩니다. 다만 회원은 운영자가 서비스 운영·개선·홍보(비식별·집계 형태 포함)에
          필요한 범위에서 게시물을 저장·복제·수정·전시·배포할 수 있는 비독점적 이용을 허락합니다. 운영자는 약관 또는 법령 위반,
          권리 침해 소지가 있는 게시물에 대해 사전 통지 없이 삭제·비공개·이용 제한 등 조치를 할 수 있습니다.
        </p>

        <h2 style={h2}>제8조 (서비스의 변경·중단)</h2>
        <p style={p}>
          운영자는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다. 가능한 경우 사전에 공지하되,
          긴급한 경우 사후 공지할 수 있습니다.
        </p>

        <h2 style={h2}>제9조 (이용 제한·계약 해지)</h2>
        <p style={p}>
          회원이 본 약관을 위반하거나 서비스 운영을 방해한 경우, 운영자는 경고·일시 정지·영구 이용 정지 등 제한 조치를 할 수 있습니다.
          회원은 언제든지 서비스 이용을 중단할 수 있으며, 개인정보 삭제 등은 개인정보처리방침 및 별도 안내에 따릅니다.
        </p>

        <h2 style={h2}>제10조 (면책)</h2>
        <ul style={ul}>
          <li style={li}>
            서비스는 &quot;있는 그대로&quot; 제공되며, 회원이 등록한 정보·게시물의 정확성·완전성을 보증하지 않습니다.
          </li>
          <li style={li}>천재지변, 시스템 장애, 제3자 서비스 장애 등 불가항력으로 인한 손해에 대해 운영자는 책임을 지지 않습니다.</li>
          <li style={li}>
            서비스를 통해 얻은 정보에 따른 수험·진학·학업 결정은 회원 본인의 판단과 책임 하에 이루어져야 합니다.
          </li>
        </ul>

        <h2 style={h2}>제11조 (준거법 및 재판관할)</h2>
        <p style={p}>
          본 약관은 대한민국 법령에 따르며, 서비스와 관련하여 분쟁이 발생한 경우 운영자의 주소지를 관할하는 법원을 제1심 관할
          법원으로 합니다. 다만 민사소송법 등에서 달리 정한 경우에는 그에 따릅니다.
        </p>

        <h2 style={h2}>제12조 (문의)</h2>
        <p style={{ ...p, marginBottom: 0 }}>
          본 약관에 관한 문의는{' '}
          <a href={`mailto:${SITE_CONTACT_EMAIL}`} style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>
            {SITE_CONTACT_EMAIL}
          </a>
          로 연락해 주세요.
        </p>
      </article>
    </main>
  )
}

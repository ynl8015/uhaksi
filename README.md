<div align="center">

<img width="900" height="320" alt="우학시 배너" src="https://github.com/user-attachments/assets/2ece70e6-5cba-4951-b620-210ce53f881d" />

<br/>
<br/>

## 서비스 소개

**같은 학교 학생들끼리 시험 범위·후기·공부 정보를 나누는 공간입니다.**

NEIS 공공 데이터와 AI를 엮어 정보 수집의 수고를 줄이고, 
<br/>
<br/>
학생 인증 커뮤니티로 재방문 이유를 만들었습니다.

<br/>
[🌐 서비스 바로가기] 
<br/>
(https://uhaksi.kr)
<br/>
<br/>

[서비스 소개](#서비스-소개)
<br/>
[주요 기능](#주요-기능)
<br/>
[아키텍처](#아키텍처)
<br/>
[핵심 경험](#핵심-경험)
<br/>
[개발 스토리](#개발-스토리)

</div>

## 주요 기능
<br/>

<div align="center">

**[1] 통신문 사진 → 시험 시간표 자동 정렬**

통신문 사진을 올리면 <br/>
AI가 과목·날짜·시간을 인식해 학년별 시간표로 변환합니다.

![Image](https://github.com/user-attachments/assets/6b4a1cc9-c77b-4e76-909b-42e12aad3d49)

<br/>

**[2] 학생 리뷰 기반 AI 시험 유형 분석**
<br/>

후기가 쌓일수록 더 정확해지는 <br/>
**학교별 시험 유형 안내**를 제공합니다.
<br/>

![Image](https://github.com/user-attachments/assets/193d102b-9c38-4d1c-8142-5759290f1063)

<br/>

**[3] 같은 학교 학생들만의 커뮤니티**
<br/>

당근마켓이 동네로 이웃을 연결하듯, 
<br/>
우학시는 **학생**이라는 공통분모로 같은 학교 친구들을 연결합니다.
<br/>
익명 게시판, 댓글, 공부 인증 — 시험 기간에 함께할 수 있는 공간입니다.
<br/>

![Image](https://github.com/user-attachments/assets/49c4c50b-f018-410c-8cf0-c1ad52f411da)

<br/>

**[4] 학생증 + 본명 인증 로그인**
<br/>

학생증 Vision 검증 + 본명 정규화 매칭으로 
<br/>
실제 재학생만 커뮤니티에 접근할 수 있습니다.
<br/>
<img width="964" height="703" alt="Image" src="https://github.com/user-attachments/assets/0d8492c4-c649-48e8-a3f2-c1878570c749" />

</div>

<br/>

## 아키텍처

<div align="center">

<img width="734" height="433" alt="우학시 아키텍처" src="https://github.com/user-attachments/assets/0e96021a-6019-4861-9e7b-03f43cc8db8b" />

</div>

<br/>

| Category | Stack |
|----------|-------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) |
| **Backend** | ![Next.js](https://img.shields.io/badge/Route_Handler-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=flat-square&logo=prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) |
| **Auth** | ![NextAuth](https://img.shields.io/badge/NextAuth.js-5682F3?style=flat-square) |
| **AI / 이미지** | ![Anthropic](https://img.shields.io/badge/Claude_Vision-D4A27F?style=flat-square&logo=anthropic&logoColor=white) ![Sharp](https://img.shields.io/badge/Sharp-99CC00?style=flat-square) |
| **외부 연동** | ![NEIS](https://img.shields.io/badge/NEIS_오픈API-0066CC?style=flat-square) ![Resend](https://img.shields.io/badge/Resend-000000?style=flat-square) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) |

<br/>

## 핵심 경험

🧪 **유저테스트로 서비스 방향을 바꾼 경험**

> "시험 정보는 한 번 보고 끝인데, 자주 들어올 이유가 없어요."

이 피드백 하나로 **학생 커뮤니티**를 추가했습니다. 단발성 서비스에서 재방문 이유가 있는 서비스로 바뀐 전환점이었습니다.

→ [커밋](https://github.com/ynl8015/uhaksi/commit/0f8c503b7dbb74bedfbcfeb7cbb371e41ee1de18)

<br/>

⚡ **학교 검색 — 세 번의 기술 선택**

DB 쿼리 → 정적 JSON → 캐싱 + 병렬 로딩 순으로 바꿨습니다.
"언제 단순한 방법을 쓰고, 언제 바꿔야 하는가"를 직접 겪으며 결정했습니다.

→ [DB→JSON 커밋](https://github.com/ynl8015/uhaksi/commit/5edd1cbc4e63a23fc5ed3790f2829156355c4814) &nbsp;·&nbsp; [캐싱 커밋](https://github.com/ynl8015/uhaksi/commit/9a9302b681efb3434a9122a0ea9556cc730ef24e)

<br/>

🏗️ **비즈니스 상황에 맞는 아키텍처 판단**

이미지는 현재 DB에 Base64로 저장합니다. 단순하게 시작하되, 트래픽이 늘면 객체 스토리지로 전환할 수 있도록 인지하고 설계했습니다.
AI API 비용 누적 리스크도 파악하고, 필요 시 Route Handler 단에서 제어를 강화할 수 있습니다.

<br/>

🔑 **신뢰를 코드로 구현한 접근 제어**

본명 일치 검사, 작성자 서버 검증, 시험지 업로드 Vision 차단까지 — 신뢰할 수 있는 공간을 코드로 만들었습니다.

→ [커밋](https://github.com/ynl8015/uhaksi/commit/f0fa6989045fa01458f223b1eba1703553bc8fa0)

<br/>

🖼️ **AI 인식률을 높이기 위한 이미지 전처리**

Sharp로 회전 보정·그레이스케일·샤프닝을 적용한 뒤 Claude Vision에 전달했습니다.
데이터 준비가 결과 품질을 결정한다는 걸 직접 경험했습니다.

<br/>

🔍 **SEO — 검색에서 찾을 수 있어야 쓰인다**

사이트맵·robots.txt·JSON-LD를 추가하고, Vercel 환경에서 한글 파일명 이미지 깨짐 문제를 트러블슈팅했습니다.

→ [커밋](https://github.com/ynl8015/uhaksi/commit/24e48f48a1e8a3a6237668c054725ccecf4bc0ab)

<br/>

## 개발 스토리

| 주제 | 커밋 |
|------|------|
| 유저테스트 반영 — 학생 커뮤니티 추가 | [→](https://github.com/ynl8015/uhaksi/commit/0f8c503b7dbb74bedfbcfeb7cbb371e41ee1de18) |
| 학교 검색 — API 캐싱으로 응답 속도 개선 | [→](https://github.com/ynl8015/uhaksi/commit/21f8b545147bae8503f931034e8d8a0b5e8a44ad) |
| 학교 검색 — DB 쿼리 → 정적 JSON 교체 | [→](https://github.com/ynl8015/uhaksi/commit/5edd1cbc4e63a23fc5ed3790f2829156355c4814) |
| NEIS API 캐싱 및 병렬 데이터 로딩 | [→](https://github.com/ynl8015/uhaksi/commit/9a9302b681efb3434a9122a0ea9556cc730ef24e) |
| 학생증 인증 — 본명 일치 검사 추가 | [→](https://github.com/ynl8015/uhaksi/commit/f0fa6989045fa01458f223b1eba1703553bc8fa0) |
| NEIS 학사일정 연동 및 학교 페이지 | [→](https://github.com/ynl8015/uhaksi/commit/a6d6e3e2d76a68ab975c5ce71447be38d9dda0d1) |
| SEO 기반 마련 (사이트맵·robots·JSON-LD) | [→](https://github.com/ynl8015/uhaksi/commit/24e48f48a1e8a3a6237668c054725ccecf4bc0ab) |

<br/>

## 👩‍💻 개발자 소개

<div align="center">

| Name | Avatar | MBTI | Role |
|------|--------|------|------|
| **이유나** | <img width="80" height="80" style="border-radius:50%" alt="이유나" src="https://github.com/user-attachments/assets/8d7bb0c4-3833-4fdb-9b25-c84bf861a7db" /> | INFP | FE (+BE) |

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-ynl8015-181717?style=flat-square&logo=github)](https://github.com/ynl8015)
[![서비스](https://img.shields.io/badge/Service-uhaksi.kr-000000?style=flat-square&logo=vercel&logoColor=white)](https://uhaksi.kr)

</div>

<div align="center">

<img width="800" height="273" alt="Image" src="https://github.com/user-attachments/assets/2ece70e6-5cba-4951-b620-210ce53f881d" />
<br/>
<br/>
<br/>

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

<br/>

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https://github.com/ynl8015/uhaksi)](https://github.com/ynl8015/uhaksi)

**[🌐 서비스 바로가기](https://uhaksi.kr)**

<br/>

[🎓 서비스 소개](#-서비스-소개) &nbsp;·&nbsp;
[✨ 주요 기능](#-주요-기능) &nbsp;·&nbsp;
[⚙️ 아키텍처](#️-아키텍처) &nbsp;·&nbsp;
[🗜️ 핵심 경험](#️-핵심-경험) &nbsp;·&nbsp;
[📖 개발 스토리](#-개발-스토리)

</div>

<br/>

## 🎓 서비스 소개

학교마다 시험 정보를 혼자 발로 뛰며 모아야 하는 불편함에서 출발했습니다.

우학시는 **같은 학교 학생들끼리 시험 범위·후기·공부 정보를 나누는 공간**입니다.
NEIS 공공 데이터와 AI를 엮어 정보 수집의 수고를 줄이고, 학생 인증 커뮤니티로 재방문 이유를 만들었습니다.

<!-- 🖼️ 메인 화면 전체 스크린샷 또는 서비스 흐름 GIF -->
<!-- ![메인화면](이미지_URL) -->

<br/>

## ✨ 주요 기능

### 📋 통신문 사진 → 시험 시간표 자동 정렬

학교에서 받은 통신문 사진을 올리면 끝입니다.
AI가 자동으로 시험 과목·날짜·시간을 인식해 학년별로 큐레이팅된 시간표로 변환합니다.
Sharp로 이미지를 전처리(회전·그레이스케일·샤프닝)한 뒤 Claude Vision에 전달해 인식률을 높였습니다.

![Image](https://github.com/user-attachments/assets/6b4a1cc9-c77b-4e76-909b-42e12aad3d49)
<br/>

<br>

### 📊 학생 리뷰 기반 AI 시험 유형 분석

학생들이 남긴 후기를 모아 Claude가 분석합니다.
"이 학교 수학은 서술형 비중이 높다", "작년과 난이도가 달라졌다"처럼 데이터가 쌓일수록 더 정확해지는 **학교별 시험 유형 안내**를 제공합니다.

<!-- 🖼️ 후기 집계 및 AI 분석 결과 스크린샷 -->
<!-- ![AI분석](이미지_URL) -->

<br/>

### 👥 같은 학교 학생들만의 커뮤니티

당근마켓이 동네라는 공간으로 낯선 이웃을 연결하듯, 우학시는 **학생**이라는 공통분모로 같은 학교 친구들을 연결합니다.
외부인이 없는 내집단 안에서 더 솔직하고 실질적인 정보가 오갑니다.
익명 게시판, 댓글, 공부 인증까지 — 시험 기간에 함께할 수 있는 공간입니다.

<!-- 🖼️ 커뮤니티 화면 GIF -->
<!-- ![커뮤니티](이미지_URL) -->

<br/>

### 🔐 학생증 + 본명 인증 로그인

아무나 들어올 수 없습니다.
학생증 이미지를 Vision으로 검증하고, 본명 정규화 매칭으로 실제 재학생 여부를 확인합니다.
인증을 통과한 학생만 커뮤니티에 접근할 수 있어 **신뢰할 수 있는 정보**가 오가는 환경을 만들었습니다.

<!-- 🖼️ 학생증 인증 흐름 GIF -->
<!-- ![인증](이미지_URL) -->

<br/>

## ⚙️ 아키텍처

<img width="734" height="433" alt="Image" src="https://github.com/user-attachments/assets/0e96021a-6019-4861-9e7b-03f43cc8db8b" />

`app/`은 라우팅과 UI만 담당하고, 핵심 도메인 로직은 `lib/`에 모았습니다.
API에서는 `getServerSession`으로 권한을 검사하고, 공유 타입은 `types/`에서 일괄 관리합니다.

| 분류 | 기술 |
|------|------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js Route Handler |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | NextAuth.js (Credentials + JWT) |
| **AI / 이미지** | Claude Vision (Anthropic), Sharp |
| **외부 연동** | NEIS 오픈API, Resend (이메일) |
| **Deployment** | Vercel · Supabase Postgres |

<br/>

## 🗜️ 핵심 경험

<div align="center">

> 기능을 만드는 것과 실제로 쓰이게 만드는 것은 달랐습니다.
> 사용자 관점, 기술 선택, 운영 가능성 — 세 가지를 동시에 고민하며 개발했습니다.

</div>

<br/>

### 🧪 유저테스트로 서비스 방향을 바꾼 경험

기능을 완성하고 나서 직접 써보니 한 가지 의문이 들었습니다.

> **"시험 정보만 있으면 사람들이 다시 올 이유가 없겠다."**

실제로 고등학생에게 유저테스트를 부탁했고, 돌아온 피드백은 명확했습니다.

> *"시험 정보는 한 번 보고 끝인데, 자주 들어올 이유가 없어요."*

이 피드백을 바탕으로 **학생 인증 커뮤니티**를 추가했습니다.
같은 학교 학생끼리 익명으로 소통할 수 있는 공간을 만들어 단발성 서비스에서 재방문 이유가 있는 서비스로 방향을 전환했습니다.

→ [커밋: 학생 커뮤니티(탭·익명·상세·댓글)](https://github.com/ynl8015/uhaksi/commit/0f8c503b7dbb74bedfbcfeb7cbb371e41ee1de18)

<!-- 🖼️ 커뮤니티 추가 전/후 비교 스크린샷 또는 GIF -->
<!-- ![유저테스트](이미지_URL) -->

<br/>

### ⚡ 학교 검색 — 세 번의 기술 선택

학교 검색은 처음부터 정답이 없었습니다. 상황에 맞게 세 번 바꿨습니다.

**1단계 — DB 쿼리 기반**
처음엔 Prisma로 DB에서 직접 검색했습니다.
구조는 단순하지만 타이핑할 때마다 DB를 조회하는 비용이 부담이었습니다.
→ [커밋: 학교 검색 API 캐싱 추가](https://github.com/ynl8015/uhaksi/commit/21f8b545147bae8503f931034e8d8a0b5e8a44ad)

**2단계 — 정적 JSON으로 교체**
학교 데이터는 자주 바뀌지 않는다는 걸 깨닫고 빌드 시 정적 JSON으로 만들었습니다.
서버 부하를 없앤 이 선택이 단순한 방법이 더 나은 경우였습니다.
→ [커밋: DB 쿼리 → 정적 JSON 교체](https://github.com/ynl8015/uhaksi/commit/5edd1cbc4e63a23fc5ed3790f2829156355c4814)

**3단계 — 캐싱 + 병렬 로딩**
NEIS API 호출을 병렬로 처리하고 캐싱을 추가했습니다.
페이지 전체 응답 속도를 개선했습니다.
→ [커밋: NEIS API 캐싱 및 병렬 데이터 로딩](https://github.com/ynl8015/uhaksi/commit/9a9302b681efb3434a9122a0ea9556cc730ef24e)

"언제 단순한 방법을 쓰고, 언제 바꿔야 하는가"를 직접 겪으며 결정했습니다.

<!-- 🖼️ 검색 속도 개선 전/후 네트워크 탭 캡처 -->
<!-- ![검색개선](이미지_URL) -->

<br/>

### 🏗️ 비즈니스 상황에 맞는 아키텍처 판단

**이미지 저장**
커뮤니티 이미지는 현재 DB에 Base64(`imageData`)로 저장합니다.
구현을 단순하게 가져가기 위한 선택이고, 트래픽이 늘면 Row 크기·응답 페이로드가 커질 수 있다는 점은 인지하고 있습니다.
필요 시 **객체 스토리지 + URL**로 옮기는 쪽이 확장에 유리합니다.

**AI API 비용·남용**
`parse-exam`은 Anthropic을 호출하는 무거운 API입니다.
운영 관점에서는 **로그인 세션·사용자당 한도** 등으로 남용을 막는 편이 안전합니다.
비용이 누적될 수 있다는 점은 인지하고 있으며, 필요 시 Route Handler 단에서 제어를 강화할 수 있습니다.

**후기 집계와 AI 요약**
후기가 바뀔 때마다 집계·AI 요약을 맞추는 흐름으로 **데이터 일관성**을 우선했습니다.
트래픽이 커지면 배치 처리·조건부 트리거 등으로 호출 수를 줄이는 것도 검토할 수 있습니다.

<br/>

### 🔑 신뢰를 코드로 구현한 접근 제어

커뮤니티를 아무나 쓸 수 있으면 의미가 없습니다.
학생증 이미지 Vision 검증에 **본명 일치 검사**를 추가해 실제 재학생 여부를 더 엄격하게 판단하도록 했습니다.
게시글 수정·삭제는 **서버에서 반드시 작성자 검증**을 거치도록 이중 체크했고, 관리용 API는 별도 시크릿 헤더로 보호해 환경변수로만 주입합니다.
공부 인증 게시판에는 **Vision 기반 시험지 업로드 차단**을 추가해 콘텐츠 정책을 수동 관리가 아닌 자동화로 구현했습니다.

→ [커밋: 학생증 본명 일치 검사 추가](https://github.com/ynl8015/uhaksi/commit/f0fa6989045fa01458f223b1eba1703553bc8fa0)

<!-- 🖼️ 학생증 인증 흐름 또는 커뮤니티 게이트 스크린샷 -->
<!-- ![접근제어](이미지_URL) -->

<br/>

### 🖼️ AI 인식률을 높이기 위한 이미지 전처리 파이프라인

시험 시간표 이미지를 Claude Vision에 그냥 넘기면 인식 오류가 잦았습니다.
**Sharp로 이미지를 전처리(회전 보정·그레이스케일·샤프닝)**한 뒤 전달하는 파이프라인을 구성해 파싱 정확도를 크게 높였습니다.
"AI에게 넘기기 전에 데이터를 얼마나 잘 준비하느냐"가 결과 품질을 결정한다는 걸 직접 경험했습니다.

<br/>

### 🔍 SEO — 검색에서 찾을 수 있어야 쓰인다

아무리 잘 만들어도 검색에 안 나오면 소용없습니다.
사이트맵·robots.txt·WebSite JSON-LD를 추가해 검색 크롤링 기반을 마련했습니다.
Vercel 배포 환경에서 한글 파일명 이미지가 깨지는 문제를 발견하고 **public 이미지를 영문 파일명으로 통일**해 해결했습니다.
배포 환경과 로컬이 다르게 동작하는 문제를 직접 트러블슈팅한 경험입니다.

→ [커밋: 사이트맵·robots·JSON-LD 추가](https://github.com/ynl8015/uhaksi/commit/24e48f48a1e8a3a6237668c054725ccecf4bc0ab)

<br/>

## 📖 개발 스토리

| 주제 | 커밋 |
|------|------|
| 유저테스트 반영 — 학생 커뮤니티 추가 | [🔗](https://github.com/ynl8015/uhaksi/commit/0f8c503b7dbb74bedfbcfeb7cbb371e41ee1de18) |
| 학교 검색 — API 캐싱으로 응답 속도 개선 | [🔗](https://github.com/ynl8015/uhaksi/commit/21f8b545147bae8503f931034e8d8a0b5e8a44ad) |
| 학교 검색 — DB 쿼리 → 정적 JSON 교체 | [🔗](https://github.com/ynl8015/uhaksi/commit/5edd1cbc4e63a23fc5ed3790f2829156355c4814) |
| NEIS API 캐싱 및 병렬 데이터 로딩 | [🔗](https://github.com/ynl8015/uhaksi/commit/9a9302b681efb3434a9122a0ea9556cc730ef24e) |
| 학생증 인증 — 본명 일치 검사 추가 | [🔗](https://github.com/ynl8015/uhaksi/commit/f0fa6989045fa01458f223b1eba1703553bc8fa0) |
| NEIS 학사일정 연동 및 학교 페이지 | [🔗](https://github.com/ynl8015/uhaksi/commit/a6d6e3e2d76a68ab975c5ce71447be38d9dda0d1) |
| SEO 기반 마련 (사이트맵·robots·JSON-LD) | [🔗](https://github.com/ynl8015/uhaksi/commit/24e48f48a1e8a3a6237668c054725ccecf4bc0ab) |

<br/>

## 👤 만든 사람

<div align="center">

| | |
|--|--|
| **[이름]** | [@ynl8015](https://github.com/ynl8015) |
| **역할** | 기획 · 설계 · 개발 · 배포 전담 |
| **연락** | [이메일 또는 링크드인 링크] |

</div>

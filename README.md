# turbo-electron

이터널 리턴 전적 검색 Electron 데스크톱 앱.

## 기술 스택

- **앱**: Electron + electron-vite + React + TypeScript
- **번들러**: Turborepo + pnpm workspaces
- **스타일**: styled-components + design-system 토큰
- **라우팅**: react-router-dom (HashRouter)
- **데이터베이스**: Supabase (PostgreSQL)
- **스케줄링**: GitHub Actions (매일 04:00 KST 자동 수집)

## 패키지 구조

```
apps/
  desktop/              # Electron 앱 (메인 + 렌더러)
  crawler/              # 랭커 데이터 수집기 (GitHub Actions 실행)
packages/
  er-api-client/        # BSER Open API HTTP 클라이언트
  er-type/              # API 공유 타입
  service/              # 비즈니스 서비스 레이어
  club-store/           # Supabase 클라이언트 (클럽/랭커 데이터)
  design-system/        # 디자인 토큰 (색상, 간격, 타이포그래피)
  ui/                   # 공통 React 컴포넌트
```

## 시작하기

### 환경변수 설정

`apps/desktop/.env` 파일을 생성합니다.

```env
VITE_API_KEY=your_bser_api_key
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<key>
```

### 개발 서버 실행

```bash
pnpm install
pnpm dev
```

### 빌드

```bash
pnpm build
```

## 주요 기능

- 닉네임으로 플레이어 전적 검색
- 승률, 평균 순위, 킬 등 통계 요약
- 최근 매치 히스토리 및 페이지네이션
- 플레이어 간 스탯 비교 (레이더 차트 / 바 차트)
- 아이템 분석 (무기 타입별 장비, 크레딧 소비)
- 시야 점수 출처 분석 (카메라·드론 기여도, 시간대별 추이)
- 전투 스타일 분석 (생존 시간, 사망 지역, 교전 상대)
- 랭커 데이터 뷰어 (크롤러 수집 데이터 테이블)
- 종겜동 클럽 랭킹 (홈 화면)

## 랭커 데이터 수집 (crawler)

아시아 서버 솔로랭크 탑 랭커의 게임 데이터를 매일 자동 수집합니다.

### GitHub Actions Secrets 설정

레포지토리 Settings → Secrets and variables → Actions에서 등록:

| Secret | 내용 |
|---|---|
| `API_KEY` | BSER Open API 키 |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_KEY` | Supabase service_role 키 |

### 수동 실행

GitHub Actions 탭 → Ranker Data Crawl → Run workflow

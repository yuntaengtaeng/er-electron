# turbo-electron

이터널 리턴 전적 검색 Electron 데스크톱 앱.

## 기술 스택

- **앱**: Electron + electron-vite + React + TypeScript
- **번들러**: Turborepo + pnpm workspaces
- **스타일**: styled-components + design-system 토큰
- **라우팅**: react-router-dom (HashRouter)

## 패키지 구조

```
apps/
  desktop/              # Electron 앱 (메인 + 렌더러)
packages/
  er-api-client/        # BSER Open API HTTP 클라이언트
  er-type/              # API 공유 타입
  service/              # 비즈니스 서비스 레이어
  design-system/        # 디자인 토큰 (색상, 간격, 타이포그래피)
  ui/                   # 공통 React 컴포넌트
```

## 시작하기

### 환경변수 설정

`apps/desktop/.env` 파일을 생성하고 BSER Open API 키를 입력합니다.

```
VITE_API_KEY=your_api_key_here
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
- 아이템 분석 (무기 타입, 크레딧 효율)
- 상위 랭커 목록 (홈 화면)

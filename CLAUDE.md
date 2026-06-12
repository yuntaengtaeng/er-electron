# turbo-electron 프로젝트 가이드

## 프로젝트 개요

이터널 리턴 전적 검색 Electron 데스크톱 앱. Turborepo 기반 pnpm 모노레포.

## 기술 스택

- **번들러**: Turborepo + pnpm workspaces
- **앱**: Electron + electron-vite + React + TypeScript
- **스타일**: styled-components
- **라우팅**: react-router-dom (HashRouter)
- **패키지 매니저**: pnpm

## 모노레포 패키지 구조

```
apps/
  desktop/              # Electron 앱
packages/
  er-api-client/        # BSER Open API HTTP 클라이언트 (ErApiClient 클래스)
  er-type/              # API 공유 타입 정의
  service/              # 비즈니스 서비스 레이어 (er-api-client 래핑)
  design-system/        # 디자인 토큰
  ui/                   # 공통 React 컴포넌트
  typescript-config/    # 공유 tsconfig
  eslint-config/        # 공유 eslint 설정
```

## 레이어 의존성 흐름

```
apps/desktop (renderer)
  → @repo/service          # 비즈니스 로직
    → @repo/er-api-client  # HTTP 클라이언트
      → @repo/er-type      # 타입
```

## 핵심 패턴

### API 키 관리 (의존성 주입)
- API 키는 `apps/desktop/.env`에 `VITE_API_KEY`로 보관
- `apps/desktop/src/renderer/src/main.tsx`에서 `initErService(import.meta.env.VITE_API_KEY)` 호출
- `@repo/service`는 환경변수를 직접 읽지 않음 — 앱에서 주입받음
- `@repo/er-api-client`는 클래스만 export, 인스턴스는 service에서 생성

```ts
// main.tsx
initErService(import.meta.env.VITE_API_KEY)

// service/src/er-service.ts
let erApiClient: ErApiClient
export function initErService(apiKey: string) {
  erApiClient = new ErApiClient(apiKey)
}
```

### CSP (Content Security Policy)
- `apps/desktop/src/main/csp.ts`에서 허용 도메인 목록 관리
- `apps/desktop/src/main/index.ts`에서 `session.webRequest.onHeadersReceived`로 런타임 주입
- **새로운 외부 API 추가 시 `csp.ts`의 `CONNECT_SRC` 배열에만 추가하면 됨**
- 개발 환경(`ELECTRON_RENDERER_URL` 존재)에서는 `unsafe-inline`, `unsafe-eval`, `ws://localhost:*` 자동 허용

### BSER API 응답 구조
- 엔드포인트마다 응답 키가 다름 (`user`, `userGames`, `userStats` 등)
- `er-api-client/src/client.ts`의 `get<T>(path, key)` 메서드에서 두 번째 인자로 키를 명시
- `/v1/user/nickname` 응답: `{ user: { userId, nickname } }` — `userNum` 없음
- userId(문자열)로 게임/스탯 조회: `getUserGamesByUserId`, `getUserStatsByUserId`

## Renderer 아키텍처 (Feature-based + Clean Architecture)

```
apps/desktop/src/renderer/src/
├── app/
│   ├── App.tsx          # ThemeProvider + HashRouter
│   └── router.tsx       # Route 정의 (각 feature의 Page를 import)
├── features/
│   ├── home/
│   │   ├── components/  # HomePage, TopRankersSection
│   │   ├── hooks/       # useTopRankers
│   │   └── index.ts     # public API export
│   ├── player/
│   │   ├── components/  # PlayerPage(오케스트레이터), PlayerProfile,
│   │   │                # WinRateSection, StatsGrid, TopCharacters, MatchHistory
│   │   ├── hooks/       # usePlayerData (데이터 fetch + 파생값 계산)
│   │   └── index.ts
│   └── ui-guide/
│       ├── components/  # UIGuidePage
│       └── index.ts
└── shared/
    ├── utils/
    │   ├── format.ts    # formatDuration, timeAgo
    │   └── meta.ts      # 코드 → 한글명 조회 유틸
    └── constants/
        └── ko-json/     # 정적 게임 메타데이터 JSON
            ├── characters.json
            ├── items.json
            ├── masteries.json
            ├── areas.json
            ├── tiers.json
            ├── monsters.json
            ├── skills.json
            ├── tacticalSkills.json
            ├── traitSkillGroups.json
            ├── infusions.json
            ├── weathers.json
            └── seasons.json
```

### 폴더 컨벤션
- `components/` — UI 컴포넌트 (Page 포함)
- `hooks/` — 커스텀 훅 (비즈니스 로직, 데이터 fetch)
- `utils/` — 순수 유틸리티 함수
- `types/` — 피처 전용 타입 (필요시)
- `index.ts` — 각 feature의 public API만 export (외부에서 내부 파일 직접 import 금지)

### 정적 메타데이터 (shared/constants/ko-json)
- API 응답의 숫자 코드를 한글명/이미지로 변환하는 정적 JSON 파일 모음
- **새로운 코드 변환이 필요하면 이 JSON을 참고하고, `shared/utils/meta.ts`에 조회 함수 추가**
- JSON은 앱에서만 쓰이므로 `packages/`가 아닌 renderer `shared/constants/`에 위치

| 파일 | 내용 | 주요 필드 |
|---|---|---|
| `characters.json` | 실험체 목록 | `id`, `key`, `name`, `imageUrl` |
| `items.json` | 아이템 목록 | `id`, `name`, `imageUrl`, `grade` |
| `masteries.json` | 무기 숙련도 타입 | `id`, `key`, `name` |
| `areas.json` | 지역 목록 | `id`, `key`, `name` |
| `tiers.json` | 랭크 티어 | `id`, `key`, `name`, `iconUrl` |
| `monsters.json` | 몬스터 목록 | `id`, `key`, `name` |

### shared/utils/meta.ts
- JSON을 모듈 로드 시점에 `Map`으로 변환 → O(1) 조회
- `key` 기반(문자열, API 응답에 직접 포함)과 `id` 기반(숫자 코드) 두 가지 제공
- `normalizeImageUrl(url)` — `//cdn.dak.gg/...` 형태의 프로토콜 상대 URL을 `https:`로 정규화

```ts
// id 기반 (characterNum, characterCode 등 숫자 코드)
getCharacterById(id)   // characters.json
getItemById(id)        // items.json
getTierById(id)        // tiers.json

// key 기반 (API가 문자열로 직접 반환: killerCharacter, killerWeapon, placeOfDeath 등)
getCharacterByKey(key) // e.g. "Jackie" → { name: "재키", imageUrl: "..." }
getMasteryByKey(key)   // e.g. "Glove" → { name: "글러브" }
getAreaByKey(key)      // e.g. "Harbor" → { name: "항구" }
```

- CSP `img-src`에 `https://cdn.dak.gg` 허용 추가됨 (csp.ts)

#### 역할 분리 원칙
- **hook (`hooks/`)**: 데이터 fetch, 상태 관리, 파생값 계산 — JSX 없음
- **Page component**: 훅 호출 + 하위 컴포넌트 조합 — 오케스트레이터 역할
- **하위 component**: props만 받아 렌더링 — 상태/fetch 없음

## 스타일 원칙

### 디자인 토큰 준수
- `theme.colors`, `theme.spacing`, `theme.typography`, `theme.radius` 등 `@repo/design-system`의 토큰만 사용
- 하드코딩된 색상(`#ffffff`, `rgba(...)`)·간격(`12px`)·폰트 크기는 **절대 사용 금지**
- 토큰에 없는 값이 필요하면 먼저 design-system에 토큰을 추가한 뒤 참조

### Custom Color 사용 규칙
- 토큰에 없는 색상이 반드시 필요한 경우, 코드에 바로 쓰지 말고 먼저 아래를 결정해야 함:
  1. **범용성**: 여러 곳에서 쓰일 색이라면 → `@repo/design-system`에 시맨틱 토큰으로 추가
  2. **도메인 한정**: 게임 데이터 전용(등급 색상, 티어 색상 등) → 해당 feature의 상수 파일에 `Record` 형태로 모아서 관리
  3. **일회성**: 정말 한 곳에서만 쓰이는 경우 → styled-component `props`로 주입하고 인라인 리터럴 사용 금지
- 어느 경우든 **색상 값을 컴포넌트 스타일 내부에 문자열 리터럴로 직접 쓰는 것은 금지**

### UI 컴포넌트화 판단 기준
- 동일한 UI 패턴이 **2개 이상의 feature**에서 반복되거나, 앞으로 반복될 가능성이 높으면 `@repo/ui`에 컴포넌트로 추출할 것을 제안
- 제안 타이밍: 두 번째로 같은 패턴을 구현하려는 시점에 "이 패턴은 `@repo/ui`에 컴포넌트화하는 게 좋을 것 같습니다. 진행할까요?" 라고 먼저 물어볼 것
- 단일 feature 전용 컴포넌트는 해당 feature `components/` 안에 유지 — 무분별한 공통화 금지

## 주요 상수

- `CURRENT_SEASON_ID = 39` — `packages/service/src/er-service.ts`
- 게임 목록은 커서 기반 페이지네이션 — API 1회 호출당 10개 반환. `usePlayerData`가 `cursors[]` 히스토리를 관리하며 이전/다음 이동. `goNext(cursor)` / `goPrev(prevCursor)` 콜백으로 페이지 전환

## 개발 실행

```bash
pnpm dev          # 전체 turbo dev (루트에서 실행)
```

## 환경변수 파일 위치

- `apps/desktop/.env` — `VITE_API_KEY` (renderer용, git 제외)
- `packages/er-api-client/.env` — 레거시, 현재 미사용
- `.gitignore`에 `.env`, `.env.*` 패턴 추가됨

# turbo-electron 프로젝트 가이드

## 프로젝트 개요

이터널 리턴 전적 검색 Electron 데스크톱 앱. Turborepo 기반 pnpm 모노레포.

## 기술 스택

- **번들러**: Turborepo + pnpm workspaces
- **앱**: Electron + electron-vite + React + TypeScript
- **스타일**: styled-components
- **라우팅**: react-router-dom (HashRouter)
- **패키지 매니저**: pnpm
- **데이터베이스**: Supabase (PostgreSQL)

## 모노레포 패키지 구조

```
apps/
  desktop/              # Electron 앱
  crawler/              # 랭커 데이터 수집기 (GitHub Actions 실행)
packages/
  er-api-client/        # BSER Open API HTTP 클라이언트 (ErApiClient 클래스)
  er-type/              # API 공유 타입 정의
  service/              # 비즈니스 서비스 레이어 (er-api-client + club-store 래핑)
  club-store/           # Supabase 클라이언트 (클럽/랭커 데이터 읽기/쓰기)
  design-system/        # 디자인 토큰
  ui/                   # 공통 React 컴포넌트
  typescript-config/    # 공유 tsconfig
  eslint-config/        # 공유 eslint 설정
```

## 레이어 의존성 흐름

```
apps/desktop (renderer)
  → @repo/service          # 비즈니스 로직
    → @repo/er-api-client  # BSER Open API HTTP 클라이언트
      → @repo/er-type      # 타입
    → @repo/club-store     # Supabase (클럽 멤버, 랭커 데이터, 수집 상태)

apps/crawler (GitHub Actions)
  → @repo/er-api-client    # BSER API 조회
  → @supabase/supabase-js  # Supabase 직접 접근 (service_role key)
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

### service가 items.json을 쓸 수 없을 때 — 콜백 주입 패턴
`@repo/service`는 renderer의 `shared/constants/ko-json/`을 import할 수 없음 (레이어 역방향). items.json 기반 계산이 필요한 경우 콜백으로 주입받는다.

```ts
// packages/service/src/item-analysis-service.ts
export const getItemAnalysis = async (
  nickname: string,
  calcCredits: (equipment: Record<string, number>) => number,
  getWeaponType: (equipment: Record<string, number>) => string
): Promise<ItemAnalysisResult> => { ... }

// 호출 측 (renderer hook)
import { calcItemCredits, getWeaponTypeFromEquipment } from "../../../shared/utils/meta";
const result = await getItemAnalysis(nickname, calcItemCredits, getWeaponTypeFromEquipment);
```

### BSER API 응답 구조
- 엔드포인트마다 응답 키가 다름 (`user`, `userGames`, `userStats` 등)
- `er-api-client/src/client.ts`의 `get<T>(path, key)` 메서드에서 두 번째 인자로 키를 명시
- `/v1/user/nickname` 응답: `{ user: { userId, nickname } }` — `userNum` 없음
- userId(문자열)로 게임/스탯 조회: `getUserGamesByUserId`, `getUserStatsByUserId`

#### UserGame 주요 필드 (시야/아이템 관련)
- `killMonsters: Record<string, number>` — 몬스터 킬 수. **키가 문자열**("2", "13" 등). 하드코딩 금지, 상수로 관리
  ```ts
  const MONSTER_IDS = { BAT: "2", MUTANT_BAT: "13" } as const
  g.killMonsters[MONSTER_IDS.BAT] ?? 0
  ```
- `itemTransferredDrone: number[]` / `itemTransferredConsole: number[]` — **원격 배달**로 받은 아이템 ID 배열. 키오스크 직접 구매는 포함되지 않음
- `useReconDrone: number` / `useEmpDrone: number` — 드론 **사용**(활성화) 횟수. 구매 개수와 다름
- `addTelephotoCamera: number` — 망원 카메라 설치 총 수 (박쥐 처치 + 구매 합산)
- `addSurveillanceCamera: number` — 감시 카메라 설치 총 수

#### 시야 분석 관련 아이템 ID 상수 (`vision-source-service.ts`)
```ts
const TELEPHOTO_CAMERA_ID = 502207  // 망원 카메라
const RECON_DRONE_ID      = 502208  // 정찰 드론
const EMP_DRONE_ID        = 502308  // EMP 드론
```

## Supabase

### 개요
- 클럽 멤버 데이터 + 랭커 수집 데이터를 저장하는 PostgreSQL 호스팅
- **앱(renderer)**: anon/publishable key로 읽기 전용 접근 → `packages/club-store/`
- **크롤러(GitHub Actions)**: service_role key로 쓰기 접근 → `apps/crawler/src/supabase.ts`

### 환경변수
| 위치 | 변수 | 용도 |
|---|---|---|
| `apps/desktop/.env` | `VITE_SUPABASE_URL` | 앱에서 Supabase 접근 |
| `apps/desktop/.env` | `VITE_SUPABASE_PUBLISHABLE_KEY` | 앱용 anon key (읽기) |
| `apps/crawler/.env` | `SUPABASE_URL` | 크롤러 Supabase 접근 |
| `apps/crawler/.env` | `SUPABASE_SERVICE_KEY` | 크롤러용 service_role key (읽기/쓰기) |
| GitHub Secrets | `API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | GitHub Actions 실행 시 주입 |

### 테이블 구조
```sql
-- 클럽 멤버 (앱에서 수동 관리)
club_members  (nickname PK, mmr, rank, rank_percent, season_id, updated_at, representative_character_code)

-- 랭커 데이터 (크롤러가 수집)
rankers       (nickname PK, mmr, rank, collected_at)
games         (game_id + user_id PK, season_id, version_major, character_num, ... 전체 UserGame 필드)
kill_matchups (game_id + killer_char_num + killed_char_num PK, count)
game_teams    (game_id + team_rank PK, version_major, start_dtm, character_nums, team_kills,
               team_assists, team_mmr_gain, is_premade,
               members: JSON[]  -- 아래 참조)

-- game_teams.members JSON 스키마 (멤버별 1개)
-- { character_num, player_kill, player_assistant, mmr_gain,
--   damage_to_player, damage_from_player, damage_to_monster,
--   play_time, equipment_slot0, tactical_skill_group, trait_first_core }
-- ※ damage_* / play_time / equipment_slot0 / tactical_skill_group / trait_first_core
--   은 재수집 이후 데이터부터 채워짐
-- ※ equipment_slot0: equipment["0"] — 무기 슬롯 아이템 ID (null 가능)
-- ※ tactical_skill_group: 전술 스킬 그룹 ID
-- ※ trait_first_core: 첫 번째 특성 트리 코어 스킬 ID

-- 수집 상태 (단일 row, id=1 고정)
crawl_status  (id=1, status: 'idle'|'collecting'|'error', started_at, completed_at,
               progress_current, progress_total, error_message)
```

### 버전 프루닝 정책
- `games.version_major` 기준으로 가장 최근 2개 패치만 보관
- 예: v11.4·v11.5 보관 중 v11.6 수집 시 → v11.4 자동 삭제
- 삭제 순서: `game_teams` → `kill_matchups` → `games` (FK 참조 방향)

### packages/club-store
- `initClubStore(url, anonKey)` — anon key로 클라이언트 초기화 (앱에서 호출)
- `getRankers()` — rankers 테이블 전체 조회 (rank ASC)
- `getCollectedVersions()` — games 테이블에서 distinct version_major 목록 (DESC)
- `getCrawlStatus()` — crawl_status 테이블 단일 행 조회
- `getMemberByNickname / upsertMember / getAllMembers` — 클럽 멤버 CRUD
- `getGamesByCharacter(characterNum)` — 트리오 랭크(`matching_team_mode = 3`) 게임 중 해당 실험체 행 조회 (실험체 분석용)
- `getTrioRankGameCount()` — 트리오 랭크 전체 판 수 (픽률 분모)
- `getGameTeamMmrLookup()` — `game_teams.members` 전체 조회 → RP(`mmr_gain`) lookup
- `getKillMatchupsForCharacter(characterNum)` — 해당 실험체가 킬한 상대 집계 (`game_id` 포함, 무기별 필터용)
- `getGameTeamsForCombos()` — `game_teams` 전체 조회 (`game_id`, `team_rank`, `character_nums`, `members`) → 조합 승률 분석용

## 크롤러 (apps/crawler)

### 구조
```
apps/crawler/src/
  index.ts      # 진입점: dotenv 로드 → collect() 실행
  api.ts        # ErApiClient 래퍼: 1req/s rate limiting (nextAllowedAt)
  collect.ts    # 수집 로직: 랭커 조회 → 게임 수집 → Supabase upsert → 프루닝
  supabase.ts   # createSupabaseClient, writeStatus 헬퍼
```

### 수집 범위
- 서버: AS (아시아), 모드: Solo Rank (MatchingTeamMode.Solo = 1), 시즌: 39
- 랭커당 최대 2페이지(20게임) 조회 후 solo rank season 39 게임만 필터링
- 배치 100개 단위로 flush, 10명마다 crawl_status 업데이트

### GitHub Actions 스케줄
- `.github/workflows/crawl.yml` — 매일 04:00 KST (UTC 19:00) 자동 실행
- `workflow_dispatch`로 수동 실행 가능
- GitHub Secrets: `API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` 등록 필요

### CrawlStatusBanner
- `shared/components/CrawlStatusBanner.tsx` — 수집 중(`status: 'collecting'`)일 때 홈 화면 상단 배너
- `getCrawlStatus()`를 30초마다 폴링 (Supabase 직접 조회, IPC 없음)
- HomePage에 NavBar 아래 배치

## Renderer 아키텍처 (Feature-based + Clean Architecture)

```
apps/desktop/src/renderer/src/
├── app/
│   ├── App.tsx          # ThemeProvider + HashRouter
│   └── router.tsx       # Route 정의 (각 feature의 Page를 import)
├── features/
│   ├── home/
│   │   ├── components/  # HomePage, ClubRankingSection
│   │   ├── hooks/       # useClubMembers
│   │   └── index.ts
│   ├── player/
│   │   ├── components/  # PlayerPage(오케스트레이터), PlayerProfile,
│   │   │                # WinRateSection, StatsGrid, TopCharacters, MatchHistory
│   │   ├── hooks/       # usePlayerData (데이터 fetch + 파생값 계산)
│   │   └── index.ts
│   ├── compare/
│   │   ├── components/  # ComparePage, PentagonChart, StatsBarChart, MmrBarChart
│   │   ├── hooks/       # useCompareData
│   │   └── index.ts
│   ├── item-analysis/
│   │   ├── components/  # ItemAnalysisPage, CharacterSection
│   │   ├── hooks/       # useItemAnalysisData
│   │   └── index.ts
│   ├── vision-source/
│   │   ├── components/  # VisionSourcePage, VisionBreakdownSection, VisionTrendSection,
│   │   │                # VisionStatsSection, VisionCameraSourceSection,
│   │   │                # VisionInsightSection, GameDetailSection
│   │   ├── hooks/       # useVisionSourceData
│   │   └── index.ts
│   ├── phase-combat/
│   │   ├── components/  # PhaseCombatPage, ...
│   │   ├── hooks/       # usePhaseCombatData
│   │   └── index.ts
│   ├── ranker-data/
│   │   ├── components/  # RankerDataPage (수집된 랭커 테이블)
│   │   ├── hooks/       # useRankerData
│   │   └── index.ts
│   ├── character-analysis/
│   │   ├── components/  # CharacterAnalysisPage, CharacterProfileHeader,
│   │   │                # SummaryStatsSection, CharacterCompareSection,
│   │   │                # TraitGroupsSection, WeaponBuildSection, ...
│   │   ├── hooks/       # useCharacterAnalysis, useCharacterCompare
│   │   └── index.ts
│   ├── team-combo/
│   │   ├── components/  # TeamComboPage, TeamComboContent, TeamComboDetailPanel,
│   │   │                # CharacterFilter
│   │   ├── hooks/       # useTeamCombos
│   │   └── index.ts
│   └── ui-guide/
│       ├── components/  # UIGuidePage
│       └── index.ts
└── shared/
    ├── components/
    │   ├── AppHeader.tsx        # 공용 헤더 (뒤로가기 + 로고 + 우측 슬롯)
    │   ├── CrawlStatusBanner.tsx # 랭커 데이터 수집 중 배너
    │   └── Loading.tsx
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

### 공용 헤더 (AppHeader)
- **새로운 서브 페이지를 만들 때 반드시 `AppHeader` 사용** — 직접 TopBar/NavBar styled component 작성 금지
- `shared/components/AppHeader.tsx`에 위치 — `useNavigate`를 내부에서 호출하므로 `@repo/ui`가 아닌 renderer `shared/`에 위치
- `right` prop으로 우측 슬롯을 채울 수 있음 (없으면 로고가 자동으로 중앙 정렬)

```tsx
// 기본 (뒤로가기 + 로고 중앙)
<AppHeader />

// 우측 슬롯 있는 경우 (PlayerPage의 검색창 등)
<AppHeader right={<SearchRow>...</SearchRow>} />
```

### 정적 메타데이터 (shared/constants/ko-json)
- API 응답의 숫자 코드를 한글명/이미지로 변환하는 정적 JSON 파일 모음
- **새로운 코드 변환이 필요하면 이 JSON을 참고하고, `shared/utils/meta.ts`에 조회 함수 추가**
- JSON은 앱에서만 쓰이므로 `packages/`가 아닌 renderer `shared/constants/`에 위치

| 파일 | 내용 | 주요 필드 |
|---|---|---|
| `characters.json` | 실험체 목록 | `id`, `key`, `name`, `imageUrl` |
| `items.json` | 아이템 목록 | `id`, `name`, `imageUrl`, `grade`, `weaponType`(무기만), `makeMaterial2`(Legend/Mythic만) |
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
getMasteryById(id)     // masteries.json (id는 WeaponType enum 값과 동일)

// key 기반 (API가 문자열로 직접 반환: killerCharacter, killerWeapon, placeOfDeath 등)
getCharacterByKey(key) // e.g. "Jackie" → { name: "재키", imageUrl: "..." }
getMasteryByKey(key)   // e.g. "Glove" → { name: "글러브" }
getAreaByKey(key)      // e.g. "Harbor" → { name: "항구" }

// 아이템 분석 전용 유틸
getWeaponTypeFromEquipment(equipment) // equipment["0"] → items.json weaponType 영어 key 반환
calcItemCredits(equipment)            // equipment → Legend/Mythic 아이템의 Epic 재료 키오스크 가격 합산
MATERIAL_PRICES                       // Epic 재료 ID → 키오스크 가격 (생명의나무 200, 미스릴 250 등)

// 버전 표기
currentSeasonDisplayVersion           // seasons.json의 현재 시즌 번호 (e.g. "11")
// 패치 버전 표기: `v${currentSeasonDisplayVersion}.${game.versionMajor}` → "v11.4"

// 실험체 분석 프로필
getCharacterPrimaryWeaponName(id)     // characters.json masteries[0] → 한글 무기명
getCharacterCommunityImageUrl(id)     // dak.gg 커뮤니티 초상화 URL
getCharacterSkillBar(id)              // Q/W/E/R/T/D 스킬 아이콘 목록
getItemGrade(id)                      // items.json grade (Epic/Legend/Mythic 등)
```

- **`masteryLevel` API 필드 주의**: `UserGame.masteryLevel` 키는 영어 key("Bat")가 아닌 숫자 코드 혼재 — 무기 종류 판별에 사용 금지. 대신 `equipment["0"]`(무기 슬롯) → `getWeaponTypeFromEquipment` 사용
- CSP `img-src`에 `https://cdn.dak.gg` 허용 추가됨 (csp.ts)

### 실험체 분석 (`features/character-analysis`)

수집된 랭커 **트리오 랭크** 전적(`matching_team_mode = 3`) 기준으로 실험체별 메타·빌드·교전 통계를 보여준다.

- **서비스**: `@repo/service` — `getCharacterAnalysis`, `getPlayerCharacterWeaponStats`, `weaponGroupToCompareSide`
- **집계**: `character-analysis-utils.ts` — 무기 타입(`getWeaponType` 콜백)별로 승률·RP·특성·전술 스킬·빌드·교전을 분리 집계
- **무기 선택**: `CharacterProfileHeader` 탭 — 선택 무기 기준으로 모든 지표가 바뀜 (무기 2개 이상일 때만 탭 표시)
- **RP 획득**: `game_teams.members[].mmr_gain` (API `UserGame.mmrGain`)을 `game_rank`별 평균 → `mmrByPlacement`
- **나와 비교하기**: 동일 실험체·무기·트리오 랭크 최근 전적 vs 랭커 풀 — 지표 테이블 + 순위별 RP 막대 그래프
- **아이템 등급 필터**: Epic / Legend / Mythic만 (정확히 해당 등급). `getItemGrade` + `ITEM_GRADE_FILTERS`
- **피해자 분석**: `games.death_details` (크롤러 `deathDetails` 수집) + `kill_matchups` (`game_id`로 무기별 필터)

#### 역할 분리 원칙
- **hook (`hooks/`)**: 데이터 fetch, 상태 관리, 파생값 계산 — JSX 없음
- **Page component**: 훅 호출 + 하위 컴포넌트 조합 — 오케스트레이터 역할
- **하위 component**: props만 받아 렌더링 — 상태/fetch 없음

### 조합 승률 보기 (`features/team-combo`)

수집된 랭커 **트리오 랭크** `game_teams` 데이터 기준으로 2인·3인 조합의 순위 비율·RP·킬을 분석한다.

- **데이터 흐름**: `getGameTeamsForCombos()` → 전체 raw rows를 클라이언트에서 집계
- **서비스 함수** (`packages/service/src/team-combo-utils.ts`):
  - `aggregateTeamCombos(rows, size, sort, characterNum?)` — 2인/3인 조합별 통계 집계 후 정렬
  - `computeTeamComboDetail(rows, characterNums)` — 클릭된 조합의 디테일 계산 (1~8등 분포, 순위별 RP, 캐릭터별 기여)
- **픽률**: `combo.games / totalUniqueGames * 100`. 2인 조합은 팀당 3쌍이 생성되므로 픽률 합이 100%를 초과하는 것이 정상
- **페이지네이션**: 20개씩, 필터·정렬·실험체 변경 시 1페이지로 리셋
- **디테일 패널**: 행 클릭 시 해당 행 아래 인라인 펼침 — 1~8등 분포 막대, 순위별 평균 RP, 캐릭터별 킬/어시/RP
- **`game_teams.members` 신규 필드** (`damage_to_player`, `damage_from_player`, `damage_to_monster`, `play_time`, `equipment_slot0`, `tactical_skill_group`, `trait_first_core`): 크롤러에 추가됨, 재수집 이후 데이터부터 채워짐
- **`equipment_slot0`**: 무기 슬롯 아이템 ID. 렌더러에서 `getWeaponTypeFromEquipment({ "0": member.equipment_slot0 })`로 무기 숙련도명 변환
- **`damage_to_monster`**: 몬스터 피해량. 조합별 평균 몬스터 딜량 집계에 활용 — DetailPanel 전용 표시
- **`tactical_skill_group`**: 전술 스킬 그룹 ID — DetailPanel 전용 표시
- **`trait_first_core`**: 첫 번째 특성 트리 코어 스킬 ID — DetailPanel 전용 표시

## 스타일 원칙

### 디자인 토큰 준수
- `theme.colors`, `theme.spacing`, `theme.typography`, `theme.radius` 등 `@repo/design-system`의 토큰만 사용
- 하드코딩된 색상(`#ffffff`, `rgba(...)`)·간격(`12px`)·폰트 크기는 **절대 사용 금지**
- 토큰에 없는 값이 필요하면 먼저 design-system에 토큰을 추가한 뒤 참조

### spacing 토큰 사용 주의
`theme.spacing`은 순차 인덱스가 아닌 특정 키만 존재함. 없는 키를 쓰면 TypeScript 오류 발생.

**유효한 키 목록** (`packages/design-system/src/spacing.ts`):
```
px(1px)  0.5(2px)  1(4px)  1.5(6px)  2(8px)  2.5(10px)  3(12px)  3.5(14px)
4(16px)  5(20px)   6(24px)            8(32px)             10(40px)
12(48px) 16(64px)  20(80px) 24(96px)
```
**없는 키**: 7, 9, 11, 13, 14, 15, 17, 18, 19 등 — `spacing[7]`, `spacing[9]` 등은 타입 오류

### styled-components 다중 인터폴레이션 padding 주의
padding 단축속성에 인터폴레이션을 4개 여러 줄로 쓰면 파서 오류 발생.

```ts
// 금지: 4값 단축속성 + 여러 줄 인터폴레이션
padding: ${spacing[3]} ${spacing[9]}
  ${spacing[3]} ${spacing[4]};  // ❌

// 권장: padding 2값으로 선언 후 필요한 방향만 override
padding: ${spacing[3]} ${spacing[4]};
padding-right: ${spacing[8]};  // ✅
```

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

- `CURRENT_SEASON_ID = 39` — `packages/service/src/er-service.ts`, `apps/crawler/src/collect.ts`
- `SERVER_CODE = 'AS'` — 크롤러 수집 서버 (아시아)
- 게임 목록은 커서 기반 페이지네이션 — API 1회 호출당 10개 반환. `usePlayerData`가 `cursors[]` 히스토리를 관리하며 이전/다음 이동. `goNext(cursor)` / `goPrev(prevCursor)` 콜백으로 페이지 전환

## 코드 작성 규칙

- **ES6+ 최신 문법 사용** — 화살표 함수, `async/await`, `const`/`let`, 구조분해 할당 등 최신 문법을 일관되게 사용
- `function foo()` 선언식 대신 `const foo = () =>` 화살표 함수 사용
- `.then().catch()` 체이닝보다 `async/await` 선호

## 개발 실행

```bash
pnpm dev          # 전체 turbo dev (루트에서 실행)
```

## Claude 에이전트 (`.claude/agents/`)

이 프로젝트에는 두 개의 전용 Claude 에이전트가 있다. 대화 중 에이전트를 지정하면 해당 에이전트의 전문 지식으로 응답한다.

### `doc-manager` — 문서 관리 에이전트

코드 변경 후 관련 문서(`CLAUDE.md`, `README.md`, `supabase.md`, `guide/design/DESIGN.MD`, `guide/er-specs/SPECS.MD`)를 선택적으로 업데이트하거나 새 문서를 생성한다.

**사용 예시**
```
"doc-manager 에이전트로 마지막 커밋 분석하고 문서 업데이트해줘"
"오늘 작업한 내용 기반으로 관련 문서 정리해줘"
"새로 추가한 서비스 함수 CLAUDE.md에 반영해줘"
```

**업데이트 기준**: 신규 기능·스키마 변경·API 필드 추가·아키텍처 패턴 변경은 업데이트. 버그픽스·리팩토링·스타일 수정은 스킵.

### `er-domain` — 이터널 리턴 도메인 전문가 에이전트

BSER API 응답 구조, UserGame 필드 quirk, Supabase 스키마, 게임 용어를 깊이 알고 있다. 신규 기능 구현 시 올바른 필드명·쿼리 패턴을 빠르게 확인할 때 사용한다.

**사용 예시**
```
"er-domain 에이전트한테 물어봐줘 — killMonsters 키가 왜 문자열이야?"
"er-domain으로 game_teams.members에서 무기 종류 꺼내는 방법 알려줘"
"er-domain 에이전트가 이 Supabase 쿼리 맞는지 검토해줘"
"신규 feature 구현 전에 er-domain한테 관련 API 필드 정리해달라고 해줘"
```

**주요 지식**: API 엔드포인트 전체, `masteryLevel` 사용 금지 이유, `equipment["0"]` 무기 판별법, `game_teams.members` JSON 스키마, `club-store` 함수 목록, 자주 하는 실수 10가지.

## 환경변수 파일 위치

- `apps/desktop/.env` — `VITE_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (renderer용, git 제외)
- `apps/crawler/.env` — `API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (크롤러용, git 제외)
- `apps/crawler/.env.example` — 크롤러 환경변수 예시 파일 (git 포함)
- `packages/er-api-client/.env` — 레거시, 현재 미사용
- `.gitignore`에 `.env`, `.env.*` 패턴 추가됨

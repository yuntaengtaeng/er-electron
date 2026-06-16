# Supabase 관리 문서

## 환경변수

**앱 (`apps/desktop/.env`)**
```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<key>
```

**크롤러 (`apps/crawler/.env`)**
```env
API_KEY=<BSER Open API 키>
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_KEY=<service_role 키>
```

**GitHub Actions Secrets** (`API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)

---

## 테이블 목록

### `club_members`

동아리 회원의 랭크 지표를 저장. 홈 화면 종겜동 랭킹에 사용.

```sql
CREATE TABLE club_members (
  user_num                     INTEGER PRIMARY KEY,    -- BSER API userNum (고정 정수 식별자)
  nickname                     TEXT NOT NULL,          -- 게임 닉네임
  mmr                          INTEGER NOT NULL DEFAULT 0,  -- 솔로 랭크 RP
  rank                         INTEGER,                -- 솔로 랭크 순위 (#N위)
  rank_percent                 REAL,                   -- 상위 N% (0 이면 미집계)
  season_id                    INTEGER NOT NULL,       -- 시즌 ID (현재: 39)
  updated_at                   TIMESTAMPTZ DEFAULT NOW(),
  representative_character_code INTEGER               -- 등록/갱신 시점 최다 플레이 실험체 코드
);
```

**마이그레이션 (user_id → user_num 전환)**
```sql
-- 기존 테이블 삭제 후 재생성 (데이터 초기화 필요)
DROP TABLE club_members;

CREATE TABLE club_members (
  user_num                     INTEGER PRIMARY KEY,
  nickname                     TEXT NOT NULL,
  mmr                          INTEGER NOT NULL DEFAULT 0,
  rank                         INTEGER,
  rank_percent                 REAL,
  season_id                    INTEGER NOT NULL,
  updated_at                   TIMESTAMPTZ DEFAULT NOW(),
  representative_character_code INTEGER
);

ALTER TABLE club_members DISABLE ROW LEVEL SECURITY;
```

**인덱스 (선택)**
```sql
CREATE INDEX idx_club_members_mmr ON club_members (mmr DESC);
```

**RLS (Row Level Security)**

> `sb_publishable_*` 키 방식(신규 Supabase 프로젝트)은 RLS + anon 정책이 JWT 없이 동작하지 않음.
> 이 앱은 별도 인증이 불필요하므로 RLS 비활성화가 가장 단순.

```sql
ALTER TABLE club_members DISABLE ROW LEVEL SECURITY;
```

**컬럼 설명**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `user_id` | TEXT | BSER API의 userId (닉네임 → userId 변환 후 저장) |
| `nickname` | TEXT | 표시용 닉네임 (닉네임 변경 시 갱신하기로 업데이트됨) |
| `mmr` | INTEGER | 솔로 랭크 RP 점수 — 홈 랭킹 정렬 기준 |
| `rank` | INTEGER | 전체 솔로 랭크 순위 |
| `rank_percent` | REAL | 상위 몇 % (예: 5.23) |
| `season_id` | INTEGER | 조회한 시즌 ID. `CURRENT_SEASON_ID = 39` |
| `updated_at` | TIMESTAMPTZ | 마지막 갱신 시각 — PlayerProfile "갱신 N분 전" 표시에 사용 |
| `representative_character_code` | INTEGER | 등록/갱신 시점 기준 최다 플레이 실험체 코드 — 홈 랭킹 카드 아바타 이미지에 사용 |

---

### `compare_history`

비교하기 기능에서 검색된 닉네임을 누적 저장. 인기 비교 추천에 사용.

```sql
CREATE TABLE compare_history (
  nickname          TEXT PRIMARY KEY,
  search_count      INTEGER NOT NULL DEFAULT 1,
  last_searched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE compare_history DISABLE ROW LEVEL SECURITY;
```

**컬럼 설명**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `nickname` | TEXT | 비교 대상으로 검색된 닉네임 (본인 제외, 비교 1·2만 기록) |
| `search_count` | INTEGER | 총 검색 횟수 — 인기순 정렬 기준 |
| `last_searched_at` | TIMESTAMPTZ | 마지막 검색 시각 |

> RLS: `club_members`와 동일하게 비활성화.
> 테이블 미생성 시 인기 추천 기능만 조용히 비활성화되며, 비교 기능 자체는 정상 동작.

---

### `rankers`

크롤러가 매일 수집한 아시아 서버 솔로랭크 탑 랭커 목록. `/ranker-data` 페이지에서 표시.

```sql
-- 기존 테이블 삭제 후 재생성 (스키마 변경 시)
DROP TABLE IF EXISTS rankers;

CREATE TABLE rankers (
  nickname     TEXT PRIMARY KEY,           -- 닉네임 (TopRank 응답에 userNum 없음)
  mmr          INTEGER NOT NULL,
  rank         INTEGER NOT NULL,           -- 수집 시점 순위
  collected_at TIMESTAMPTZ NOT NULL        -- 수집 일시
);

ALTER TABLE rankers DISABLE ROW LEVEL SECURITY;
```

---

### `games`

크롤러가 수집한 랭커별 솔로랭크 게임 상세. `version_major` 기준으로 최근 2패치만 보관.

```sql
-- 기존 테이블 삭제 후 재생성 (스키마 변경 시)
DROP TABLE IF EXISTS kill_matchups;
DROP TABLE IF EXISTS games;

CREATE TABLE games (
  game_id                   BIGINT NOT NULL,
  user_id                   TEXT NOT NULL,         -- BSER userId (TopRank 응답에 userNum 없어 nickname → userId 조회)
  season_id                 INTEGER,
  version_major             INTEGER,       -- 패치 버전 (e.g. 4 → v11.4)
  version_minor             INTEGER,
  matching_team_mode        INTEGER,
  character_num             INTEGER,
  game_rank                 INTEGER,
  team_number               INTEGER,
  start_dtm                 TEXT,
  play_time                 INTEGER,
  player_kill               INTEGER,
  player_assistant          INTEGER,
  player_deaths             INTEGER,
  team_kill                 INTEGER,
  terminate_count           INTEGER,
  kills_phase_one           INTEGER,
  kills_phase_two           INTEGER,
  kills_phase_three         INTEGER,
  cc_time_to_player         REAL,
  total_double_kill         INTEGER,
  total_triple_kill         INTEGER,
  total_quadra_kill         INTEGER,
  damage_to_player          INTEGER,
  damage_from_player        INTEGER,
  damage_offseted_by_shield INTEGER,
  damage_to_monster         INTEGER,
  heal_amount               INTEGER,
  team_recover              INTEGER,
  protect_absorb            INTEGER,
  equipment                 JSONB,         -- { "0": itemId, "1": itemId, ... }
  equip_first_item_for_log  JSONB,
  craft_uncommon            INTEGER,
  craft_rare                INTEGER,
  craft_epic                INTEGER,
  craft_legend              INTEGER,
  craft_mythic              INTEGER,
  trait_first_core          INTEGER,
  trait_first_sub           JSONB,
  trait_second_sub          JSONB,
  tactical_skill_group      INTEGER,
  tactical_skill_level      INTEGER,
  tactical_skill_use_count  INTEGER,
  final_infusion            INTEGER,
  skill_order_info          JSONB,
  view_contribution         INTEGER,
  add_telephoto_camera      INTEGER,
  add_surveillance_camera   INTEGER,
  use_recon_drone           INTEGER,
  use_emp_drone             INTEGER,
  kill_monsters             JSONB,         -- { "2": count, "13": count, ... }
  item_transferred_drone    JSONB,
  item_transferred_console  JSONB,
  place_of_start            TEXT,
  place_of_death            TEXT,
  killer_character          TEXT,
  killer_weapon             TEXT,
  route_id_of_start         INTEGER,
  use_hyper_loop            INTEGER,
  total_gain_vf_credit      INTEGER,
  sum_used_vf_credits       INTEGER,
  credit_source             JSONB,
  adaptive_force            INTEGER,
  adaptive_force_attack     INTEGER,
  adaptive_force_amplify    INTEGER,
  max_hp                    INTEGER,
  attack_power              INTEGER,
  defense                   INTEGER,
  cool_down_reduction       REAL,
  get_buff_cube_red         INTEGER,
  get_buff_cube_purple      INTEGER,
  get_buff_cube_green       INTEGER,
  get_buff_cube_gold        INTEGER,
  enter_dimension_rift      INTEGER,
  win_from_dimension_rift   INTEGER,
  battle_zone_player_kill   INTEGER,
  main_weather              INTEGER,
  sub_weather               INTEGER,
  PRIMARY KEY (game_id, user_id)
);

ALTER TABLE games DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_games_character ON games(character_num);
CREATE INDEX IF NOT EXISTS idx_games_version   ON games(version_major);
```

**버전 프루닝**: 크롤러 실행 시 `version_major` 기준 최근 2개 패치만 유지. 오래된 버전 삭제 시 `kill_matchups` → `games` 순서로 삭제.

---

### `kill_matchups`

게임별 킬 상대 실험체 집계. `games.killDetails` 파싱 결과.

```sql
CREATE TABLE IF NOT EXISTS kill_matchups (
  game_id          BIGINT NOT NULL,
  killer_char_num  INTEGER NOT NULL,
  killed_char_num  INTEGER NOT NULL,
  count            INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (game_id, killer_char_num, killed_char_num)
);

ALTER TABLE kill_matchups DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_kill_matchups_killer ON kill_matchups(killer_char_num);
```

---

### `crawl_status`

크롤러 실행 상태를 저장하는 단일 row 테이블 (id=1 고정). 앱 홈 화면 수집 중 배너에 사용.

```sql
CREATE TABLE IF NOT EXISTS crawl_status (
  id               INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  status           TEXT NOT NULL DEFAULT 'idle',  -- 'idle' | 'collecting' | 'error'
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  progress_current INTEGER DEFAULT 0,
  progress_total   INTEGER DEFAULT 0,
  error_message    TEXT
);

ALTER TABLE crawl_status DISABLE ROW LEVEL SECURITY;

-- 초기 row 삽입 (없으면 getCrawlStatus가 idle 반환하므로 필수는 아님)
INSERT INTO crawl_status (id) VALUES (1) ON CONFLICT DO NOTHING;
```

**상태 흐름**
- `idle` → 수집 시작 → `collecting` (progress_current / progress_total 업데이트) → `idle` (완료)
- 에러 발생 시 `error` + `error_message` 기록
- 앱의 `CrawlStatusBanner`가 30초마다 폴링, `collecting`일 때만 배너 표시

---

## 앱 연동 흐름

```
apps/desktop/src/renderer/src/main.tsx
  └─ initClubService(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
       └─ @repo/service/src/club-service.ts
            └─ @repo/club-store/src/client.ts  (createClient)
```

**등록하기** (PlayerProfile — DB에 없을 때만 노출)
1. 현재 stats(mmr, rank, rankPercent)를 `upsertMember`로 저장
2. 버튼 hidden, "갱신하기" + 마지막 갱신 시각 표시

**갱신하기** (PlayerProfile — 항상 노출)
1. BSER API 재조회 (usePlayerData.refresh)
2. 등록된 회원이면 DB도 upsert
3. `updated_at` 갱신 → "갱신 N분 전" 업데이트

**홈 랭킹** (HomePage → ClubRankingSection)
1. `getAllClubMembers()` → `club_members` 전체를 `mmr DESC`로 조회
2. 티어 색상 + 아바타 카드 형태로 표시

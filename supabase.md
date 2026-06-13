# Supabase 관리 문서

## 환경변수 (`apps/desktop/.env`)

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<key>
```

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

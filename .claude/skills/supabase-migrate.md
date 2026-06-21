---
description: Supabase 테이블 스키마 변경 시 마이그레이션 절차를 안내한다. 변경 대상 테이블 선택 → SQL 생성 → onConflict 검증 → 체크리스트 출력. 사용자가 "supabase-migrate 해줘" 또는 "마이그레이션 해줘"라고 하면 실행한다.
---

# supabase-migrate 스킬

스키마 변경 시 코드 배포 **전에** Supabase SQL Editor에서 실행해야 할 마이그레이션을 준비한다.

> ⚠️ 코드만 배포하고 DB를 갱신하지 않으면 `there is no unique or exclusion constraint matching the ON CONFLICT specification` 오류가 발생한다.

## 1단계 — 변경 유형 파악

AskUserQuestion 도구로 질문한다:
- 질문: "어떤 종류의 스키마 변경인가요?"
- 옵션:
  - 기존 테이블에 컬럼 추가 (Recommended) — 데이터 유지
  - 기존 테이블 전체 재생성 — 데이터 초기화
  - 신규 테이블 생성
  - 기존 테이블에서 컬럼 제거

## 2단계 — 대상 테이블 선택

AskUserQuestion 도구로 질문한다:
- 질문: "변경 대상 테이블을 선택하세요."
- 옵션: `games` / `kill_matchups` / `game_teams` / `rankers` / `club_members` / `crawl_status` / 직접 입력

## 3단계 — 현재 코드 변경 확인

`apps/crawler/src/collect.ts`를 읽어 해당 테이블의 upsert 구문과 `onConflict` 값을 확인한다.

```bash
grep -n "onConflict\|\.from(" apps/crawler/src/collect.ts
```

## 4단계 — 마이그레이션 SQL 생성

변경 유형과 테이블에 따라 SQL을 생성한다.

### 컬럼 추가 (데이터 유지)

```sql
ALTER TABLE {테이블명} ADD COLUMN IF NOT EXISTS {컬럼명} {타입};
```

데이터 손실 없음. 가장 안전한 방법.

### 전체 재생성 (데이터 초기화)

`games` / `kill_matchups` 재생성 시 FK 참조 순서를 반드시 지킨다:

```sql
-- 1. 참조하는 테이블부터 삭제
DROP TABLE IF EXISTS game_teams;
DROP TABLE IF EXISTS kill_matchups;
DROP TABLE IF EXISTS games;

-- 2. 재생성 (supabase.md의 최신 전체 스키마 사용)
CREATE TABLE games ( ... );
CREATE TABLE kill_matchups ( ... );
CREATE TABLE game_teams ( ... );

-- 3. 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_games_character ON games(character_num);
CREATE INDEX IF NOT EXISTS idx_games_version ON games(version_major);
CREATE INDEX IF NOT EXISTS idx_game_teams_version ON game_teams(version_major);
CREATE INDEX IF NOT EXISTS idx_kill_matchups_killer ON kill_matchups(killer_char_num);

-- 4. RLS 비활성화
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE kill_matchups DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_teams DISABLE ROW LEVEL SECURITY;
```

> `rankers` / `games` / `kill_matchups` 는 크롤러 재실행으로 재수집 가능. `club_members`는 수동 관리 데이터 — 재생성 전 백업 필요.

### 신규 테이블 생성

```sql
CREATE TABLE IF NOT EXISTS {테이블명} ( ... );
ALTER TABLE {테이블명} DISABLE ROW LEVEL SECURITY;
```

### 컬럼 제거

```sql
ALTER TABLE {테이블명} DROP COLUMN IF EXISTS {컬럼명};
```

## 5단계 — onConflict 일치 검증

`supabase.md`의 테이블별 onConflict 규칙과 코드를 대조한다.

| 테이블 | 크롤러 onConflict | DB 제약 |
|---|---|---|
| `rankers` | `nickname` | `nickname` PRIMARY KEY |
| `games` | `game_id,user_id` | `PRIMARY KEY (game_id, user_id)` |
| `kill_matchups` | `game_id,killer_char_num,killed_char_num` | 복합 PRIMARY KEY |
| `game_teams` | `game_id,team_rank` | `PRIMARY KEY (game_id, team_rank)` |

코드의 `onConflict` 값이 위 DB 제약과 다르면 위반 사항을 경고한다.

## 6단계 — 체크리스트 출력

```
📋 마이그레이션 체크리스트

[ ] 1. Supabase SQL Editor에서 아래 SQL 실행
[ ] 2. 실행 결과 오류 없음 확인
[ ] 3. 변경된 테이블의 컬럼이 예상대로 반영됐는지 Table Editor에서 확인
[ ] 4. apps/crawler/src/collect.ts의 onConflict 값이 DB PK와 일치하는지 재확인
[ ] 5. 코드 배포 (git push → GitHub Actions 또는 로컬 빌드)
[ ] 6. 크롤러 재실행 필요 여부 판단
     - 컬럼 추가만 한 경우: 다음 자동 수집 시 채워짐
     - 테이블 재생성한 경우: GitHub Actions workflow_dispatch로 수동 실행

⚠️  club_members는 크롤러가 채우지 않음 — 재생성 시 홈 랭킹 데이터가 초기화되므로 주의
```

생성된 SQL을 체크리스트와 함께 출력하고 Supabase SQL Editor에 붙여넣도록 안내한다.

## 7단계 — supabase.md 업데이트 여부 확인

스키마가 변경됐으면 `supabase.md`의 해당 테이블 섹션도 업데이트해야 한다.

AskUserQuestion 도구로 질문한다:
- 질문: "`supabase.md`의 스키마 정의도 업데이트할까요?"
- 옵션: 예, 업데이트해줘 / 아니오, 나중에 직접 할게요

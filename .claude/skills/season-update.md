---
description: 새 시즌이 시작될 때 CURRENT_SEASON_ID 상수와 seasons.json을 업데이트하고 커밋한다. 사용자가 "시즌 업데이트 해줘" 또는 "season-update 해줘"라고 하면 실행한다.
---

# season-update 스킬

새 시즌 시작 시 변경해야 할 항목을 순서대로 처리한다.

## 1단계 — 현재 시즌 ID 확인

두 파일에서 `CURRENT_SEASON_ID` 값을 읽어 현재 시즌을 확인한다.

```bash
grep -n "CURRENT_SEASON_ID" packages/service/src/er-service.ts
grep -n "CURRENT_SEASON_ID" apps/crawler/src/collect.ts
```

두 값이 다르면 먼저 사용자에게 불일치를 알린다.

## 2단계 — 새 시즌 ID 질문

AskUserQuestion 도구로 질문한다:
- 질문: "현재 시즌 ID는 {현재값}입니다. 새 시즌 ID를 입력해주세요."
- 옵션: 현재값+1 (Recommended) / 직접 입력

> 시즌 ID를 모르면 BSER API로 확인할 수 있다:
> `GET https://open-api.bser.io/v1/data/Season` (x-api-key 헤더 필요)
> 응답의 `Season` 배열에서 활성 시즌의 `seasonID` 확인.

## 3단계 — CURRENT_SEASON_ID 수정

두 파일 모두 새 시즌 ID로 변경한다.

- `packages/service/src/er-service.ts` — `CURRENT_SEASON_ID` 상수
- `apps/crawler/src/collect.ts` — `CURRENT_SEASON_ID` 상수

두 값이 반드시 일치해야 한다. 다르면 앱의 전적 조회와 크롤러 수집 대상 시즌이 달라진다.

## 4단계 — seasons.json 업데이트

`apps/desktop/src/renderer/src/shared/constants/ko-json/seasons.json`을 읽어 아래 두 가지를 수정한다:

1. 기존 시즌 중 `"isCurrent": true`인 항목 → `"isCurrent": false`로 변경
2. 새 시즌 ID에 해당하는 항목 → `"isCurrent": true`로 변경

새 시즌 항목이 JSON에 없으면 사용자에게 알리고 항목을 추가할지 묻는다.
추가 시 형식: `{ "id": {새시즌ID}, "name": "시즌 {N}", "isCurrent": true }`

> `isCurrent: true`인 시즌의 `id`가 앱 상단 버전 표기(`v11.4` 형식)의 시즌 번호로 쓰인다.

## 5단계 — 변경 내용 요약 및 확인

수정된 내용을 사용자에게 보여준다:

```
변경 파일:
- packages/service/src/er-service.ts  CURRENT_SEASON_ID: {이전} → {새값}
- apps/crawler/src/collect.ts         CURRENT_SEASON_ID: {이전} → {새값}
- shared/constants/ko-json/seasons.json  isCurrent: 시즌{이전} → 시즌{새값}
```

## 6단계 — 커밋

```bash
git add packages/service/src/er-service.ts
git add apps/crawler/src/collect.ts
git add apps/desktop/src/renderer/src/shared/constants/ko-json/seasons.json
git commit -m "chore: update season ID to {새시즌ID}"
```

커밋 후 완료를 안내한다. 크롤러 재실행이 필요하면 GitHub Actions에서 수동 트리거하라고 안내한다.

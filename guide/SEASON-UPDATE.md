# 시즌 업데이트 가이드

새 시즌이 시작될 때 업데이트해야 할 항목 목록.

---

## 업데이트 항목

### 1. `CURRENT_SEASON_ID`

시즌이 바뀌면 두 곳의 상수를 새 시즌 ID로 변경한다.

| 파일 | 상수 |
|---|---|
| `packages/service/src/er-service.ts` | `CURRENT_SEASON_ID` |
| `apps/crawler/src/collect.ts` | `CURRENT_SEASON_ID` |

```ts
// 예시: 시즌 39 → 40으로 변경
const CURRENT_SEASON_ID = 40;
```

> 두 파일의 값이 다르면 앱의 전적 조회와 크롤러 수집 대상이 달라지므로 반드시 함께 변경한다.

### 2. `seasons.json`

`apps/desktop/src/renderer/src/shared/constants/ko-json/seasons.json`

새 시즌 항목을 추가하고, 이전 시즌의 `isCurrent`를 `false`로, 새 시즌의 `isCurrent`를 `true`로 변경한다. 이 값은 앱 상단 버전 표기(`v11.4` 형식)에 사용된다.

---

## 시즌 ID 확인 방법

BSER Open API의 `/v1/data/Season` 엔드포인트에서 현재 시즌 정보를 조회할 수 있다.

```
GET https://open-api.bser.io/v1/data/Season
x-api-key: {API_KEY}
```

응답의 `Season` 배열에서 현재 활성 시즌의 `seasonID` 값을 확인한다.

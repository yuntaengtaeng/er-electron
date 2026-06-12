# 이터널 리턴 Open API 스펙

이 문서는 이터널 리턴 공식 Open API의 엔드포인트, 응답 필드, 타입 정의를 위한 스펙 문서입니다.
실제 API 응답을 분석해서 작성했으며, 공식 문서에 명시되지 않은 필드는 추정값임을 표기합니다.

---

## 목차

1. [공통 사항](#공통-사항)
2. [엔드포인트 목록](#엔드포인트-목록)
3. [UserGame 응답 필드](#usergame-응답-필드)
4. [알려진 이슈 및 주의사항](#알려진-이슈-및-주의사항)
5. [타입 정의 현황](#타입-정의-현황)

---

## 공통 사항

**Base URL**
```
https://open-api.bser.io
```

**인증**
모든 요청에 헤더 필요:
```
x-api-key: {API_KEY}
```

**공통 응답 구조**
```json
{
  "code": 200,
  "message": "Success",
  "data": ...
}
```

---

## 엔드포인트 목록

### 유저

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| GET | `/v1/user/nickname?query={nickname}` | 닉네임으로 userId/userNum 조회 | 응답 확인 ✅ |
| GET | `/v1/user/games/{userNum}` | userNum으로 게임 기록 조회 | 응답 확인 ✅ |
| GET | `/v1/user/games/uid/{userId}` | userId로 게임 기록 조회 | 응답 확인 ✅ |
| GET | `/v1/user/stats/{userNum}/{seasonId}` | userNum으로 시즌 통계 조회 | 미확인 |
| GET | `/v1/user/stats/uid/{userId}/{seasonId}` | userId로 시즌 통계 조회 | 미확인 |
| GET | `/v2/user/stats/{userNum}/{seasonId}/{matchingMode}` | 모드별 통계 (v2) | 미확인 |
| GET | `/v2/user/stats/uid/{userId}/{seasonId}/{matchingMode}` | userId + 모드별 통계 (v2) | 미확인 |

### 게임

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| GET | `/v1/games/{gameId}` | 특정 게임 전체 참가자 데이터 조회 | 응답 확인 ✅ |

### 랭크

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| GET | `/v1/rank/top/{seasonId}/{matchingTeamMode}` | 전체 서버 상위 랭커 목록 | 미확인 |
| GET | `/v1/rank/top/{seasonId}/{matchingTeamMode}/{serverCode}` | 서버별 상위 랭커 목록 | 미확인 |
| GET | `/v1/rank/{userNum}/{seasonId}/{matchingTeamMode}` | userNum으로 랭크 조회 | 미확인 |
| GET | `/v1/rank/uid/{userId}/{seasonId}/{matchingTeamMode}` | userId로 랭크 조회 | 미확인 |

### 유니온팀

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| GET | `/v1/unionTeam/{userNum}/{seasonId}` | userNum으로 유니온팀 조회 | 미확인 |
| GET | `/v1/unionTeam/uid/{userId}/{seasonId}` | userId로 유니온팀 조회 | 미확인 |

### 메타데이터

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| GET | `/v1/data/{metaType}` | 게임 메타 데이터 | 일부 확인 ✅ |
| GET | `/v2/data/{metaType}` | 게임 메타 데이터 v2 | 일부 확인 ✅ |
| GET | `/v1/l10n/{language}` | 언어별 번역 데이터 | 응답 확인 ✅ |
| GET | `/v1/freeCharacters/{matchingMode}` | 무료 캐릭터 목록 | 미확인 |

### 무기 루트

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| GET | `/v1/weaponRoutes/recommend` | 추천 무기 루트 목록 | 미확인 |
| GET | `/v1/weaponRoutes/recommend/{routeId}` | 특정 루트 상세 조회 | 미확인 |

---

## UserGame 응답 필드

`/v1/user/games/uid/{userId}` 및 `/v1/games/{gameId}` 응답의 `userGames` 배열 각 항목.

### 기본 정보

| 필드 | 타입 | 설명 |
|------|------|------|
| `nickname` | `string` | 플레이어 닉네임 |
| `gameId` | `number` | 게임 고유 ID |
| `seasonId` | `number` | 시즌 번호. 0이면 비시즌 |
| `matchingMode` | `number` | 게임 모드. 3=랭크, 6=스쿼드럼블, 8=코발트 프로토콜 |
| `matchingTeamMode` | `number` | 팀 구성. 3=3인팀, 4=4인팀 |
| `characterNum` | `number` | 사용한 캐릭터 ID |
| `skinCode` | `number` | 사용한 스킨 코드 |
| `characterLevel` | `number` | 게임 종료 시 캐릭터 레벨 |
| `gameRank` | `number` | 최종 순위 |
| `serverName` | `string` | 서버 이름 (예: "Asia") |
| `versionSeason` | `number` | 버전 시즌 번호 |
| `versionMajor` | `number` | 메이저 버전 |
| `versionMinor` | `number` | 마이너 버전 |
| `language` | `string` | 클라이언트 언어 설정 (예: "ko", "zh_CN") |
| `accountLevel` | `number` | 계정 레벨 |
| `mlbot` | `boolean` | 봇 여부 |
| `isMLBot` | `boolean` | 봇 여부 (중복 필드, 최신 응답 기준) |
| `botLevel` | `number` | 봇 레벨 (0이면 봇 아님) |

### 전투 통계

| 필드 | 타입 | 설명 |
|------|------|------|
| `playerKill` | `number` | 킬 수 |
| `playerAssistant` | `number` | 어시스트 수 |
| `monsterKill` | `number` | 몬스터 킬 수 |
| `teamKill` | `number` | 팀 전체 킬 수 |
| `totalFieldKill` | `number` | 필드 내 총 킬 수 |
| `teamDown` | `number` | 팀 전체 다운 수 |
| `teamDownCanNotEliminate` | `number` | 처치 불가 상태 다운 수 |
| `teamDownCanEliminate` | `number` | 처치 가능 상태 다운 수 |
| `teamRepeatDown` | `number` | 연속 다운 수 |
| `teamRepeatDownCanNotEliminate` | `number` | 처치 불가 연속 다운 수 |
| `teamRepeatDownCanEliminate` | `number` | 처치 가능 연속 다운 수 |
| `playerDeaths` | `number` | 죽은 횟수 |
| `terminateCount` | `number` | 다운된 적을 처치(종결)한 횟수 |
| `terminateCountCanNotEliminate` | `number` | 처치 불가 상태인 적을 종결한 횟수 |
| `breakCount` | `number` | 브레이크 횟수 ⚠️ 추정: 브레이크를 당한 또는 시킨 횟수 — 미확인 |
| `clutchCount` | `number` | 클러치 횟수 |
| `teamElimination` | `number` | 팀 전체 처치 횟수 |
| `killDetails` | `string` | 캐릭터별 킬 횟수 (JSON 문자열. 키=characterNum) |
| `deathDetails` | `string` | 캐릭터별 데스 횟수 (JSON 문자열. 키=characterNum) |
| `killsPhaseOne` | `number` | 1페이즈 킬 수 |
| `killsPhaseTwo` | `number` | 2페이즈 킬 수 |
| `killsPhaseThree` | `number` | 3페이즈 킬 수 |
| `deathsPhaseOne` | `number` | 1페이즈 데스 수 |
| `deathsPhaseTwo` | `number` | 2페이즈 데스 수 |
| `deathsPhaseThree` | `number` | 3페이즈 데스 수 |
| `totalDoubleKill` | `number` | 더블킬 횟수 |
| `totalTripleKill` | `number` | 트리플킬 횟수 |
| `totalQuadraKill` | `number` | 쿼드라킬 횟수 |
| `totalExtraKill` | `number` | 그 이상 연속킬 횟수 |
| `unknownKill` | `number` | 알 수 없는 킬 수 |
| `ccTimeToPlayer` | `number` | 플레이어에게 가한 총 CC 시간 (초) |
| `killGamma` | `boolean` | 감마 처치 여부 |
| `totalTKPerMin` | `number[]` | 분당 팀킬 누적 배열 (인덱스=분) |
| `scoredPoint` | `number[]` | 라운드별 획득 점수 배열 |

### 무기 / 장비 / 숙련도

| 필드 | 타입 | 설명 |
|------|------|------|
| `bestWeapon` | `number` | 가장 높은 숙련도 무기 타입 ID |
| `bestWeaponLevel` | `number` | 해당 무기의 숙련도 레벨 |
| `masteryLevel` | `Record<string, number>` | 숙련도 타입별 레벨. 키=타입ID, 값=레벨 |
| `equipment` | `Record<string, number>` | 슬롯별 장착 아이템 코드. 0=무기, 1~4=방어구 |
| `equipmentGrade` | `Record<string, number>` | 슬롯별 아이템 등급 |
| `startingItems` | `number[]` | 시작 아이템 코드 목록 |
| `equipFirstItemForLog` | `Record<string, number[]>` | 슬롯별 첫 장착 아이템 이력 |
| `collectItemForLog` | `number[]` | 아이템 수집 로그 배열 |

#### 무기 타입 ID 매핑

l10n 파일(`/v1/l10n/Korean`) 순서 기준. **공식 API에 ID 필드가 없어 순서로 추정한 값.**

| ID | 영문 | 한국어 |
|----|------|--------|
| 1 | Glove | 글러브 |
| 2 | Tonfa | 톤파 |
| 3 | Bat | 방망이 |
| 4 | Whip | 채찍 |
| 5 | HighAngleFire | 투척 |
| 6 | DirectFire | 암기 |
| 7 | Bow | 활 |
| 8 | CrossBow | 석궁 |
| 9 | Pistol | 권총 |
| 10 | AssaultRifle | 돌격 소총 |
| 11 | SniperRifle | 저격총 |
| 12 | Hammer | 망치 |
| 13 | Axe | 도끼 |
| 14 | OneHandSword | 단검 |
| 15 | TwoHandSword | 양손검 |
| 16 | Polearm | 폴암 |
| 17 | DualSword | 쌍검 |
| 18 | Spear | 창 |
| 19 | Nunchaku | 쌍절곤 |
| 20 | Rapier | 레이피어 |
| 21 | Guitar | 기타 |
| 22 | Camera | 카메라 |
| 23 | Arcana | 아르카나 |
| 24 | VFArm | VF의수 |

> ⚠️ `/v2/data/WeaponTypeInfo` API 배열 순서와 실제 `bestWeapon` ID 체계가 일치하지 않음. 위 매핑은 l10n 파일 순서 기반 추정값이며, 닥지지 등 서드파티 매핑과 다를 수 있어 검증 필요.

#### masteryLevel 키 범주 (추정)

| 키 범위 | 설명 |
|---------|------|
| 1 ~ 24 | 무기 타입 숙련도 (위 무기 타입 ID와 동일) |
| 101 ~ 103 | 생존 관련 숙련도 (추정) |
| 201 ~ 202 | 기타 숙련도 (추정) |

### 스킬

| 필드 | 타입 | 설명 |
|------|------|------|
| `skillLevelInfo` | `Record<string, number>` | 스킬별 레벨. 키=스킬코드, 값=레벨 |
| `skillOrderInfo` | `Record<string, number>` | 스킬 찍은 순서. 키=순서번호, 값=스킬코드 |

> 스킬 코드 패턴: `{characterNum * 10000 + 스킬번호}`. 예: 캐릭터 46의 Q는 `1046200`.
> 무기 전술스킬 패턴: `30{bestWeaponId}000`. 예: 폴암(16)이면 `3016000`.

### MMR / 랭크

| 필드 | 타입 | 설명 |
|------|------|------|
| `mmrBefore` | `number` | 게임 전 MMR |
| `mmrAfter` | `number` | 게임 후 MMR |
| `mmrGain` | `number` | MMR 변화량 (mmrGainInGame + mmrLossEntryCost) |
| `mmrGainInGame` | `number` | 인게임 MMR 획득량 |
| `mmrLossEntryCost` | `number` | MMR 입장 비용 차감량 (음수) |
| `mmrAvg` | `number` | 해당 매치의 평균 MMR |
| `rankPoint` | `number` | 랭크 포인트 |
| `victory` | `number` | 승리 여부. 1=승, 0=패 |
| `gainedNormalMmrKFactor` | `number` | MMR 계산에 사용된 K-factor |
| `premadeMatchingType` | `number` | 파티 매칭 타입 |
| `exceptPreMadeTeam` | `boolean` | 파티 제외 여부 |

### 시간

| 필드 | 타입 | 설명 |
|------|------|------|
| `startDtm` | `string` | 게임 시작 시각 (ISO 8601) |
| `duration` | `number` | 게임 전체 진행 시간 (초) |
| `playTime` | `number` | 실제 플레이 시간 (초) |
| `watchTime` | `number` | 관전 시간 (초) |
| `totalTime` | `number` | 총 시간 (초) |
| `survivableTime` | `number` | 생존 가능 시간 |
| `expireDtm` | `string` | 데이터 만료 시각 (ISO 8601) |
| `afkDtm` | `string` | AFK 시작 시각 |
| `giveupDtm` | `string` | 포기 시각 |

### 데미지

| 필드 | 타입 | 설명 |
|------|------|------|
| `damageToPlayer` | `number` | 플레이어에게 가한 총 데미지 |
| `damageToPlayer_basic` | `number` | 기본공격 데미지 |
| `damageToPlayer_skill` | `number` | 스킬 데미지 |
| `damageToPlayer_itemSkill` | `number` | 아이템 스킬 데미지 |
| `damageToPlayer_direct` | `number` | 직접 데미지 |
| `damageToPlayer_uniqueSkill` | `number` | 고유 스킬 데미지 |
| `damageToPlayer_trap` | `number` | 트랩 데미지 |
| `damageToPlayer_Shield` | `number` | 보호막 상태에서 가한 데미지 |
| `damageFromPlayer` | `number` | 플레이어에게 받은 총 데미지 (세분화 구조 동일) |
| `damageToMonster` | `number` | 몬스터에게 가한 데미지 (세분화 구조 동일) |
| `damageFromMonster` | `number` | 몬스터에게 받은 데미지 |
| `damageOffsetedByShield_Player` | `number` | 보호막으로 막은 플레이어 데미지 |
| `damageOffsetedByShield_Monster` | `number` | 보호막으로 막은 몬스터 데미지 |
| `damageToGuideRobot` | `number` | 가이드 로봇에게 가한 데미지 |

### 회복 / 보호막

| 필드 | 타입 | 설명 |
|------|------|------|
| `healAmount` | `number` | 본인 회복량 |
| `teamRecover` | `number` | 팀원 회복량 |
| `protectAbsorb` | `number` | 보호막 흡수량 |
| `usedNormalHealPack` | `number` | 일반 힐팩 사용 횟수 |
| `usedReinforcedHealPack` | `number` | 강화 힐팩 사용 횟수 |
| `usedNormalShieldPack` | `number` | 일반 실드팩 사용 횟수 |
| `usedReinforceShieldPack` | `number` | 강화 실드팩 사용 횟수 |

### 사망 정보

| 필드 | 타입 | 설명 |
|------|------|------|
| `killer` | `string` | 죽인 플레이어 닉네임 (`"player"` or `"wildAnimal"`) |
| `killDetail` | `string` | 죽인 플레이어 닉네임 (실제 값) |
| `killerCharacter` | `string` | 죽인 플레이어의 캐릭터 영문명 |
| `killerWeapon` | `string` | 죽인 플레이어의 무기 타입 영문명 |
| `causeOfDeath` | `string` | 사망 원인 스킬명 |
| `placeOfDeath` | `string` | 사망 지역 코드 |
| `killer2` / `killer3` | `string` | 2, 3번째 죽인 플레이어 (동일 구조) |
| `giveUp` | `number` | 포기 여부 |
| `escapeState` | `number` | 탈출 상태 |
| `isInnocentGiveUp` | `boolean` | 정당한 포기 여부 |
| `innocentGiveUp` | `boolean` | 정당한 포기 여부 (중복 필드) |
| `IsLeavingBeforeCreditRevivalTerminate` | `boolean` | 크레딧 부활 종료 전 이탈 여부 |
| `isLeavingBeforeCreditRevivalTerminate` | `boolean` | 위 필드의 소문자 버전 (중복 필드) |

### 지형지물 / 이동

| 필드 | 타입 | 설명 |
|------|------|------|
| `placeOfStart` | `string` | 시작 지역 코드 |
| `useHyperLoop` | `number` | 하이퍼루프 사용 횟수 |
| `useSecurityConsole` | `number` | 보안 콘솔 사용 횟수 |
| `addTelephotoCamera` | `number` | 망원 카메라 설치 횟수 |
| `removeTelephotoCamera` | `number` | 망원 카메라 제거 횟수 |
| `addSurveillanceCamera` | `number` | 감시 카메라 설치 횟수 |
| `removeSurveillanceCamera` | `number` | 감시 카메라 제거 횟수 |
| `fishingCount` | `number` | 낚시 횟수 |
| `useEmoticonCount` | `number` | 이모티콘 사용 횟수 |
| `usedPairLoop` | `number` | 페어루프 사용 횟수 |
| `useReconDrone` | `number` | 정찰 드론 사용 횟수 |
| `useEmpDrone` | `number` | EMP 드론 사용 횟수 |
| `useGuideRobot` | `number` | 가이드 로봇 사용 횟수 |
| `guideRobotRadial` | `number` | 가이드 로봇 레이디얼 사용 횟수 |
| `guideRobotFlagShip` | `number` | 가이드 로봇 플래그쉽 사용 횟수 |
| `guideRobotSignature` | `number` | 가이드 로봇 시그니처 사용 횟수 |
| `crGetByGuideRobot` | `number` | 가이드 로봇으로 획득한 크레딧 |

### 매치 구성

| 필드 | 타입 | 설명 |
|------|------|------|
| `teamNumber` | `number` | 팀 번호 |
| `preMade` | `number` | 팀 구성 인원 수 |
| `matchSize` | `number` | 매치 총 참가 인원 |
| `botAdded` | `number` | 추가된 봇 수 |
| `botRemain` | `number` | 남은 봇 수 |
| `routeIdOfStart` | `number` | 시작 루트 ID |
| `routeSlotId` | `number` | 루트 슬롯 ID |
| `safeAreas` | `number` | 안전 구역 수 |
| `restrictedAreaAccelerated` | `number` | 구역 가속 여부 |
| `squadRumbleRank` | `number` | 스쿼드럼블 내 순위 |
| `reunitedCount` | `number` | 재합류 횟수 |
| `timeSpentInBriefingRoom` | `number` | 브리핑룸 대기 시간 (초) |
| `usingDefaultGameOption` | `boolean` | 기본 게임 옵션 사용 여부 |

### 설치물 (activeInstallation)

키=설치물 ID, 값=사용 횟수.

| ID | 이름 |
|----|------|
| 1 | 반딧불 꽃 |
| 2 | 모래 광대 버섯 |
| 3 | 힐링 스프레이 |
| 4 | 하늘나리 |
| 5 | 심연 단지 |
| 6 | 폭탄열매 |
| 7 | 인화성 드럼통 |
| 21 | 등불 꽃 |
| 22 | 모래 질주 버섯 |
| 23 | 힐링 스플래터 |
| 25 | 안개 둥지 |
| 26 | 괘종시계 |
| 27 | 사과나무 |
| 29 | 배럴 |

### 인퓨전 / 특성

| 필드 | 타입 | 설명 |
|------|------|------|
| `finalInfusion` | `number[]` | 게임 종료 시 보유한 인퓨전 코드 목록 |
| `boughtInfusion` | `string` | 구매한 인퓨전 내역 (JSON 문자열. 키=코드, 값=수량) |
| `traitFirstCore` | `number` | 첫 번째 특성 코어 코드 |
| `traitFirstSub` | `number[]` | 첫 번째 특성 서브 코드 목록 |
| `traitSecondSub` | `number[]` | 두 번째 특성 서브 코드 목록 |
| `tacticalSkillGroup` | `number` | 전술 스킬 그룹 코드 |
| `tacticalSkillLevel` | `number` | 전술 스킬 레벨 |
| `tacticalSkillUseCount` | `number` | 전술 스킬 사용 횟수 |

### VF 크레딧 (코발트 프로토콜)

| 필드 | 타입 | 설명 |
|------|------|------|
| `totalVFCredits` | `number[]` | 라운드별 누적 크레딧 배열 |
| `usedVFCredits` | `number[]` | 라운드별 사용 크레딧 배열 |
| `sumUsedVFCredits` | `number` | 총 사용 크레딧 |
| `totalGainVFCredit` | `number` | 총 획득 크레딧 |
| `activelyGainedCredits` | `number` | 적극적 행동으로 획득한 크레딧 |
| `creditSource` | `Record<string, number>` | 크레딧 획득 출처별 내역 |
| `totalTurbineTakeOver` | `number` | 터빈 점령 횟수 (코발트 모드) |
| `creditRevivalCount` | `number` | 크레딧으로 부활한 횟수 |
| `creditRevivedOthersCount` | `number` | 크레딧으로 아군 부활시킨 횟수 |
| `kioskFromMaterialUseVFCredit` | `number` | 소재 키오스크 사용 크레딧 |
| `kioskFromEscapeKeyUseVFCredit` | `number` | 탈출키 키오스크 사용 크레딧 |
| `kioskFromRevivalUseVFCredit` | `number` | 부활 키오스크 사용 크레딧 |
| `remoteDroneUseVFCreditMySelf` | `number` | 원격 드론 본인 사용 크레딧 |
| `remoteDroneUseVFCreditAlly` | `number` | 원격 드론 아군 사용 크레딧 |
| `tacticalSkillUpgradeUseVFCredit` | `number` | 전술 스킬 강화 사용 크레딧 |
| `infusionStoreUseVFCredit` | `number` | 인퓨전 상점 사용 크레딧 |
| `kioskExchangeCredit` | `number` | 키오스크 교환 크레딧 |

### 제작

| 필드 | 타입 | 설명 |
|------|------|------|
| `craftUncommon` | `number` | 고급 아이템 제작 횟수 |
| `craftRare` | `number` | 희귀 아이템 제작 횟수 |
| `craftEpic` | `number` | 영웅 아이템 제작 횟수 |
| `craftLegend` | `number` | 전설 아이템 제작 횟수 |
| `craftMythic` | `number` | 신화 아이템 제작 횟수 |
| `campFireCraftUncommon` | `number` | 캠프파이어 고급 제작 횟수 |
| `campFireCraftRare` | `number` | 캠프파이어 희귀 제작 횟수 |
| `campFireCraftEpic` | `number` | 캠프파이어 영웅 제작 횟수 |
| `campFireCraftLegendary` | `number` | 캠프파이어 전설 제작 횟수 |
| `foodCraftCount` | `number[]` | 음식 제작 횟수 배열 |

### 어댑티브 포스 / 스탯

| 필드 | 타입 | 설명 |
|------|------|------|
| `adaptiveForce` | `number` | 어댑티브 포스 총량 |
| `adaptiveForceAttack` | `number` | 공격 어댑티브 포스 |
| `adaptiveForceAmplify` | `number` | 증폭 어댑티브 포스 |
| `skillAmp` | `number` | 스킬 증폭 수치 |
| `maxHp` | `number` | 최대 HP |
| `maxSp` | `number` | 최대 SP |
| `attackPower` | `number` | 공격력 |
| `defense` | `number` | 방어력 |
| `attackSpeed` | `number` | 공격 속도 |
| `moveSpeed` | `number` | 이동 속도 |
| `outOfCombatMoveSpeed` | `number` | 비전투 이동 속도 |
| `attackRange` | `number` | 공격 사거리 |
| `sightRange` | `number` | 시야 범위 |
| `criticalStrikeChance` | `number` | 치명타 확률 |
| `criticalStrikeDamage` | `number` | 치명타 피해 |
| `coolDownReduction` | `number` | 쿨다운 감소 |
| `lifeSteal` | `number` | 생명력 흡수 |
| `normalLifeSteal` | `number` | 기본 공격 생명력 흡수 |
| `skillLifeSteal` | `number` | 스킬 생명력 흡수 |
| `amplifierToMonster` | `number` | 몬스터 대상 증폭 |
| `trapDamage` | `number` | 트랩 데미지 |
| `hpRegen` | `number` | HP 재생 |
| `spRegen` | `number` | SP 재생 |
| `gainExp` | `number` | 획득 경험치 |
| `baseExp` | `number` | 기본 경험치 |
| `bonusExp` | `number` | 보너스 경험치 |
| `bonusCoin` | `number` | 보너스 코인 |

### 기타

| 필드 | 타입 | 설명 |
|------|------|------|
| `killMonsters` | `Record<string, number>` | 몬스터 종류별 킬 수 |
| `itemTransferredConsole` | `number[]` | 콘솔로 전달한 아이템 코드 목록 |
| `itemTransferredDrone` | `number[]` | 드론으로 전달한 아이템 코드 목록 |
| `activeInstallation` | `Record<string, number>` | 설치물 사용 내역 |
| `useGadget` | `Record<string, number>` | 가젯 사용 내역 |
| `getBoriReward` | `Record<string, number>` | 보리 보상 내역 |
| `treeOfLifeSpawn` | `number[]` | 생명의 나무 스폰 지역 코드 목록 |
| `viewContribution` | `number` | 시야 기여도 |
| `resurrectionKitUsageCount` | `number` | 부활 키트 사용 횟수 |
| `resurrectionKitToCredit` | `number` | 부활 키트 크레딧 전환 횟수 |
| `enterDimensionRift` | `number` | 차원의 균열 입장 횟수 |
| `enterDimensionEmpoweredRift` | `number` | 강화 차원의 균열 입장 횟수 |
| `winFromDimensionRift` | `number` | 차원의 균열 승리 횟수 |
| `winFromDimensionEmpoweredRift` | `number` | 강화 차원의 균열 승리 횟수 |
| `enterTurbulentRift` | `number` | 격동의 균열 입장 횟수 |
| `eventMissionResult` | `Record<string, unknown>` | 이벤트 미션 결과 |
| `cobaltRandomPickRemoveCharacter` | `number` | 코발트 랜덤픽 제거 캐릭터 수 |
| `mainWeather` | `number` | 메인 날씨 코드 |
| `subWeather` | `number` | 서브 날씨 코드 |
| `battleZone1AreaCode` | `number` | 배틀존1 지역 코드 |
| `battleZone1BattleMark` | `number` | 배틀존1 배틀마크 |
| `battleZone1Winner` | `number` | 배틀존1 승자 |
| `battleZone1BattleMarkCount` | `number` | 배틀존1 배틀마크 수 |
| `battleZonePlayerKill` | `number` | 배틀존 플레이어 킬 수 |
| `battleZoneDeaths` | `number` | 배틀존 데스 수 |
| `teamBattleZoneDown` | `number` | 배틀존 팀 다운 수 |
| `gimmickEvidenceLockerCount` | `string` | 기믹 증거 보관함 수 (JSON 문자열) |
| `gimmickEvidenceLockerItem` | `string` | 기믹 증거 보관함 아이템 (JSON 문자열) |
| `gimmickAppleDropped` | `number` | 기믹 사과 드롭 수 |
| `gimmickDrumUseCount` | `number` | 기믹 드럼 사용 횟수 |
| `gimmickDrumAttackCount` | `number` | 기믹 드럼 공격 횟수 |
| `gimmickDrumDroppedHitCount` | `number` | 기믹 드럼 낙하 명중 횟수 |
| `gimmickHospitalDiscountRate` | `number` | 기믹 병원 할인율 |
| `gimmickGrandfatherClockUseCount` | `number` | 기믹 괘종시계 사용 횟수 |
| `milliTournamentKillScore` | `number` | 밀리 토너먼트 킬 점수 (-1이면 해당 없음) |
| `tournamentRankScore` | `number` | 토너먼트 랭크 점수 (-1이면 해당 없음) |
| `getBuffCubeRed` | `number` | 빨간 버프 큐브 획득 수 |
| `getBuffCubePurple` | `number` | 보라 버프 큐브 획득 수 |
| `getBuffCubeGreen` | `number` | 초록 버프 큐브 획득 수 |
| `getBuffCubeGold` | `number` | 금색 버프 큐브 획득 수 |
| `getBuffCubeSkyBlue` | `number` | 하늘색 버프 큐브 획득 수 |
| `sumGetBuffCube` | `number` | 버프 큐브 총 획득 수 |

---

## 알려진 이슈 및 주의사항

### 1. 무기 타입 ID 매핑 미확인

`bestWeapon` 필드는 숫자 ID인데, 공식 API에 이 ID를 영문 타입명으로 변환하는 명확한 엔드포인트가 없음.

- `/v2/data/WeaponTypeInfo` API는 배열 순서와 ID가 일치하지 않아 사용 불가
- l10n 파일에도 숫자 ID 키가 없음
- 현재는 l10n 파일 순서 기반 추정값 사용 중
- 닥지지 등 서드파티는 별도 내부 매핑 보유 추정 (`er.dakgg.io/api/v1/data/masteries` 등)

**검증 필요:** 현재 매핑이 정확한지 다양한 캐릭터/무기 데이터로 교차 검증 필요.

### 2. 캐릭터 이름 한국어 변환

`/v2/data/Character` API의 `name` 필드는 캐릭터마다 한국어/영어 혼재.
l10n을 통해 올바른 키로 변환해야 함.

```
올바른 키: Character/Name/{characterNum}
잘못된 키: D_CharLobby_{resource}_S000  ← 기존 코드의 버그
```

### 3. 중복 필드

일부 필드가 대소문자만 다른 중복 버전으로 존재:
- `mlbot` / `isMLBot`
- `innocentGiveUp` / `isInnocentGiveUp`
- `IsLeavingBeforeCreditRevivalTerminate` / `isLeavingBeforeCreditRevivalTerminate`

타입 정의 시 둘 다 포함 필요.

### 4. `breakCount` 미확인

같은 팀 플레이어들이 동일한 `breakCount` 값을 가지는 패턴 확인.
브레이크 관련 횟수로 추정되나 정확한 의미 미확인.

---

## 타입 정의 현황

### 응답 확인 완료 (타입 정의 가능)

- `GET /v1/user/nickname` ✅
- `GET /v1/user/games/uid/{userId}` ✅
- `GET /v1/games/{gameId}` ✅
- `GET /v2/data/WeaponTypeInfo` ✅
- `GET /v1/l10n/{language}` ✅

### 응답 미확인 (추가 수집 필요)

- `GET /v1/user/stats/**`
- `GET /v2/user/stats/uid/{userId}/{seasonId}/{matchingMode}` ✅
- `GET /v1/rank/**`
- `GET /v1/unionTeam/**`
- `GET /v2/data/hash` ✅
- `GET /v2/data/Character`
- `GET /v1/freeCharacters/**`
- `GET /v1/weaponRoutes/recommend` — 미확인
- `GET /v1/weaponRoutes/recommend/{routeId}` ✅

---

> 이 문서는 공식 문서가 아니며 실제 API 응답 분석 기반으로 작성되었습니다.
> ⚠️ 표기된 항목은 추정값이며 검증이 필요합니다.

---

## UserStats 응답 필드

`/v2/user/stats/uid/{userId}/{seasonId}/{matchingMode}` 및 `/v2/user/stats/{userNum}/{seasonId}/{matchingMode}` 응답의 `userStats` 배열 각 항목.

### 시즌 통계

| 필드 | 타입 | 설명 |
|------|------|------|
| `seasonId` | `number` | 시즌 번호 |
| `matchingMode` | `number` | 게임 모드. 3=랭크, 6=스쿼드럼블, 8=코발트 |
| `matchingTeamMode` | `number` | 팀 구성. 3=3인팀, 4=4인팀 |
| `mmr` | `number` | 현재 MMR |
| `rank` | `number` | 현재 랭크 순위 |
| `rankSize` | `number` | 전체 랭크 참여 인원 수 |
| `rankPercent` | `number` | 상위 몇 % (예: 0.17 = 상위 0.17%) |
| `totalGames` | `number` | 총 게임 수 |
| `totalWins` | `number` | 총 승리 수 |
| `totalTeamKills` | `number` | 총 팀킬 수 |
| `totalDeaths` | `number` | 총 데스 수 |
| `escapeCount` | `number` | 탈출 횟수 |
| `averageRank` | `number` | 평균 순위 |
| `averageKills` | `number` | 평균 킬 수 |
| `averageAssistants` | `number` | 평균 어시스트 수 |
| `averageHunts` | `number` | 평균 몬스터 킬 수 |
| `top1` | `number` | 1등 비율 (0~1) |
| `top2` | `number` | 2등 이내 비율 (0~1) |
| `top3` | `number` | 3등 이내 비율 (0~1) |
| `top5` | `number` | 5등 이내 비율 (0~1) |
| `top7` | `number` | 7등 이내 비율 (0~1) |
| `characterStats` | `CharacterStat[]` | 캐릭터별 통계 목록 |

### CharacterStat

| 필드 | 타입 | 설명 |
|------|------|------|
| `characterCode` | `number` | 캐릭터 ID |
| `totalGames` | `number` | 해당 캐릭터로 플레이한 총 게임 수 |
| `usages` | `number` | 사용 횟수 (totalGames와 동일한 값으로 추정) |
| `maxKillings` | `number` | 최다 킬 수 |
| `top3` | `number` | 3등 이내 횟수 |
| `wins` | `number` | 승리 횟수 |
| `mostUsedSkinCode` | `number` | 가장 많이 사용한 스킨 코드 |
| `latestUsedSkinCode` | `number` | 가장 최근에 사용한 스킨 코드 |
| `top3Rate` | `number` | 3등 이내 비율 (0~1) |
| `averageRank` | `number` | 해당 캐릭터 평균 순위 |

---

## WeaponRoute 응답 필드

`/v1/weaponRoutes/recommend/{routeId}` 응답의 `result` 객체.

### RecommendWeaponRoute

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `number` | 루트 고유 ID |
| `title` | `string` | 루트 제목 |
| `userNum` | `number` | 작성자 userNum |
| `userNickname` | `string` | 작성자 닉네임 |
| `characterCode` | `number` | 캐릭터 ID |
| `slotId` | `number` | 슬롯 ID |
| `weaponType` | `number` | 무기 타입 ID |
| `weaponCodes` | `string` | 무기 아이템 코드 목록 (JSON 배열 문자열) |
| `traitCodes` | `string` | 특성 코드 목록 (JSON 배열 문자열) |
| `lateGameItemCodes` | `string` | 후반 아이템 코드 목록 (JSON 객체 문자열. 키=슬롯, 값=아이템 코드 배열) |
| `remoteTransferItemCodes` | `string` | 원격 전달 아이템 코드 목록 (JSON 배열 문자열) |
| `tacticalSkillGroupCode` | `number` | 전술 스킬 그룹 코드 |
| `paths` | `string` | 이동 경로 지역 코드 목록 (JSON 배열 문자열) |
| `count` | `number` | 조회 수 (추정) |
| `version` | `string` | 게임 버전 (예: "11.3.0") |
| `teamMode` | `number` | 팀 모드 |
| `languageCode` | `string` | 언어 코드 (예: "ko") |
| `routeVersion` | `number` | 루트 버전 |
| `share` | `boolean` | 공유 여부 |
| `updateDtm` | `number` | 마지막 수정 시각 (Unix timestamp ms) |
| `v2Like` | `number` | 좋아요 수 |
| `v2WinRate` | `number` | 승률 (%) |
| `v2SeasonId` | `number` | 현재 시즌 ID |
| `v2AccumulateLike` | `number` | 누적 좋아요 수 |
| `v2AccumulateWinRate` | `number` | 누적 승률 (%) |
| `v2AccumulateSeasonId` | `number` | 누적 기준 시즌 ID |

### RecommendWeaponRouteDesc

| 필드 | 타입 | 설명 |
|------|------|------|
| `recommendWeaponRouteId` | `number` | 루트 ID (RecommendWeaponRoute.id와 동일) |
| `skillPath` | `string` | 스킬 찍는 순서 (쉼표 구분 문자열. q/w/e/r/t=스킬키) |
| `desc` | `string` | 루트 설명 텍스트 |

> JSON 문자열로 감싸진 필드(`weaponCodes`, `traitCodes`, `lateGameItemCodes`, `paths`, `remoteTransferItemCodes`)는 사용 시 `JSON.parse()` 필요.

---

## 메타데이터 타입 목록

`/v2/data/hash` 응답. 사용 가능한 모든 `metaType` 키와 각 데이터의 해시값을 반환.
해시값은 데이터 변경 여부 감지에 활용 가능.

| metaType | 해시값 | 설명 |
|----------|--------|------|
| `ActionCost` | 960655380 | 행동 비용 |
| `Area` | 2497425820 | 지역 정보 |
| `BattleZoneReward` | 153833242 | 배틀존 보상 |
| `BulletCapacity` | 877890691 | 탄약 용량 |
| `Character` | 819109160 | 캐릭터 기본 정보 |
| `CharacterAttributes` | 4102981866 | 캐릭터 속성 |
| `CharacterExp` | 3658602295 | 캐릭터 경험치 테이블 |
| `CharacterLevelUpStat` | 2278847879 | 캐릭터 레벨업 스탯 |
| `CharacterMastery` | 3086067710 | 캐릭터 숙련도 |
| `CharacterModeModifier` | 1687702849 | 캐릭터 모드 보정치 |
| `CharacterSkin` | 1469654503 | 캐릭터 스킨 |
| `Collectible` | 431224152 | 수집품 |
| `DropGroup` | 2292286087 | 드롭 그룹 |
| `GainExp` | 240814443 | 경험치 획득 테이블 |
| `GainScore` | 2845206178 | 점수 획득 테이블 |
| `GameTip` | 1363464100 | 게임 팁 |
| `InfusionProduct` | 4064360976 | 인퓨전 상품 |
| `ItemArmor` | 4217067975 | 방어구 아이템 |
| `ItemConsumable` | 199839975 | 소모품 아이템 |
| `ItemMisc` | 2207637398 | 기타 아이템 |
| `ItemSearchOptionV2` | 2606082456 | 아이템 검색 옵션 (v2) |
| `ItemSpawn` | 2940133308 | 아이템 스폰 정보 |
| `ItemSpecial` | 2333529752 | 특수 아이템 |
| `ItemWeapon` | 2663512138 | 무기 아이템 |
| `Level` | 1502997333 | 레벨 테이블 |
| `LoadingTip` | 2262746349 | 로딩 팁 |
| `MasteryExp` | 1470198269 | 숙련도 경험치 테이블 |
| `MasteryLevel` | 649462043 | 숙련도 레벨 테이블 |
| `MasteryStat` | 3284778682 | 숙련도 스탯 |
| `Monster` | 263651125 | 몬스터 정보 |
| `MonsterDropGroup` | 2507680096 | 몬스터 드롭 그룹 |
| `MonsterLevelUpStat` | 2728548033 | 몬스터 레벨업 스탯 |
| `MonsterSpawnLevel` | 2079760701 | 몬스터 스폰 레벨 |
| `NaviCollectAndHunt` | 3054967036 | 나비 수집 및 사냥 |
| `NearByArea` | 4056883788 | 인접 지역 정보 |
| `RandomEquipment` | 4166402701 | 랜덤 장비 |
| `RecommendedList` | 1108915132 | 추천 목록 |
| `Season` | 2760050667 | 시즌 정보 |
| `SummonObjectStat` | 3944278954 | 소환 오브젝트 스탯 |
| `TacticalSkillSet` | 953199307 | 전술 스킬 세트 |
| `TacticalSkillSetGroup` | 3588976340 | 전술 스킬 세트 그룹 |
| `Trait` | 2331667808 | 특성 |
| `VFCredit` | 1294098114 | VF 크레딧 |
| `WeaponTypeInfo` | 3837718881 | 무기 타입 정보 |

> 해시값은 게임 업데이트마다 변경될 수 있으므로 캐싱 전략에 활용 가능. 해시가 바뀌면 해당 metaType 데이터를 다시 fetch하는 방식으로 사용.

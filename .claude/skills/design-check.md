---
description: 현재 변경된 코드에서 디자인 토큰 위반 사항을 탐지한다. 하드코딩 색상, 잘못된 spacing 키, 직접 px 값, 토큰 없는 폰트 크기 등을 검사한다. 사용자가 "design-check 해줘" 또는 "디자인 토큰 검사해줘"라고 하면 실행한다.
---

# design-check 스킬

현재 staged 또는 unstaged 변경 파일에서 `@repo/design-system` 토큰 규칙 위반을 탐지한다.

## 1단계 — 검사 대상 파일 수집

```bash
# staged + unstaged 변경 파일 중 .ts/.tsx 파일만
git diff --name-only HEAD -- "*.ts" "*.tsx"
```

변경 파일이 없으면 "검사할 변경 파일이 없습니다"를 출력하고 종료한다.

## 2단계 — 위반 항목 탐지

각 파일을 읽어 아래 규칙을 기준으로 위반을 탐지한다.

### 규칙 1 — 하드코딩 색상 금지

styled-components 블록 안에서 색상 값을 직접 쓰면 위반이다.

탐지 패턴:
- `#` + 3~8자리 hex (`#fff`, `#1a2b3c`, `#ffffff80`)
- `rgb(...)` / `rgba(...)` / `hsl(...)` / `hsla(...)`

허용 예외:
- 주석(`//`, `/* */`) 안의 색상
- `design-system` 토큰 파일 자체 (`packages/design-system/`)
- 도메인 상수 파일 (`*Constants.ts`, `*constants.ts`, `*Colors.ts`) — 단, styled-component 내부가 아닌 경우

### 규칙 2 — 존재하지 않는 spacing 키 사용 금지

`theme.spacing[N]` 또는 `spacing[N]` 형태에서 N이 유효한 키인지 확인한다.

**유효한 키**: `px`, `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, `3.5`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`, `24`

**무효한 키 (위반)**: 위 목록에 없는 모든 숫자 — 예: `7`, `9`, `11`, `13`, `14`, `15`, `17`, `18`, `19`

### 규칙 3 — styled-components 내부 직접 px 값 금지

styled-components 템플릿 리터럴 안에서 토큰 없이 px 값을 직접 쓰면 위반이다.

탐지 패턴: `\d+px` (숫자 + px)

허용 예외:
- `border: 1px solid` — 테두리 두께 1px은 관용적으로 허용
- `border-radius: 0` — 0 단위는 허용
- 인터폴레이션 `${...}` 안에 있는 경우 (이미 토큰 사용 중)
- 주석

### 규칙 4 — 4값 padding 단축속성 + 여러 줄 인터폴레이션 금지

아래 패턴은 styled-components 파서 오류를 일으킨다:

```ts
padding: ${spacing[3]} ${spacing[4]}
  ${spacing[3]} ${spacing[4]};
```

탐지: `padding:` 이후 인터폴레이션이 줄바꿈을 포함하며 4개 이상인 경우.

## 3단계 — 결과 출력

위반이 없으면:
```
✅ 디자인 토큰 위반 없음 (검사 파일: N개)
```

위반이 있으면 파일별로 정리해서 출력한다:

```
⚠️ 디자인 토큰 위반 발견 (N건)

📄 src/features/xxx/components/Foo.tsx
  [규칙1] 줄 42: 하드코딩 색상 — `#1a2b3c`
    → theme.colors.{적절한토큰} 사용 또는 도메인 상수로 분리
  [규칙2] 줄 67: 잘못된 spacing 키 — `spacing[7]`
    → 유효한 키: 6(24px) 또는 8(32px) 중 선택

📄 src/features/yyy/components/Bar.tsx
  [규칙3] 줄 15: 직접 px 값 — `padding: 20px`
    → theme.spacing[5](20px) 사용
```

각 위반에 대해 올바른 토큰 대안을 함께 제시한다.

## 참고 — spacing 토큰 대응표

| 입력한 값 | 대안 토큰 |
|---|---|
| 2px | `spacing[0.5]` |
| 4px | `spacing[1]` |
| 6px | `spacing[1.5]` |
| 8px | `spacing[2]` |
| 10px | `spacing[2.5]` |
| 12px | `spacing[3]` |
| 14px | `spacing[3.5]` |
| 16px | `spacing[4]` |
| 20px | `spacing[5]` |
| 24px | `spacing[6]` |
| 32px | `spacing[8]` |
| 40px | `spacing[10]` |
| 48px | `spacing[12]` |
| 64px | `spacing[16]` |

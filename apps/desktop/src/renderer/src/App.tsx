import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  GlobalStyle,
  Input,
  Spinner,
  Switch,
  Text,
  ThemeProvider,
} from "@repo/ui";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <div
        style={{
          marginBottom: "12px",
          borderBottom: "1px solid #4d4d4d",
          paddingBottom: "8px",
        }}
      >
        <Text variant="h3">{title}</Text>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function App() {
  const [inputValue, setInputValue] = useState("");
  const [switchOn, setSwitchOn] = useState(false);
  const [notifyOn, setNotifyOn] = useState(true);

  return (
    <ThemeProvider>
      <GlobalStyle />
      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px" }}>
          <Text variant="h1">UI Component Gallery</Text>
          <Text variant="body" color="secondary">
            @repo/ui 패키지 컴포넌트 목록
          </Text>
        </div>

        {/* Text */}
        <Section title="Text">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              width: "100%",
            }}
          >
            <Text variant="h1">Heading 1</Text>
            <Text variant="h2">Heading 2</Text>
            <Text variant="h3">Heading 3</Text>
            <Text variant="body">
              Body — 서비스를 구성하는 일반 본문 텍스트입니다.
            </Text>
            <Text variant="caption" color="secondary">
              Caption — 보조 설명이나 날짜 등 부가 정보에 사용합니다.
            </Text>
            <Text variant="small" color="tertiary">
              Small — 매우 작은 힌트 텍스트입니다.
            </Text>
            <Text variant="body" color="brand">
              Brand color text
            </Text>
          </div>
        </Section>

        {/* Button */}
        <Section title="Button">
          <Button variant="pill">Pill</Button>
          <Button variant="pillDark">Pill Dark</Button>
          <Button variant="pillLight">Pill Light</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="circular">+</Button>
          <Button variant="pill" disabled>
            Disabled
          </Button>
        </Section>

        {/* Input */}
        <Section title="Input">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
              maxWidth: "360px",
            }}
          >
            <Input
              id="search"
              label="검색"
              placeholder="아티스트, 앨범, 트랙 검색..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              id="email"
              label="이메일"
              type="email"
              placeholder="name@example.com"
              error="올바른 이메일 형식이 아닙니다."
            />
            <Input
              id="disabled"
              label="비활성화"
              placeholder="수정 불가"
              disabled
            />
          </div>
        </Section>

        {/* Badge */}
        <Section title="Badge">
          <Badge>Default</Badge>
          <Badge variant="positive">Active</Badge>
          <Badge variant="negative">Error</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">New</Badge>
        </Section>

        {/* Avatar */}
        <Section title="Avatar">
          <Avatar size="sm" name="John Doe" />
          <Avatar size="md" name="John Doe" />
          <Avatar size="lg" name="John Doe" />
          <Avatar size="md" name="Alice Kim" />
          <Avatar size="md" />
        </Section>

        {/* Card */}
        <Section title="Card">
          <Card style={{ width: "200px" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Text variant="h3">앨범 제목</Text>
              <Text variant="caption" color="secondary">
                아티스트 이름 · 2024
              </Text>
              <Badge variant="positive">신보</Badge>
            </div>
          </Card>
          <Card style={{ width: "200px" }} onClick={() => alert("카드 클릭!")}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Text variant="h3">클릭 가능한 카드</Text>
              <Text variant="caption" color="secondary">
                hover 시 배경색 변경
              </Text>
            </div>
          </Card>
        </Section>

        {/* Spinner */}
        <Section title="Spinner">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Section>

        {/* Switch */}
        <Section title="Switch">
          <Switch checked={switchOn} onChange={setSwitchOn} label="자동 재생" />
          <Switch checked={notifyOn} onChange={setNotifyOn} label="알림 받기" />
          <Switch
            checked={false}
            onChange={() => {}}
            disabled
            label="비활성화"
          />
        </Section>

        {/* Composed Example */}
        <Section title="조합 예시 — 프로필 카드">
          <Card style={{ width: "100%", maxWidth: "360px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <Avatar size="lg" name="Park Jisoo" />
              <div>
                <Text variant="h3">Park Jisoo</Text>
                <Text variant="caption" color="secondary">
                  프리미엄 구독자
                </Text>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge variant="positive">Premium</Badge>
              </div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Switch
                checked={notifyOn}
                onChange={setNotifyOn}
                label="이메일 알림"
              />
              <Switch
                checked={switchOn}
                onChange={setSwitchOn}
                label="고음질 스트리밍"
              />
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <Button variant="pill">프로필 편집</Button>
              <Button variant="outlined">로그아웃</Button>
            </div>
          </Card>
        </Section>
      </div>
    </ThemeProvider>
  );
}

export default App;

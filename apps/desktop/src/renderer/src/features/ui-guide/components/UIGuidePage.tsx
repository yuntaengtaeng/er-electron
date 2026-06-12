import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Spinner,
  Switch,
  Text,
} from "@repo/ui";

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[10]};
  max-width: 800px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[12]};
`;

const SectionWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[10]};
`;

const SectionTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  padding-bottom: ${({ theme }) => theme.spacing[2]};
`;

const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
`;

const TextStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
`;

const InputStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  width: 100%;
  max-width: 360px;
`;

const DemoCard = styled(Card)`
  width: 200px;
`;

const ProfileCard = styled(Card)`
  width: 100%;
  max-width: 360px;
`;

const ProfileCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ProfileCardMeta = styled.div`
  margin-left: auto;
`;

const SwitchStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SectionWrapper>
      <SectionTitle>
        <Text variant="h3">{title}</Text>
      </SectionTitle>
      <SectionContent>{children}</SectionContent>
    </SectionWrapper>
  );
}

export default function UIGuidePage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [switchOn, setSwitchOn] = useState(false);
  const [notifyOn, setNotifyOn] = useState(true);

  return (
    <PageWrapper>
      <PageHeader>
        <Button variant="outlined" onClick={() => navigate(-1)}>← 돌아가기</Button>
        <div>
          <Text variant="h1">UI Component Gallery</Text>
          <Text variant="body" color="secondary">@repo/ui 패키지 컴포넌트 목록</Text>
        </div>
      </PageHeader>

      <Section title="Text">
        <TextStack>
          <Text variant="h1">Heading 1</Text>
          <Text variant="h2">Heading 2</Text>
          <Text variant="h3">Heading 3</Text>
          <Text variant="body">Body — 서비스를 구성하는 일반 본문 텍스트입니다.</Text>
          <Text variant="caption" color="secondary">Caption — 보조 설명이나 날짜 등 부가 정보에 사용합니다.</Text>
          <Text variant="small" color="tertiary">Small — 매우 작은 힌트 텍스트입니다.</Text>
          <Text variant="body" color="brand">Brand color text</Text>
        </TextStack>
      </Section>

      <Section title="Button">
        <Button variant="pill">Pill</Button>
        <Button variant="pillDark">Pill Dark</Button>
        <Button variant="pillLight">Pill Light</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="circular">+</Button>
        <Button variant="pill" disabled>Disabled</Button>
      </Section>

      <Section title="Input">
        <InputStack>
          <Input id="search" label="검색" placeholder="아티스트, 앨범, 트랙 검색..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <Input id="email" label="이메일" type="email" placeholder="name@example.com" error="올바른 이메일 형식이 아닙니다." />
          <Input id="disabled" label="비활성화" placeholder="수정 불가" disabled />
        </InputStack>
      </Section>

      <Section title="Badge">
        <Badge>Default</Badge>
        <Badge variant="positive">Active</Badge>
        <Badge variant="negative">Error</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="info">New</Badge>
      </Section>

      <Section title="Avatar">
        <Avatar size="sm" name="John Doe" />
        <Avatar size="md" name="John Doe" />
        <Avatar size="lg" name="John Doe" />
        <Avatar size="md" name="Alice Kim" />
        <Avatar size="md" />
      </Section>

      <Section title="Card">
        <DemoCard>
          <Text variant="h3">앨범 제목</Text>
          <Text variant="caption" color="secondary">아티스트 이름 · 2024</Text>
          <Badge variant="positive">신보</Badge>
        </DemoCard>
        <DemoCard onClick={() => alert("카드 클릭!")}>
          <Text variant="h3">클릭 가능한 카드</Text>
          <Text variant="caption" color="secondary">hover 시 배경색 변경</Text>
        </DemoCard>
      </Section>

      <Section title="Spinner">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </Section>

      <Section title="Switch">
        <Switch checked={switchOn} onChange={setSwitchOn} label="자동 재생" />
        <Switch checked={notifyOn} onChange={setNotifyOn} label="알림 받기" />
        <Switch checked={false} onChange={() => {}} disabled label="비활성화" />
      </Section>

      <Section title="조합 예시 — 프로필 카드">
        <ProfileCard>
          <ProfileCardHeader>
            <Avatar size="lg" name="Park Jisoo" />
            <div>
              <Text variant="h3">Park Jisoo</Text>
              <Text variant="caption" color="secondary">프리미엄 구독자</Text>
            </div>
            <ProfileCardMeta>
              <Badge variant="positive">Premium</Badge>
            </ProfileCardMeta>
          </ProfileCardHeader>
          <SwitchStack>
            <Switch checked={notifyOn} onChange={setNotifyOn} label="이메일 알림" />
            <Switch checked={switchOn} onChange={setSwitchOn} label="고음질 스트리밍" />
          </SwitchStack>
          <ButtonRow>
            <Button variant="pill">프로필 편집</Button>
            <Button variant="outlined">로그아웃</Button>
          </ButtonRow>
        </ProfileCard>
      </Section>
    </PageWrapper>
  );
}

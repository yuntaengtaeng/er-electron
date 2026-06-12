import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Avatar, Badge, Button, Card, Text } from "@repo/ui";

/* ── 게임 전용 상수 (디자인시스템 미포함 영역) ── */
const TIER_COLORS: Record<string, string> = {
  레전드: "#FFD700",
  그랜드마스터: "#FF6B6B",
  마스터: "#CE93D8",
  다이아몬드: "#4FC3F7",
  플래티넘: "#4DB6AC",
};
const RANK_MEDAL_COLORS = [
  "#FFD700",
  "#C0C0C0",
  "#CD7F32",
  "#607D8B",
  "#607D8B",
];

const TOP_RANKERS = [
  {
    rank: 1,
    nickname: "설탈",
    tier: "레전드",
    rating: 9842,
    winRate: 94.2,
    games: 203,
  },
  {
    rank: 2,
    nickname: "히어로빌런",
    tier: "그랜드마스터",
    rating: 8756,
    winRate: 88.7,
    games: 178,
  },
  {
    rank: 3,
    nickname: "화나요",
    tier: "그랜드마스터",
    rating: 8234,
    winRate: 85.3,
    games: 165,
  },
  {
    rank: 4,
    nickname: "난봉꾼",
    tier: "마스터",
    rating: 7654,
    winRate: 82.1,
    games: 234,
  },
  {
    rank: 5,
    nickname: "나는야여름이",
    tier: "마스터",
    rating: 7123,
    winRate: 79.8,
    games: 189,
  },
];

/* ── Styled Components ── */
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.base};
`;

const NavBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing[8]};
  height: 60px;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const Logo = styled.span`
  ${({ theme }) => theme.typography.styles.featureHeading}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.title};
  color: ${({ theme }) => theme.colors.brand.green};
  cursor: pointer;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing[20]};
  padding-right: ${({ theme }) => theme.spacing[8]};
  padding-bottom: ${({ theme }) => theme.spacing[16]};
  padding-left: ${({ theme }) => theme.spacing[8]};
`;

const HeroTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const HeroSubtitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[10]};
`;

const SearchRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  max-width: 460px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.radius.medium};
  border: 2px solid ${({ theme }) => theme.colors.background.elevated};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => theme.typography.styles.body}
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brand.green};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const BrandButton = styled.button`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.radius.medium};
  border: none;
  background-color: ${({ theme }) => theme.colors.brand.green};
  color: ${({ theme }) => theme.colors.text.onGreen};
  ${({ theme }) => theme.typography.styles.bodyBold}
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.88;
  }
`;

const RankSection = styled.section`
  padding-top: 0;
  padding-right: ${({ theme }) => theme.spacing[8]};
  padding-bottom: ${({ theme }) => theme.spacing[20]};
  padding-left: ${({ theme }) => theme.spacing[8]};
  max-width: 1000px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const RankerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const RankerCard = styled(Card)`
  text-align: center;
  cursor: pointer;
`;

const CardInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const RankMedal = styled.span<{ $color: string }>`
  ${({ theme }) => theme.typography.styles.sectionTitle}
  color: ${({ $color }) => $color};
`;

const TierChip = styled.span<{ $tierColor: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing[0.5]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.fullPill};
  border: 1px solid currentColor;
  color: ${({ $tierColor }) => $tierColor};
  ${({ theme }) => theme.typography.styles.badge}
  text-transform: none;
`;

/* ── Component ── */
export default function MainPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const doSearch = () => {
    const trimmed = value.trim();
    if (trimmed) navigate(`/player/${encodeURIComponent(trimmed)}`);
  };

  return (
    <PageWrapper>
      <NavBar>
        <Logo onClick={() => navigate("/")}>ER STATS</Logo>
        <Button variant="outlined" onClick={() => navigate("/ui-guide")}>
          UI 가이드
        </Button>
      </NavBar>

      <HeroSection>
        <HeroTitle>
          <Text variant="h1">이터널 리턴 전적 검색</Text>
        </HeroTitle>
        <HeroSubtitle>
          <Text variant="body" color="secondary">
            실험체의 전적과 통계를 확인하세요
          </Text>
        </HeroSubtitle>
        <SearchRow>
          <SearchInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="닉네임을 입력하세요..."
          />
          <BrandButton onClick={doSearch}>검색</BrandButton>
        </SearchRow>
      </HeroSection>

      <RankSection>
        <SectionHeader>
          <Text variant="h2">상위 랭커</Text>
          <Badge variant="positive">솔로 랭크</Badge>
        </SectionHeader>

        <RankerGrid>
          {TOP_RANKERS.map((r) => (
            <RankerCard
              key={r.rank}
              onClick={() =>
                navigate(`/player/${encodeURIComponent(r.nickname)}`)
              }
            >
              <CardInner>
                <RankMedal $color={RANK_MEDAL_COLORS[r.rank - 1]}>
                  #{r.rank}
                </RankMedal>
                <Avatar size="lg" name={r.nickname} />
                <Text variant="caption" as="span">
                  {r.nickname}
                </Text>
                <TierChip $tierColor={TIER_COLORS[r.tier] ?? "#b3b3b3"}>
                  {r.tier}
                </TierChip>
                <Text variant="small" color="secondary">
                  {r.rating.toLocaleString()} RP
                </Text>
                <Text variant="small" color="secondary">
                  승률 {r.winRate}% · {r.games}판
                </Text>
              </CardInner>
            </RankerCard>
          ))}
        </RankerGrid>
      </RankSection>
    </PageWrapper>
  );
}

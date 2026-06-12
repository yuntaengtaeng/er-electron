import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Avatar, Badge, Button, Card, Text } from "@repo/ui";

/* ── 게임 전용 상수 ── */
const MASTER_TIER_COLOR = "#CE93D8";

interface CharacterStat {
  name: string;
  games: number;
  winRate: number;
  avgPlacement: number;
  avgKills: number;
  avgAssists: number;
}

interface Match {
  timeAgo: string;
  placement: number;
  character: string;
  kills: number;
  assists: number;
  damage: number;
  duration: string;
}

const CHARACTERS: CharacterStat[] = [
  {
    name: "아이솔",
    games: 45,
    winRate: 82.2,
    avgPlacement: 1.4,
    avgKills: 9.2,
    avgAssists: 3.8,
  },
  {
    name: "에이든",
    games: 30,
    winRate: 73.3,
    avgPlacement: 1.8,
    avgKills: 7.8,
    avgAssists: 4.1,
  },
  {
    name: "피오나",
    games: 25,
    winRate: 68.0,
    avgPlacement: 2.1,
    avgKills: 6.5,
    avgAssists: 5.2,
  },
  {
    name: "재키",
    games: 18,
    winRate: 55.6,
    avgPlacement: 2.8,
    avgKills: 5.4,
    avgAssists: 4.7,
  },
  {
    name: "루시아",
    games: 12,
    winRate: 58.3,
    avgPlacement: 2.4,
    avgKills: 6.1,
    avgAssists: 5.9,
  },
];

const MATCHES: Match[] = [
  {
    timeAgo: "5분 전",
    placement: 1,
    character: "아이솔",
    kills: 12,
    assists: 3,
    damage: 45234,
    duration: "28:45",
  },
  {
    timeAgo: "32분 전",
    placement: 2,
    character: "에이든",
    kills: 8,
    assists: 5,
    damage: 38123,
    duration: "22:30",
  },
  {
    timeAgo: "1시간 전",
    placement: 1,
    character: "아이솔",
    kills: 15,
    assists: 2,
    damage: 52456,
    duration: "31:20",
  },
  {
    timeAgo: "2시간 전",
    placement: 4,
    character: "피오나",
    kills: 3,
    assists: 6,
    damage: 21345,
    duration: "15:42",
  },
  {
    timeAgo: "3시간 전",
    placement: 1,
    character: "아이솔",
    kills: 11,
    assists: 4,
    damage: 41789,
    duration: "26:15",
  },
  {
    timeAgo: "5시간 전",
    placement: 3,
    character: "에이든",
    kills: 7,
    assists: 7,
    damage: 35678,
    duration: "20:10",
  },
  {
    timeAgo: "어제",
    placement: 1,
    character: "아이솔",
    kills: 13,
    assists: 1,
    damage: 48923,
    duration: "29:45",
  },
  {
    timeAgo: "어제",
    placement: 2,
    character: "피오나",
    kills: 6,
    assists: 8,
    damage: 29456,
    duration: "18:30",
  },
  {
    timeAgo: "어제",
    placement: 1,
    character: "에이든",
    kills: 10,
    assists: 3,
    damage: 43210,
    duration: "27:00",
  },
  {
    timeAgo: "2일 전",
    placement: 5,
    character: "재키",
    kills: 2,
    assists: 4,
    damage: 18567,
    duration: "12:30",
  },
];

const TABS = ["전체", "솔로 랭크", "듀오 랭크", "스쿼드"];

/* ── Styled Components ── */
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.base};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: 0 ${({ theme }) => theme.spacing[6]};
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
  margin-right: ${({ theme }) => theme.spacing[1]};
`;

const TopSearchRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex: 1;
  max-width: 420px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => theme.typography.styles.caption}
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brand.green};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const BrandButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  border: none;
  background-color: ${({ theme }) => theme.colors.brand.green};
  color: ${({ theme }) => theme.colors.text.onGreen};
  ${({ theme }) => theme.typography.styles.navBold}
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.88;
  }
`;

const ContentWrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding-top: 0;
  padding-right: ${({ theme }) => theme.spacing[6]};
  padding-bottom: ${({ theme }) => theme.spacing[16]};
  padding-left: ${({ theme }) => theme.spacing[6]};
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing[8]};
  padding-right: 0;
  padding-bottom: ${({ theme }) => theme.spacing[6]};
  padding-left: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  gap: ${({ theme }) => theme.spacing[5]};
`;

const ProfileLeft = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[5]};
  align-items: flex-start;
`;

const AvatarRing = styled.div`
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.radius.circle};
  border: 2px solid ${MASTER_TIER_COLOR};
  overflow: hidden;
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TierRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`;

const TierChip = styled.span<{ $tierColor: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing[0.5]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid currentColor;
  color: ${({ $tierColor }) => $tierColor};
  ${({ theme }) => theme.typography.styles.captionBold}
`;

const RecordRow = styled.div`
  ${({ theme }) => theme.typography.styles.caption}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PositiveText = styled.span`
  color: ${({ theme }) => theme.colors.brand.green};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const NegativeText = styled.span`
  color: ${({ theme }) => theme.colors.semantic.negative};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const PrimaryText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const WinRateSection = styled.div`
  padding: ${({ theme }) => theme.spacing[5]} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const WinRateBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[1.5]};
`;

const WinRateBarTrack = styled.div`
  flex: 1;
  height: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radius.fullPill};
  background-color: ${({ theme }) => `${theme.colors.semantic.negative}25`};
  overflow: hidden;
`;

const WinRateBarFill = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.fullPill};
  background-color: ${({ theme }) => theme.colors.brand.green};
  transition: width 0.4s ease;
`;

const WinRateLabels = styled.div`
  display: flex;
  justify-content: space-between;
  ${({ theme }) => theme.typography.styles.small}
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const StatCell = styled.div<{ $bordered?: boolean }>`
  padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[4]};
  text-align: center;
  border-left: ${({ theme, $bordered }) =>
    $bordered ? `1px solid ${theme.colors.border.subtle}` : "none"};
`;

const StatValue = styled.div`
  ${({ theme }) => theme.typography.styles.featureHeading}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.title};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border: none;
  border-bottom: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.brand.green : "transparent")};
  background-color: transparent;
  ${({ theme, $active }) =>
    $active ? theme.typography.styles.navBold : theme.typography.styles.nav}
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  cursor: pointer;
  transition: color 0.15s;
`;

const SectionLabel = styled.p`
  ${({ theme }) => theme.typography.styles.smallBold}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing[4]};
  text-transform: ${({ theme }) => theme.typography.textTransform.uppercase};
  letter-spacing: 0.6px;
`;

const CharacterRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const CharacterCard = styled(Card)`
  flex: 0 0 auto;
  width: 140px;
  text-align: center;
`;

const CharacterCardInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CharIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radius.circle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border: 2px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.typography.styles.captionBold}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const WinRateHighlight = styled.div`
  ${({ theme }) => theme.typography.styles.featureHeading}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.title};
  color: ${({ theme }) => theme.colors.brand.green};
`;

const MatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const MatchRow = styled.div<{ $placement: number }>`
  display: grid;
  grid-template-columns: 80px 90px 1fr 130px 100px 72px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  border-left: 3px solid
    ${({ theme, $placement }) => {
      if ($placement === 1) return theme.colors.brand.green;
      if ($placement <= 3) return theme.colors.semantic.warning;
      return theme.colors.semantic.negative;
    }};
  background-color: ${({ theme, $placement }) => {
    const color =
      $placement === 1
        ? theme.colors.brand.green
        : $placement <= 3
          ? theme.colors.semantic.warning
          : theme.colors.semantic.negative;
    return `${color}12`;
  }};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[4]};
  ${({ theme }) => theme.typography.styles.caption}
`;

const PlacementText = styled.span<{ $placement: number }>`
  ${({ theme }) => theme.typography.styles.featureHeading}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.title};
  color: ${({ theme, $placement }) => {
    if ($placement === 1) return theme.colors.brand.green;
    if ($placement <= 3) return theme.colors.semantic.warning;
    return theme.colors.semantic.negative;
  }};
`;

const PlacementCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const CharacterCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const CharIconSmall = styled.div`
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radius.standard};
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
  flex-shrink: 0;
`;

const SecondaryCell = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TimeCell = styled.div`
  ${({ theme }) => theme.typography.styles.small}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AlignRight = styled.div`
  ${({ theme }) => theme.typography.styles.small}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: right;
`;

/* ── Component ── */
export default function PlayerPage() {
  const { nickname: rawNickname } = useParams<{ nickname: string }>();
  const nickname = decodeURIComponent(rawNickname ?? "");
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(nickname);
  const [activeTab, setActiveTab] = useState(0);

  const doSearch = () => {
    const trimmed = searchValue.trim();
    if (trimmed) navigate(`/player/${encodeURIComponent(trimmed)}`);
  };

  const wins = MATCHES.filter((m) => m.placement === 1).length;
  const losses = MATCHES.length - wins;
  const winRate = ((wins / MATCHES.length) * 100).toFixed(1);
  const avgKills = (
    MATCHES.reduce((s, m) => s + m.kills, 0) / MATCHES.length
  ).toFixed(1);
  const avgAssists = (
    MATCHES.reduce((s, m) => s + m.assists, 0) / MATCHES.length
  ).toFixed(1);
  const avgDamage = Math.round(
    MATCHES.reduce((s, m) => s + m.damage, 0) / MATCHES.length,
  );
  const avgPlacement = (
    MATCHES.reduce((s, m) => s + m.placement, 0) / MATCHES.length
  ).toFixed(1);

  return (
    <PageWrapper>
      {/* Top Bar */}
      <TopBar>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← 뒤로
        </Button>
        <Logo onClick={() => navigate("/")}>ER STATS</Logo>
        <TopSearchRow>
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
          />
          <BrandButton onClick={doSearch}>검색</BrandButton>
        </TopSearchRow>
      </TopBar>

      <ContentWrapper>
        {/* Profile */}
        <ProfileSection>
          <ProfileLeft>
            <AvatarRing>
              <Avatar size="lg" name={nickname} />
            </AvatarRing>
            <ProfileInfo>
              <Text variant="h1" as="h1">
                {nickname}
              </Text>
              <TierRow>
                <TierChip $tierColor={MASTER_TIER_COLOR}>마스터</TierChip>
                <Text variant="caption" color="secondary">
                  7,654 RP
                </Text>
                <Text variant="caption" color="secondary">
                  ·
                </Text>
                <Text variant="caption" color="secondary">
                  시즌 랭킹 #1,234위
                </Text>
              </TierRow>
              <RecordRow>
                최근 {MATCHES.length}게임 <PositiveText>{wins}승</PositiveText>{" "}
                <NegativeText>{losses}패</NegativeText>
                {"  ·  "}
                <PrimaryText>{winRate}%</PrimaryText> 승률
              </RecordRow>
            </ProfileInfo>
          </ProfileLeft>
          <Button variant="outlined">업데이트</Button>
        </ProfileSection>

        {/* Win Rate Bar */}
        <WinRateSection>
          <WinRateBarRow>
            <PositiveText>{winRate}%</PositiveText>
            <WinRateBarTrack>
              <WinRateBarFill $pct={parseFloat(winRate)} />
            </WinRateBarTrack>
            <NegativeText>
              {(100 - parseFloat(winRate)).toFixed(1)}%
            </NegativeText>
          </WinRateBarRow>
          <WinRateLabels>
            <PositiveText>{wins}승</PositiveText>
            <NegativeText>{losses}패</NegativeText>
          </WinRateLabels>
        </WinRateSection>

        {/* Stats */}
        <StatsGrid>
          {[
            { label: "평균 순위", value: `${avgPlacement}위` },
            { label: "평균 킬", value: `${avgKills}킬` },
            { label: "평균 도움", value: `${avgAssists}도움` },
            { label: "평균 피해", value: avgDamage.toLocaleString() },
          ].map((stat, i) => (
            <StatCell key={stat.label} $bordered={i > 0}>
              <StatValue>{stat.value}</StatValue>
              <Text variant="small" color="secondary">
                {stat.label}
              </Text>
            </StatCell>
          ))}
        </StatsGrid>

        {/* Tabs */}
        <TabBar>
          {TABS.map((tab, i) => (
            <TabButton
              key={tab}
              $active={activeTab === i}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </TabButton>
          ))}
        </TabBar>

        {/* Characters */}
        <SectionLabel>많이 쓴 실험체</SectionLabel>
        <CharacterRow>
          {CHARACTERS.map((char) => (
            <CharacterCard key={char.name}>
              <CharacterCardInner>
                <CharIcon>{char.name.slice(0, 2)}</CharIcon>
                <Text variant="caption" as="span">
                  {char.name}
                </Text>
                <WinRateHighlight>{char.winRate}%</WinRateHighlight>
                <Text variant="small" color="secondary">
                  {char.games}판 · 평균 {char.avgPlacement}위
                </Text>
                <Text variant="small" color="secondary">
                  {char.avgKills}킬 {char.avgAssists}도움
                </Text>
              </CharacterCardInner>
            </CharacterCard>
          ))}
        </CharacterRow>

        {/* Matches */}
        <SectionLabel>최근 전적</SectionLabel>
        <MatchList>
          {MATCHES.map((match, i) => (
            <MatchRow key={i} $placement={match.placement}>
              <TimeCell>{match.timeAgo}</TimeCell>

              <PlacementCell>
                <PlacementText $placement={match.placement}>
                  {match.placement}위
                </PlacementText>
                {match.placement === 1 && <Badge variant="positive">WIN</Badge>}
              </PlacementCell>

              <CharacterCell>
                <CharIconSmall>{match.character.slice(0, 2)}</CharIconSmall>
                <Text variant="caption" as="span">
                  {match.character}
                </Text>
              </CharacterCell>

              <SecondaryCell>
                <PrimaryText>{match.kills}킬</PrimaryText>
                {" / "}
                {match.assists}도움
              </SecondaryCell>

              <AlignRight>{match.damage.toLocaleString()}</AlignRight>
              <AlignRight>{match.duration}</AlignRight>
            </MatchRow>
          ))}
        </MatchList>
      </ContentWrapper>
    </PageWrapper>
  );
}

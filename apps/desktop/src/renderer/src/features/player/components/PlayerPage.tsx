import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled, { css } from "styled-components";
import { Button, Text } from "@repo/ui";
import {
  CURRENT_SEASON_ID,
  getMemberByNickname,
  upsertMember,
} from "@repo/service";
import { usePlayerData } from "../hooks/usePlayerData";
import { PlayerProfile } from "./PlayerProfile";
import { ProfileStats } from "./ProfileStats";
import { TopCharacters } from "./TopCharacters";
import { MatchHistory } from "./MatchHistory";
import { Loading } from "../../../shared/components/Loading";

export type RegistrationState =
  | "idle"
  | "checking"
  | "registering"
  | "registered"
  | "unregistered";

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
  ${({ theme }) => css(theme.typography.styles.featureHeading)}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.title};
  color: ${({ theme }) => theme.colors.brand.green};
  cursor: pointer;
  margin-right: ${({ theme }) => theme.spacing[1]};
`;

const SearchRow = styled.div`
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
  ${({ theme }) => css(theme.typography.styles.caption)}
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brand.green};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SearchButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  border: none;
  background-color: ${({ theme }) => theme.colors.brand.green};
  color: ${({ theme }) => theme.colors.text.onGreen};
  ${({ theme }) => css(theme.typography.styles.navBold)}
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.88;
  }
`;

const ContentWrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]}
    ${({ theme }) => theme.spacing[16]} 0;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[6]} 0;
`;

const PageButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => css(theme.typography.styles.caption)}
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.brand.green};
    color: ${({ theme }) => theme.colors.brand.green};
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const PageLabel = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 60px;
  text-align: center;
`;

export default function PlayerPage() {
  const { nickname: rawNickname } = useParams<{ nickname: string }>();
  const nickname = decodeURIComponent(rawNickname ?? "");
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(nickname);

  const {
    games,
    stats,
    loading,
    error,
    wins,
    losses,
    winRate,
    topCharacters,
    page,
    hasPrev,
    hasNext,
    goNext,
    goPrev,
    refresh,
  } = usePlayerData(nickname);

  const [registrationState, setRegistrationState] =
    useState<RegistrationState>("idle");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!nickname) {
      setRegistrationState("idle");
      setLastUpdatedAt(null);
      return;
    }
    setRegistrationState("checking");
    getMemberByNickname(nickname)
      .then((member) => {
        setRegistrationState(member ? "registered" : "unregistered");
        setLastUpdatedAt(member?.updatedAt ?? null);
      })
      .catch(() => setRegistrationState("unregistered"));
  }, [nickname]);

  const handleRegister = async () => {
    if (!stats) return;
    setRegistrationState("registering");
    try {
      await upsertMember({
        nickname,
        mmr: stats.mmr,
        rank: stats.rank,
        rankPercent: stats.rankPercent,
        seasonId: CURRENT_SEASON_ID,
        representativeCharacterCode: topCharacters[0]?.characterCode ?? null,
      });
      setRegistrationState("registered");
      getMemberByNickname(nickname)
        .then((member) => setLastUpdatedAt(member?.updatedAt ?? null))
        .catch(() => {});
    } catch {
      setRegistrationState("unregistered");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const freshStats = await refresh();
      if (registrationState === "registered" && freshStats) {
        const freshTopCharCode =
          [...freshStats.characterStats].sort(
            (a, b) => b.totalGames - a.totalGames,
          )[0]?.characterCode ?? null;
        await upsertMember({
          nickname,
          mmr: freshStats.mmr,
          rank: freshStats.rank,
          rankPercent: freshStats.rankPercent,
          seasonId: CURRENT_SEASON_ID,
          representativeCharacterCode: freshTopCharCode,
        });
        getMemberByNickname(nickname)
          .then((member) => setLastUpdatedAt(member?.updatedAt ?? null))
          .catch(() => {});
      }
    } catch {
      // 갱신 실패는 조용히 처리
    } finally {
      setIsRefreshing(false);
    }
  };

  const doSearch = () => {
    const trimmed = searchValue.trim();
    if (trimmed) navigate(`/player/${encodeURIComponent(trimmed)}`);
  };

  return (
    <PageWrapper>
      <TopBar>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← 뒤로
        </Button>
        <Logo onClick={() => navigate("/")}>ER STATS</Logo>
        <SearchRow>
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
          />
          <SearchButton onClick={doSearch}>검색</SearchButton>
        </SearchRow>
      </TopBar>

      <ContentWrapper>
        {loading && <Loading />}
        {error && (
          <Text variant="body" color="secondary">
            {error}
          </Text>
        )}

        {!loading && !error && (
          <>
            <PlayerProfile
              nickname={nickname}
              stats={stats}
              wins={wins}
              losses={losses}
              winRate={winRate}
              gamesCount={games.length}
              topCharacter={topCharacters[0] ?? null}
              registrationState={registrationState}
              lastUpdatedAt={lastUpdatedAt}
              isRefreshing={isRefreshing}
              onRegister={handleRegister}
              onRefresh={handleRefresh}
            />
            <ProfileStats stats={stats} />
            <TopCharacters characterStats={topCharacters} />
            <MatchHistory games={games} />
            <Pagination>
              <PageButton onClick={goPrev} disabled={!hasPrev}>
                ← 이전
              </PageButton>
              <PageLabel>{page + 1} 페이지</PageLabel>
              <PageButton onClick={goNext} disabled={!hasNext}>
                다음 →
              </PageButton>
            </Pagination>
          </>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
}

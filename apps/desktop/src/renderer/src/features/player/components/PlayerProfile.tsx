import type { CharacterStat, UserStats } from "@repo/er-type";
import styled, { css } from "styled-components";
import { Button, Spinner, Text } from "@repo/ui";
import {
  getCharacterById,
  getTierByMmr,
  normalizeImageUrl,
} from "../../../shared/utils/meta";
import { getTierColor } from "../../../shared/constants/tierColors";
import { timeAgo } from "../../../shared/utils/format";
import type { RegistrationState } from "./PlayerPage";

// ─── styled ───────────────────────────────────────────────────────────────────
const Section = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing[8]};
  padding-bottom: ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  gap: ${({ theme }) => theme.spacing[5]};
`;

const Left = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[5]};
  align-items: flex-start;
`;

const CharPortraitRing = styled.div<{ $tierColor: string }>`
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.radius.circle};
  border: 2.5px solid ${({ $tierColor }) => $tierColor};
  overflow: hidden;
  flex-shrink: 0;
`;

const CharPortraitImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CharPortraitFallback = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.background.elevated};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TierRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TierIcon = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
`;

const TierInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TierName = styled.span<{ $tierColor: string }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ $tierColor }) => $tierColor};
`;

const RankText = styled.span`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const RecordRow = styled.div`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Positive = styled.span`
  color: ${({ theme }) => theme.colors.brand.green};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const Negative = styled.span`
  color: ${({ theme }) => theme.colors.semantic.negative};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const Primary = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const UpdatedText = styled.span`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

// ─── component ────────────────────────────────────────────────────────────────
interface Props {
  nickname: string;
  stats: UserStats | null;
  wins: number;
  losses: number;
  winRate: string;
  gamesCount: number;
  topCharacter: CharacterStat | null;
  registrationState: RegistrationState;
  lastUpdatedAt: string | null;
  isRefreshing: boolean;
  onRegister: () => void;
  onRefresh: () => void;
}

export function PlayerProfile({
  nickname,
  stats,
  wins,
  losses,
  winRate,
  gamesCount,
  topCharacter,
  registrationState,
  lastUpdatedAt,
  isRefreshing,
  onRegister,
  onRefresh,
}: Props) {
  const topChar = topCharacter
    ? getCharacterById(topCharacter.characterCode)
    : null;
  const tier = stats ? getTierByMmr(stats.mmr) : null;
  const color = getTierColor(tier?.key);

  return (
    <Section>
      <Left>
        <CharPortraitRing $tierColor={color}>
          {topChar ? (
            <CharPortraitImg
              src={normalizeImageUrl(topChar.imageUrl)}
              alt={topChar.name}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <CharPortraitFallback>
              {nickname[0]?.toUpperCase()}
            </CharPortraitFallback>
          )}
        </CharPortraitRing>

        <Info>
          <Text variant="h1" as="h1">
            {nickname}
          </Text>

          {stats && tier && (
            <TierRow>
              <TierIcon
                src={normalizeImageUrl(tier.iconUrl)}
                alt={tier.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <TierInfo>
                <TierName $tierColor={color}>
                  {tier.name}&nbsp;&nbsp;{stats.mmr.toLocaleString()} RP
                </TierName>
                <RankText>
                  #{stats.rank.toLocaleString()}위
                  {stats.rankPercent > 0 &&
                    ` (상위 ${stats.rankPercent.toFixed(2)}%)`}
                </RankText>
              </TierInfo>
            </TierRow>
          )}

          <RecordRow>
            최근 {gamesCount}게임 <Positive>{wins}승</Positive>{" "}
            <Negative>{losses}패</Negative>
            {"  ·  "}
            <Primary>{winRate}%</Primary> 승률
          </RecordRow>
        </Info>
      </Left>

      <ActionGroup>
        {(registrationState === "checking" ||
          registrationState === "registering") && <Spinner size="sm" />}
        {(registrationState === "unregistered" ||
          registrationState === "registering") && (
          <Button
            variant="pill"
            onClick={onRegister}
            disabled={registrationState === "registering"}
          >
            {registrationState === "registering" ? "등록 중..." : "등록하기"}
          </Button>
        )}
        <Button variant="outlined" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? "갱신 중..." : "갱신하기"}
        </Button>
        {lastUpdatedAt && (
          <UpdatedText>갱신 {timeAgo(lastUpdatedAt)}</UpdatedText>
        )}
      </ActionGroup>
    </Section>
  );
}

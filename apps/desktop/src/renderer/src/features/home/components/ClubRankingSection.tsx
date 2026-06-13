import type { ClubMember } from "@repo/service";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { Avatar, Badge, Card, Text } from "@repo/ui";
import { getCharacterById, getTierByMmr, normalizeImageUrl } from "../../../shared/utils/meta";
import { getTierColor } from "../../../shared/constants/tierColors";

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

// Display order: [2nd, 1st, 3rd] left → center → right
// paddingTop controls card height → with align-items:flex-end, taller = higher peak
const PODIUM_LAYOUT = [
  { rankIdx: 1, paddingTop: 36 },
  { rankIdx: 0, paddingTop: 56 },
  { rankIdx: 2, paddingTop: 16 },
] as const;

// ─── styled ───────────────────────────────────────────────────────────────────

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const PodiumWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const PodiumCard = styled(Card)<{ $tierColor: string; $paddingTop: number }>`
  flex: 0 1 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ $paddingTop }) => $paddingTop}px
    ${({ theme }) => theme.spacing[4]}
    ${({ theme }) => theme.spacing[5]};
  border-top: 3px solid ${({ $tierColor }) => $tierColor};
  cursor: pointer;
  text-align: center;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }
`;

const MedalText = styled.span<{ $color: string }>`
  ${({ theme }) => css(theme.typography.styles.sectionTitle)}
  color: ${({ $color }) => $color};
`;

const TierLabel = styled.span<{ $color: string }>`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ $color }) => $color};
`;

const MmrText = styled.span`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ListCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const ListRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  cursor: pointer;
  transition: background-color 0.15s;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const RankNum = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.tertiary};
  min-width: 28px;
  text-align: center;
`;

const RowInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const RowNickname = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowTier = styled.span<{ $color: string }>`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ $color }) => $color};
`;

const RowMmr = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
`;

const MoreButton = styled.button`
  display: block;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]} 0;
  background: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  color: ${({ theme }) => theme.colors.text.secondary};
  ${({ theme }) => css(theme.typography.styles.caption)}
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brand.green};
    color: ${({ theme }) => theme.colors.brand.green};
  }
`;

// ─── component ────────────────────────────────────────────────────────────────

interface Props {
  members: ClubMember[];
}

function getCharImg(member: ClubMember): string | undefined {
  if (!member.representativeCharacterCode) return undefined;
  const char = getCharacterById(member.representativeCharacterCode);
  return char?.imageUrl ? normalizeImageUrl(char.imageUrl) : undefined;
}

export function ClubRankingSection({ members }: Props) {
  const navigate = useNavigate();
  const top3 = members.slice(0, 3);
  const rest = members.slice(3, 9);

  const goToPlayer = (nickname: string) =>
    navigate(`/player/${encodeURIComponent(nickname)}`);

  return (
    <section>
      <SectionHeader>
        <Text variant="h2">종겜동 랭킹</Text>
        <Badge variant="positive">솔로 랭크</Badge>
      </SectionHeader>

      <PodiumWrapper>
        {PODIUM_LAYOUT.map(({ rankIdx, paddingTop }) => {
          const member = top3[rankIdx];
          if (!member) return null;
          const rank = rankIdx + 1;
          const tier = getTierByMmr(member.mmr);
          const tierColor = getTierColor(tier?.key);
          return (
            <PodiumCard
              key={member.userId}
              $tierColor={tierColor}
              $paddingTop={paddingTop}
              onClick={() => goToPlayer(member.nickname)}
            >
              <MedalText $color={MEDAL_COLORS[rankIdx]}>#{rank}</MedalText>
              <Avatar
                size={rank === 1 ? "lg" : "md"}
                src={getCharImg(member)}
                name={member.nickname}
              />
              <Text variant="caption" as="span">{member.nickname}</Text>
              <TierLabel $color={tierColor}>{tier?.name ?? "Unrank"}</TierLabel>
              <MmrText>{member.mmr.toLocaleString()} RP</MmrText>
            </PodiumCard>
          );
        })}
      </PodiumWrapper>

      {rest.length > 0 && (
        <ListCard>
          {rest.map((member, i) => {
            const rank = i + 4;
            const tier = getTierByMmr(member.mmr);
            const tierColor = getTierColor(tier?.key);
            return (
              <ListRow key={member.userId} onClick={() => goToPlayer(member.nickname)}>
                <RankNum>#{rank}</RankNum>
                <Avatar size="sm" src={getCharImg(member)} name={member.nickname} />
                <RowInfo>
                  <RowNickname>{member.nickname}</RowNickname>
                  <RowTier $color={tierColor}>{tier?.name ?? "Unrank"}</RowTier>
                </RowInfo>
                <RowMmr>{member.mmr.toLocaleString()} RP</RowMmr>
              </ListRow>
            );
          })}
        </ListCard>
      )}

      <MoreButton onClick={() => navigate("/ranking")}>
        랭킹 전체 보기 →
      </MoreButton>
    </section>
  );
}

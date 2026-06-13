import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { Avatar, Badge, Card, Text } from "@repo/ui";
import { getCharacterById, getTierByMmr, normalizeImageUrl } from "../../../shared/utils/meta";
import { getTierColor } from "../../../shared/constants/tierColors";
import type { ClubMember } from "@repo/service";
import { useRankingMembers } from "../hooks/useRankingMembers";

const MEDAL_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

// ─── styled ───────────────────────────────────────────────────────────────────

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
`;

const BackButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => css(theme.typography.styles.caption)}
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brand.green};
  }
`;

const ContentWrapper = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]}
    ${({ theme }) => theme.spacing[16]};
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const RankListCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const RankRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
  cursor: pointer;
  transition: background-color 0.15s;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const RankNum = styled.span<{ $color?: string }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ $color, theme }) => $color ?? theme.colors.text.tertiary};
  min-width: 36px;
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
  ${({ theme }) => css(theme.typography.styles.bodyBold)}
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

const EmptyText = styled.div`
  ${({ theme }) => css(theme.typography.styles.body)}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing[16]} 0;
`;

// ─── helpers ─────────────────────────────────────────────────────────────────

function getCharImg(member: ClubMember): string | undefined {
  if (!member.representativeCharacterCode) return undefined;
  const char = getCharacterById(member.representativeCharacterCode);
  return char?.imageUrl ? normalizeImageUrl(char.imageUrl) : undefined;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function RankingPage() {
  const navigate = useNavigate();
  const members = useRankingMembers();

  return (
    <PageWrapper>
      <TopBar>
        <BackButton onClick={() => navigate(-1)}>← 뒤로</BackButton>
        <Logo onClick={() => navigate("/")}>ER STATS</Logo>
      </TopBar>

      <ContentWrapper>
        <PageHeader>
          <Text variant="h1">종겜동 랭킹</Text>
          <Badge variant="positive">솔로 랭크</Badge>
        </PageHeader>

        {members.length === 0 ? (
          <EmptyText>등록된 멤버가 없습니다.</EmptyText>
        ) : (
          <RankListCard>
            {members.map((member, i) => {
              const rank = i + 1;
              const tier = getTierByMmr(member.mmr);
              const tierColor = getTierColor(tier?.key);
              const medalColor = MEDAL_COLORS[rank];
              return (
                <RankRow
                  key={member.userId}
                  onClick={() =>
                    navigate(`/player/${encodeURIComponent(member.nickname)}`)
                  }
                >
                  <RankNum $color={medalColor}>#{rank}</RankNum>
                  <Avatar size="md" src={getCharImg(member)} name={member.nickname} />
                  <RowInfo>
                    <RowNickname>{member.nickname}</RowNickname>
                    <RowTier $color={tierColor}>{tier?.name ?? "Unrank"}</RowTier>
                  </RowInfo>
                  <RowMmr>{member.mmr.toLocaleString()} RP</RowMmr>
                </RankRow>
              );
            })}
          </RankListCard>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
}

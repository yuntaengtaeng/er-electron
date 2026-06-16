import styled from "styled-components";
import { Text } from "@repo/ui";
import type { PhaseCombatResult } from "@repo/service";
import { formatDuration } from "../../../shared/utils/format";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface Props {
  data: PhaseCombatResult;
}

export const PhaseSummarySection = ({ data }: Props) => {
  const { gamesAnalyzed, winCount, avgPlayTime } = data;
  const winRate = gamesAnalyzed ? Math.round((winCount / gamesAnalyzed) * 100) : 0;

  return (
    <Wrapper>
      <Text variant="bodyBold">분석 요약</Text>
      <CardGrid>
        <StatCard>
          <Text variant="caption" color="secondary">분석 게임</Text>
          <Text variant="h2">{gamesAnalyzed}게임</Text>
          <Text variant="caption" color="secondary">최근 랭크</Text>
        </StatCard>
        <StatCard>
          <Text variant="caption" color="secondary">승률</Text>
          <Text variant="h2">{winRate}%</Text>
          <Text variant="caption" color="secondary">{winCount}승 {gamesAnalyzed - winCount}패</Text>
        </StatCard>
        <StatCard>
          <Text variant="caption" color="secondary">평균 생존 시간</Text>
          <Text variant="h2">{formatDuration(Math.round(avgPlayTime))}</Text>
          <Text variant="caption" color="secondary">분:초</Text>
        </StatCard>
      </CardGrid>
    </Wrapper>
  );
};

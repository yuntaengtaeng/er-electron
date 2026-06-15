import { useMemo } from "react";
import styled, { css } from "styled-components";
import { Text } from "@repo/ui";
import type { GameDetail } from "@repo/service";

const avgOf = (games: GameDetail[], fn: (g: GameDetail) => number) =>
  games.length ? games.reduce((a, g) => a + fn(g), 0) / games.length : 0;

const medianSplit = (
  games: GameDetail[],
  fn: (g: GameDetail) => number,
): { high: GameDetail[]; low: GameDetail[] } => {
  const sorted = [...games].sort((a, b) => fn(a) - fn(b));
  const mid = Math.ceil(sorted.length / 2);
  return { low: sorted.slice(0, mid), high: sorted.slice(mid) };
};

const boolSplit = (
  games: GameDetail[],
  fn: (g: GameDetail) => boolean,
): { yes: GameDetail[]; no: GameDetail[] } => ({
  yes: games.filter(fn),
  no: games.filter((g) => !fn(g)),
});

const Wrapper = styled.div``;

const SectionTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const CardHeading = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const BarGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const BarGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const BarLabelRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const BarValueGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing[1]};
  flex-shrink: 0;
`;

const BarTrack = styled.div`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number; $highlight: boolean }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background-color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.brand.green : theme.colors.border.subtle};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const DeltaBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[3]};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.radius.subtle};
`;

const DeltaArrow = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.brand.green};
`;

const DeltaValue = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.primary};
`;

interface InsightCardProps {
  title: string;
  leftLabel: string;
  leftNum: number;
  leftCount: number;
  rightLabel: string;
  rightNum: number;
  rightCount: number;
  format: (n: number) => string;
  valueSuffix: string;
  higherIsBetter: boolean;
  deltaSuffix: string;
}

const InsightCard = ({
  title,
  leftLabel,
  leftNum,
  leftCount,
  rightLabel,
  rightNum,
  rightCount,
  format,
  valueSuffix,
  higherIsBetter,
  deltaSuffix,
}: InsightCardProps) => {
  const hasBoth = leftCount > 0 && rightCount > 0;

  const leftWins =
    hasBoth && (higherIsBetter ? leftNum > rightNum : leftNum < rightNum);
  const rightWins =
    hasBoth && (higherIsBetter ? rightNum > leftNum : rightNum < leftNum);

  const maxVal = Math.max(leftNum, rightNum, 0.001);
  const minVal = hasBoth ? Math.min(leftNum, rightNum) : 0;

  const barPct = (val: number, count: number): number => {
    if (count === 0) return 0;
    if (!hasBoth) return 100;
    if (higherIsBetter) return (val / maxVal) * 100;
    // 등수: 낮을수록 좋음 → 낮은 값이 더 긴 바
    return val > 0 ? (minVal / val) * 100 : 0;
  };

  const delta = Math.abs(leftNum - rightNum);

  return (
    <Card>
      <CardHeading>
        <Text variant="captionBold" color="secondary">
          {title}
        </Text>
      </CardHeading>

      <BarGroups>
        <BarGroup>
          <BarLabelRow>
            <Text variant="caption" color={leftWins ? undefined : "secondary"}>
              {leftLabel}
            </Text>
            {leftCount > 0 ? (
              <BarValueGroup>
                <Text variant={leftWins ? "bodyBold" : "body"}>
                  {format(leftNum)}{valueSuffix}
                </Text>
                <Text variant="caption" color="secondary">
                  {leftCount}판
                </Text>
              </BarValueGroup>
            ) : (
              <Text variant="caption" color="secondary">
                -
              </Text>
            )}
          </BarLabelRow>
          <BarTrack>
            <BarFill $pct={barPct(leftNum, leftCount)} $highlight={leftWins} />
          </BarTrack>
        </BarGroup>

        <BarGroup>
          <BarLabelRow>
            <Text variant="caption" color={rightWins ? undefined : "secondary"}>
              {rightLabel}
            </Text>
            {rightCount > 0 ? (
              <BarValueGroup>
                <Text variant={rightWins ? "bodyBold" : "body"}>
                  {format(rightNum)}{valueSuffix}
                </Text>
                <Text variant="caption" color="secondary">
                  {rightCount}판
                </Text>
              </BarValueGroup>
            ) : (
              <Text variant="caption" color="secondary">
                -
              </Text>
            )}
          </BarLabelRow>
          <BarTrack>
            <BarFill
              $pct={barPct(rightNum, rightCount)}
              $highlight={rightWins}
            />
          </BarTrack>
        </BarGroup>
      </BarGroups>

      {hasBoth && delta > 0.05 && (
        <DeltaBadge>
          <DeltaArrow>▲</DeltaArrow>
          <DeltaValue>
            {format(delta)}
            {deltaSuffix} 차이
          </DeltaValue>
        </DeltaBadge>
      )}
    </Card>
  );
};

interface Props {
  games: GameDetail[];
}

export const VisionInsightSection = ({ games }: Props) => {
  const { viewSplit, batSplit, droneSplit, consoleSplit } = useMemo(() => {
    const viewSplit = medianSplit(games, (g) => g.viewContribution);
    const batSplit = medianSplit(games, (g) => g.batKills + g.mutantBatKills);
    const droneSplit = boolSplit(games, (g) => g.cameraFromDrone > 0);
    const consoleSplit = boolSplit(games, (g) => g.cameraFromConsole > 0);
    return { viewSplit, batSplit, droneSplit, consoleSplit };
  }, [games]);

  return (
    <Wrapper>
      <SectionTitle>
        <Text variant="bodyBold">시야 점수 상관 분석</Text>
      </SectionTitle>
      <Grid>
        <InsightCard
          title="시야 점수가 높으면 등수도 좋을까?"
          leftLabel="시야 높은 게임"
          leftNum={avgOf(viewSplit.high, (g) => g.gameRank)}
          leftCount={viewSplit.high.length}
          rightLabel="시야 낮은 게임"
          rightNum={avgOf(viewSplit.low, (g) => g.gameRank)}
          rightCount={viewSplit.low.length}
          format={(n) => n.toFixed(1)}
          valueSuffix="등"
          higherIsBetter={false}
          deltaSuffix="위"
        />
        <InsightCard
          title="박쥐를 많이 잡으면 시야 점수가 높을까?"
          leftLabel="박쥐 많이 잡은 게임"
          leftNum={avgOf(batSplit.high, (g) => g.viewContribution)}
          leftCount={batSplit.high.length}
          rightLabel="박쥐 적게 잡은 게임"
          rightNum={avgOf(batSplit.low, (g) => g.viewContribution)}
          rightCount={batSplit.low.length}
          format={(n) => Math.round(n).toLocaleString()}
          valueSuffix="점"
          higherIsBetter={true}
          deltaSuffix="점"
        />
        <InsightCard
          title="드론으로 망원 카메라를 사면 등수가 좋을까?"
          leftLabel="드론으로 구매한 게임"
          leftNum={avgOf(droneSplit.yes, (g) => g.gameRank)}
          leftCount={droneSplit.yes.length}
          rightLabel="드론으로 안 산 게임"
          rightNum={avgOf(droneSplit.no, (g) => g.gameRank)}
          rightCount={droneSplit.no.length}
          format={(n) => n.toFixed(1)}
          valueSuffix="등"
          higherIsBetter={false}
          deltaSuffix="위"
        />
        <InsightCard
          title="콘솔로 망원 카메라를 사면 등수가 좋을까?"
          leftLabel="콘솔로 구매한 게임"
          leftNum={avgOf(consoleSplit.yes, (g) => g.gameRank)}
          leftCount={consoleSplit.yes.length}
          rightLabel="콘솔로 안 산 게임"
          rightNum={avgOf(consoleSplit.no, (g) => g.gameRank)}
          rightCount={consoleSplit.no.length}
          format={(n) => n.toFixed(1)}
          valueSuffix="등"
          higherIsBetter={false}
          deltaSuffix="위"
        />
      </Grid>
    </Wrapper>
  );
};

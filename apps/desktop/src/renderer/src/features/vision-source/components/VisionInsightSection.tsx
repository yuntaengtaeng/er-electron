import { useMemo } from "react";
import styled, { css } from "styled-components";
import { Text } from "@repo/ui";
import type { GameDetail } from "@repo/service";
import {
  avgOf,
  computeVisionInsights,
  visionPerMin,
  type VisionInsightData,
} from "../utils/visionAnalytics";

const Wrapper = styled.div``;

const SectionTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
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

const LegendRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const LegendSwatch = styled.div<{ $variant: "player" | "ranker" }>`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background-color: ${({ theme, $variant }) =>
    $variant === "player" ? theme.colors.brand.green : theme.colors.border.subtle};
`;

const GroupBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.radius.subtle};
`;

const GroupTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CompareRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
`;

const OverlayTrack = styled.div`
  position: relative;
  height: 22px;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: 4px;
`;

const OVERLAY_BAR_H = 10;
const OVERLAY_GAP = 2;

const OverlayBarFill = styled.div<{
  $pct: number;
  $top: number;
  $variant: "player" | "ranker";
  $zIndex: number;
}>`
  position: absolute;
  left: 0;
  top: ${({ $top }) => $top}px;
  width: ${({ $pct }) => $pct}%;
  height: ${OVERLAY_BAR_H}px;
  z-index: ${({ $zIndex }) => $zIndex};
  background-color: ${({ theme, $variant }) =>
    $variant === "player" ? theme.colors.brand.green : theme.colors.border.subtle};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ValueCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 72px;
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

const SoloBarTrack = styled.div`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: 4px;
  overflow: hidden;
`;

const SoloBarFill = styled.div<{ $pct: number; $highlight: boolean }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background-color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.brand.green : theme.colors.border.subtle};
  border-radius: 4px;
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

type InsightPair = {
  leftLabel: string;
  leftNum: number;
  leftCount: number;
  rightLabel: string;
  rightNum: number;
  rightCount: number;
};

type InsightCardConfig = {
  title: string;
  player: InsightPair;
  ranker?: InsightPair;
  format: (n: number) => string;
  valueSuffix: string;
  higherIsBetter: boolean;
  deltaSuffix: string;
};

const toBarPct = (
  val: number,
  count: number,
  allValues: number[],
  higherIsBetter: boolean,
): number => {
  if (count === 0 || val <= 0) return 0;
  const maxVal = Math.max(...allValues, 0.001);
  const minVal = Math.min(...allValues.filter((v) => v > 0), maxVal);
  if (higherIsBetter) return (val / maxVal) * 100;
  return (minVal / val) * 100;
};

const OverlayCompareBar = ({
  playerVal,
  playerCount,
  rankerVal,
  rankerCount,
  playerPct,
  rankerPct,
  format,
  suffix,
}: {
  playerVal: number;
  playerCount: number;
  rankerVal: number;
  rankerCount: number;
  playerPct: number;
  rankerPct: number;
  format: (n: number) => string;
  suffix: string;
}) => {
  const hasPlayer = playerCount > 0;
  const hasRanker = rankerCount > 0;
  const rankerTop = OVERLAY_BAR_H + OVERLAY_GAP;

  return (
    <CompareRow>
      <OverlayTrack>
        {hasRanker && (
          <OverlayBarFill
            $pct={rankerPct}
            $top={rankerTop}
            $variant="ranker"
            $zIndex={1}
          />
        )}
        {hasPlayer && (
          <OverlayBarFill
            $pct={playerPct}
            $top={0}
            $variant="player"
            $zIndex={2}
          />
        )}
      </OverlayTrack>
      <ValueCol>
        {hasPlayer ? (
          <Text variant="captionBold">
            내 {format(playerVal)}{suffix}
            <Text as="span" variant="caption" color="secondary">
              {" "}· {playerCount}판
            </Text>
          </Text>
        ) : (
          <Text variant="caption" color="secondary">내 -</Text>
        )}
        {hasRanker ? (
          <Text variant="captionBold" color="secondary">
            랭커 {format(rankerVal)}{suffix}
            <Text as="span" variant="caption" color="secondary">
              {" "}· {rankerCount}판
            </Text>
          </Text>
        ) : (
          <Text variant="caption" color="secondary">랭커 -</Text>
        )}
      </ValueCol>
    </CompareRow>
  );
};

const ComparisonInsightCard = ({
  title,
  player,
  ranker,
  format,
  valueSuffix,
  higherIsBetter,
}: InsightCardConfig) => {
  const allValues = [
    player.leftNum,
    player.rightNum,
    ranker?.leftNum ?? 0,
    ranker?.rightNum ?? 0,
  ].filter((v) => v > 0);

  const groups = [
    {
      title: player.leftLabel,
      playerVal: player.leftNum,
      playerCount: player.leftCount,
      rankerVal: ranker?.leftNum ?? 0,
      rankerCount: ranker?.leftCount ?? 0,
    },
    {
      title: player.rightLabel,
      playerVal: player.rightNum,
      playerCount: player.rightCount,
      rankerVal: ranker?.rightNum ?? 0,
      rankerCount: ranker?.rightCount ?? 0,
    },
  ];

  return (
    <Card>
      <CardHeading>
        <Text variant="captionBold" color="secondary">{title}</Text>
      </CardHeading>

      <LegendRow>
        <LegendItem>
          <LegendSwatch $variant="player" />
          <Text variant="caption" color="secondary">내 평균</Text>
        </LegendItem>
        <LegendItem>
          <LegendSwatch $variant="ranker" />
          <Text variant="caption" color="secondary">랭커 평균</Text>
        </LegendItem>
      </LegendRow>

      {groups.map((group) => (
        <GroupBlock key={group.title}>
          <GroupTitle>
            <Text variant="captionBold">{group.title}</Text>
          </GroupTitle>
          {ranker && (
            <OverlayCompareBar
              playerVal={group.playerVal}
              playerCount={group.playerCount}
              rankerVal={group.rankerVal}
              rankerCount={group.rankerCount}
              playerPct={toBarPct(group.playerVal, group.playerCount, allValues, higherIsBetter)}
              rankerPct={toBarPct(group.rankerVal, group.rankerCount, allValues, higherIsBetter)}
              format={format}
              suffix={valueSuffix}
            />
          )}
        </GroupBlock>
      ))}
    </Card>
  );
};

const PlayerOnlyInsightCard = ({
  pair,
  format,
  valueSuffix,
  higherIsBetter,
  deltaSuffix,
}: {
  pair: InsightPair;
  format: (n: number) => string;
  valueSuffix: string;
  higherIsBetter: boolean;
  deltaSuffix: string;
}) => {
  const { leftLabel, leftNum, leftCount, rightLabel, rightNum, rightCount } = pair;
  const hasBoth = leftCount > 0 && rightCount > 0;
  const leftWins =
    hasBoth && (higherIsBetter ? leftNum > rightNum : leftNum < rightNum);
  const rightWins =
    hasBoth && (higherIsBetter ? rightNum > leftNum : rightNum < leftNum);
  const allValues = [leftNum, rightNum].filter((v) => v > 0);

  const barPct = (val: number, count: number) =>
    toBarPct(val, count, allValues, higherIsBetter);

  const delta = Math.abs(leftNum - rightNum);
  const worseVal = higherIsBetter
    ? Math.min(leftNum, rightNum)
    : Math.max(leftNum, rightNum);
  const pct = hasBoth && worseVal > 0 ? Math.round((delta / worseVal) * 100) : 0;

  return (
    <>
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
                <Text variant="caption" color="secondary">{leftCount}판</Text>
              </BarValueGroup>
            ) : (
              <Text variant="caption" color="secondary">-</Text>
            )}
          </BarLabelRow>
          <SoloBarTrack>
            <SoloBarFill $pct={barPct(leftNum, leftCount)} $highlight={leftWins} />
          </SoloBarTrack>
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
                <Text variant="caption" color="secondary">{rightCount}판</Text>
              </BarValueGroup>
            ) : (
              <Text variant="caption" color="secondary">-</Text>
            )}
          </BarLabelRow>
          <SoloBarTrack>
            <SoloBarFill $pct={barPct(rightNum, rightCount)} $highlight={rightWins} />
          </SoloBarTrack>
        </BarGroup>
      </BarGroups>
      {hasBoth && delta > 0.05 && (
        <DeltaBadge>
          <DeltaArrow>▲</DeltaArrow>
          <DeltaValue>{format(delta)}{deltaSuffix} 차이</DeltaValue>
          {pct > 0 && <DeltaArrow>· +{pct}%</DeltaArrow>}
        </DeltaBadge>
      )}
    </>
  );
};

const InsightCard = (config: InsightCardConfig) => {
  if (config.ranker) {
    return <ComparisonInsightCard {...config} />;
  }

  return (
    <Card>
      <CardHeading>
        <Text variant="captionBold" color="secondary">{config.title}</Text>
      </CardHeading>
      <PlayerOnlyInsightCard
        pair={config.player}
        format={config.format}
        valueSuffix={config.valueSuffix}
        higherIsBetter={config.higherIsBetter}
        deltaSuffix={config.deltaSuffix}
      />
    </Card>
  );
};

const buildVpmPair = (data: VisionInsightData): InsightPair => ({
  leftLabel: `상위 절반 (${data.avgVpmHigh}점/분)`,
  leftNum: avgOf(data.vpmSplit.high, (g) => g.gameRank),
  leftCount: data.vpmSplit.high.length,
  rightLabel: `하위 절반 (${data.avgVpmLow}점/분)`,
  rightNum: avgOf(data.vpmSplit.low, (g) => g.gameRank),
  rightCount: data.vpmSplit.low.length,
});

const buildBatPair = (data: VisionInsightData): InsightPair => ({
  leftLabel: "박쥐 많이 잡은 게임",
  leftNum: avgOf(data.batSplit.high, visionPerMin),
  leftCount: data.batSplit.high.length,
  rightLabel: "박쥐 적게 잡은 게임",
  rightNum: avgOf(data.batSplit.low, visionPerMin),
  rightCount: data.batSplit.low.length,
});

const buildDronePair = (data: VisionInsightData): InsightPair => ({
  leftLabel: "드론으로 구매한 게임",
  leftNum: avgOf(data.droneSplit.yes, visionPerMin),
  leftCount: data.droneSplit.yes.length,
  rightLabel: "드론으로 안 산 게임",
  rightNum: avgOf(data.droneSplit.no, visionPerMin),
  rightCount: data.droneSplit.no.length,
});

const buildConsolePair = (data: VisionInsightData): InsightPair => ({
  leftLabel: "콘솔로 구매한 게임",
  leftNum: avgOf(data.consoleSplit.yes, visionPerMin),
  leftCount: data.consoleSplit.yes.length,
  rightLabel: "콘솔로 안 산 게임",
  rightNum: avgOf(data.consoleSplit.no, visionPerMin),
  rightCount: data.consoleSplit.no.length,
});

interface Props {
  games: GameDetail[];
  rankerGames?: GameDetail[];
  rankerPeriodLabel?: string;
}

export const VisionInsightSection = ({ games, rankerGames, rankerPeriodLabel }: Props) => {
  const playerInsights = useMemo(() => computeVisionInsights(games), [games]);
  const rankerInsights = useMemo(
    () => (rankerGames && rankerGames.length > 0 ? computeVisionInsights(rankerGames) : null),
    [rankerGames],
  );

  const showRanker = rankerInsights != null;

  const cards: InsightCardConfig[] = [
    {
      title: "분당 시야 점수가 높으면 등수도 좋을까?",
      player: buildVpmPair(playerInsights),
      ranker: rankerInsights ? buildVpmPair(rankerInsights) : undefined,
      format: (n) => n.toFixed(1),
      valueSuffix: "등",
      higherIsBetter: false,
      deltaSuffix: "위",
    },
    {
      title: "박쥐를 많이 잡으면 분당 시야 점수가 높을까?",
      player: buildBatPair(playerInsights),
      ranker: rankerInsights ? buildBatPair(rankerInsights) : undefined,
      format: (n) => n.toFixed(1),
      valueSuffix: "점/분",
      higherIsBetter: true,
      deltaSuffix: "점/분",
    },
    {
      title: "드론으로 망원 카메라를 사면 분당 시야 점수가 높을까?",
      player: buildDronePair(playerInsights),
      ranker: rankerInsights ? buildDronePair(rankerInsights) : undefined,
      format: (n) => n.toFixed(1),
      valueSuffix: "점/분",
      higherIsBetter: true,
      deltaSuffix: "점/분",
    },
    {
      title: "콘솔로 망원 카메라를 사면 분당 시야 점수가 높을까?",
      player: buildConsolePair(playerInsights),
      ranker: rankerInsights ? buildConsolePair(rankerInsights) : undefined,
      format: (n) => n.toFixed(1),
      valueSuffix: "점/분",
      higherIsBetter: true,
      deltaSuffix: "점/분",
    },
  ];

  return (
    <Wrapper>
      <SectionTitle>
        <Text variant="bodyBold">시야 점수 상관 분석</Text>
        {showRanker && rankerPeriodLabel && (
          <Text variant="caption" color="secondary">
            랭커 비교 기준: {rankerPeriodLabel} · 위=내 평균, 아래=랭커 평균
          </Text>
        )}
      </SectionTitle>
      <Grid>
        {cards.map((card) => (
          <InsightCard key={card.title} {...card} />
        ))}
      </Grid>
    </Wrapper>
  );
};

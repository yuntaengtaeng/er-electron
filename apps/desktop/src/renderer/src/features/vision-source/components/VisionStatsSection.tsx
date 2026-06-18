import { useMemo } from "react";
import styled from "styled-components";
import { Text } from "@repo/ui";
import type { GameDetail } from "@repo/service";
import { getCharacterById, normalizeImageUrl } from "../../../shared/utils/meta";
import {
  buildCharacterItems,
  buildPlayTimeItems,
  type VisionBarItem,
} from "../utils/visionAnalytics";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const SectionTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[5]};
`;

const ChartTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const LegendRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
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

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const BarLabel = styled.div<{ $wide?: boolean }>`
  flex-shrink: 0;
  width: ${({ $wide }) => ($wide ? "96px" : "44px")};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  overflow: hidden;
`;

const CharImg = styled.img`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  object-fit: cover;
  flex-shrink: 0;
`;

const BarTrack = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const BarFill = styled.div<{ $pct: number; $variant: "player" | "ranker" }>`
  width: ${({ $pct }) => $pct}%;
  height: 7px;
  background-color: ${({ theme, $variant }) =>
    $variant === "player" ? theme.colors.brand.green : theme.colors.border.subtle};
  border-radius: 3px;
`;

const BarValue = styled.div`
  flex-shrink: 0;
  width: 72px;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CountLabel = styled.div`
  flex-shrink: 0;
  width: 40px;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HorizontalBarChart = ({
  title,
  items,
  showImage,
  showRanker,
}: {
  title: string;
  items: VisionBarItem[];
  showImage?: boolean;
  showRanker?: boolean;
}) => {
  const maxAvg = Math.max(
    ...items.flatMap((i) => [i.avg, i.rankerAvg ?? 0]),
    1,
  );

  return (
    <ChartCard>
      <ChartTitle>
        <Text variant="bodyBold">{title}</Text>
      </ChartTitle>
      {showRanker && (
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
      )}
      {items.map((item) => (
        <BarRow key={item.key}>
          <BarLabel $wide={showImage}>
            {showImage && item.imageUrl && (
              <CharImg src={item.imageUrl} alt={item.label} title={item.label} />
            )}
            <Text variant="caption" color="secondary">
              {item.label}
            </Text>
          </BarLabel>
          <BarTrack>
            {item.count > 0 && (
              <BarFill $pct={(item.avg / maxAvg) * 100} $variant="player" />
            )}
            {showRanker && (item.rankerCount ?? 0) > 0 && (
              <BarFill $pct={((item.rankerAvg ?? 0) / maxAvg) * 100} $variant="ranker" />
            )}
          </BarTrack>
          <BarValue>
            {item.count > 0 ? (
              <Text variant="caption">{Math.round(item.avg).toLocaleString()}</Text>
            ) : (
              <Text variant="caption" color="secondary">-</Text>
            )}
            {showRanker && (
              (item.rankerCount ?? 0) > 0 ? (
                <Text variant="caption" color="secondary">
                  {Math.round(item.rankerAvg ?? 0).toLocaleString()}
                </Text>
              ) : (
                <Text variant="caption" color="secondary">-</Text>
              )
            )}
          </BarValue>
          <CountLabel>
            {item.count > 0 ? (
              <Text variant="caption" color="secondary">{item.count}판</Text>
            ) : (
              <Text variant="caption" color="secondary">-</Text>
            )}
            {showRanker && (
              (item.rankerCount ?? 0) > 0 ? (
                <Text variant="caption" color="secondary">{item.rankerCount}판</Text>
              ) : (
                <Text variant="caption" color="secondary">-</Text>
              )
            )}
          </CountLabel>
        </BarRow>
      ))}
    </ChartCard>
  );
};

interface Props {
  games: GameDetail[];
  rankerGames?: GameDetail[];
  rankerPeriodLabel?: string;
}

export const VisionStatsSection = ({ games, rankerGames, rankerPeriodLabel }: Props) => {
  const showRanker = rankerGames != null && rankerGames.length > 0;

  const playTimeItems = useMemo(
    () => buildPlayTimeItems(games, rankerGames),
    [games, rankerGames],
  );

  const characterItems = useMemo(
    () =>
      buildCharacterItems(
        games,
        (characterNum) => {
          const char = getCharacterById(characterNum);
          return {
            label: char?.name ?? `#${characterNum}`,
            imageUrl: char ? normalizeImageUrl(char.imageUrl) : undefined,
          };
        },
        rankerGames,
      ),
    [games, rankerGames],
  );

  return (
    <Wrapper>
      <SectionTitle>
        <Text variant="bodyBold">생존 시간대별 · 실험체별 분석</Text>
        {showRanker && rankerPeriodLabel && (
          <Text variant="caption" color="secondary">
            랭커 비교 기준: {rankerPeriodLabel}
          </Text>
        )}
      </SectionTitle>
      <Grid>
        <HorizontalBarChart
          title="생존 시간대별 평균 시야 점수"
          items={playTimeItems}
          showRanker={showRanker}
        />
        <HorizontalBarChart
          title="실험체별 평균 시야 점수"
          items={characterItems}
          showImage
          showRanker={showRanker}
        />
      </Grid>
    </Wrapper>
  );
};

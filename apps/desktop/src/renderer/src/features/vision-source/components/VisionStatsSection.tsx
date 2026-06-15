import { useMemo } from "react";
import styled from "styled-components";
import { Text } from "@repo/ui";
import type { GameDetail } from "@repo/service";
import { getCharacterById, normalizeImageUrl } from "../../../shared/utils/meta";

const avg = (nums: number[]) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

const groupBy = (games: GameDetail[], keyFn: (g: GameDetail) => string): Map<string, number[]> => {
  const map = new Map<string, number[]>();
  for (const g of games) {
    const k = keyFn(g);
    const arr = map.get(k) ?? [];
    arr.push(g.viewContribution);
    map.set(k, arr);
  }
  return map;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const SectionTitle = styled.div``;

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
  height: 18px;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: 3px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.brand.green};
  border-radius: 3px;
`;

const BarValue = styled.div`
  flex-shrink: 0;
  width: 48px;
  text-align: right;
`;

const CountLabel = styled.div`
  flex-shrink: 0;
  width: 32px;
  text-align: right;
`;

interface BarItem {
  key: string;
  label: string;
  imageUrl?: string;
  avg: number;
  count: number;
}

const HorizontalBarChart = ({
  title,
  items,
  showImage,
}: {
  title: string;
  items: BarItem[];
  showImage?: boolean;
}) => {
  const maxAvg = Math.max(...items.map((i) => i.avg), 1);
  return (
    <ChartCard>
      <ChartTitle>
        <Text variant="bodyBold">{title}</Text>
      </ChartTitle>
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
            <BarFill $pct={(item.avg / maxAvg) * 100} />
          </BarTrack>
          <BarValue>
            <Text variant="caption">{Math.round(item.avg).toLocaleString()}</Text>
          </BarValue>
          <CountLabel>
            <Text variant="caption" color="secondary">
              {item.count}판
            </Text>
          </CountLabel>
        </BarRow>
      ))}
    </ChartCard>
  );
};

interface Props {
  games: GameDetail[];
}

export const VisionStatsSection = ({ games }: Props) => {
  const rankItems = useMemo((): BarItem[] => {
    const map = groupBy(games, (g) => String(g.gameRank));
    return Array.from(map.entries())
      .map(([key, scores]) => ({
        key,
        label: `${key}등`,
        avg: avg(scores),
        count: scores.length,
      }))
      .sort((a, b) => Number(a.key) - Number(b.key));
  }, [games]);

  const characterItems = useMemo((): BarItem[] => {
    const map = groupBy(games, (g) => String(g.characterNum));
    return Array.from(map.entries())
      .map(([key, scores]) => {
        const char = getCharacterById(Number(key));
        return {
          key,
          label: char?.name ?? `#${key}`,
          imageUrl: char ? normalizeImageUrl(char.imageUrl) : undefined,
          avg: avg(scores),
          count: scores.length,
        };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [games]);

  return (
    <Wrapper>
      <SectionTitle>
        <Text variant="bodyBold">등수별 · 실험체별 분석</Text>
      </SectionTitle>
      <Grid>
        <HorizontalBarChart title="등수별 평균 시야 점수" items={rankItems} />
        <HorizontalBarChart title="실험체별 평균 시야 점수" items={characterItems} showImage />
      </Grid>
    </Wrapper>
  );
};

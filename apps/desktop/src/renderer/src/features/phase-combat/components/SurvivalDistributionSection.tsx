import { useMemo } from "react";
import styled from "styled-components";
import { Text } from "@repo/ui";
import type { CombatGame } from "@repo/service";

const BUCKETS = [
  { label: "3분 미만", min: 0, max: 180 },
  { label: "3~6분", min: 180, max: 360 },
  { label: "6~9분", min: 360, max: 540 },
  { label: "9~12분", min: 540, max: 720 },
  { label: "12~15분", min: 720, max: 900 },
  { label: "15~18분", min: 900, max: 1080 },
  { label: "18~21분", min: 1080, max: 1260 },
  { label: "21~24분", min: 1260, max: 1440 },
  { label: "24분 이상", min: 1440, max: Infinity },
] as const;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[5]};
`;

const CardTitle = styled.div`
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

const BarLabel = styled.div`
  flex-shrink: 0;
  width: 60px;
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

const BarRight = styled.div`
  flex-shrink: 0;
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 80px;
  justify-content: flex-end;
`;

interface Props {
  games: CombatGame[];
}

export const SurvivalDistributionSection = ({ games }: Props) => {
  const items = useMemo(() => {
    const buckets = BUCKETS.map((b, i) => {
      const matched = games.filter(
        (g) => g.playTime >= b.min && g.playTime < b.max,
      );
      const wins = matched.filter((g) => g.gameRank === 1).length;
      return { key: String(i), label: b.label, count: matched.length, wins };
    }).filter((b) => b.count > 0);

    const max = Math.max(...buckets.map((b) => b.count), 1);
    return buckets.map((b) => ({ ...b, pct: (b.count / max) * 100 }));
  }, [games]);

  return (
    <Wrapper>
      <Text variant="bodyBold">생존 시간 분포</Text>
      <Card>
        <CardTitle>
          <Text variant="bodyBold">구간별 게임 수 · 1위 횟수</Text>
        </CardTitle>
        {items.map((item) => (
          <BarRow key={item.key}>
            <BarLabel>
              <Text variant="caption" color="secondary">{item.label}</Text>
            </BarLabel>
            <BarTrack>
              <BarFill $pct={item.pct} />
            </BarTrack>
            <BarRight>
              <Text variant="caption">{item.count}게임</Text>
              <Text variant="caption" color="secondary">{item.wins}승</Text>
            </BarRight>
          </BarRow>
        ))}
      </Card>
    </Wrapper>
  );
};

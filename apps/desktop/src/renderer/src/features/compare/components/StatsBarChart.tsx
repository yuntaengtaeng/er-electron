import styled, { css } from "styled-components";
import type { ComparePlayerStats } from "@repo/service";

const AXES = [
  {
    key: "avgCredit" as const,
    label: "평균 크레딧",
    invert: false,
    format: (v: number) => Math.round(v).toLocaleString(),
  },
  {
    key: "avgRank" as const,
    label: "평균 순위",
    invert: true,
    format: (v: number) => `${v.toFixed(1)}위`,
  },
  {
    key: "avgDamage" as const,
    label: "평균 딜량",
    invert: false,
    format: (v: number) => Math.round(v).toLocaleString(),
  },
  {
    key: "avgVision" as const,
    label: "시야 점수",
    invert: false,
    format: (v: number) => v.toFixed(1),
  },
  {
    key: "avgMonsterKill" as const,
    label: "평균 동물킬",
    invert: false,
    format: (v: number) => v.toFixed(1),
  },
  {
    key: "avgMasteryLevel" as const,
    label: "무기숙련도",
    invert: false,
    format: (v: number) => `Lv.${v.toFixed(1)}`,
  },
];

const PLAYER_COLORS = ["#1ed760", "#539df5", "#ffa42b"] as const;
const BASE_RATIO = 0.65;

const normalizeAxis = (values: number[], invert: boolean): number[] => {
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  if (average === 0) return values.map(() => BASE_RATIO);
  return values.map((v) => {
    const ratio = invert ? (v === 0 ? 0 : average / v) : v / average;
    return Math.min(Math.max(ratio * BASE_RATIO, 0.1), 1.0);
  });
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const StatGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const StatGroupLabel = styled.div`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PlayerBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const PlayerName = styled.span<{ $color: string }>`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ $color }) => $color};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  width: 72px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: 5px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number; $color: string }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background-color: ${({ $color }) => $color};
  border-radius: 5px;
  transition: width 0.3s ease;
`;

const BarValue = styled.span<{ $color: string }>`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ $color }) => $color};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  min-width: 80px;
  text-align: right;
  flex-shrink: 0;
`;

interface Props {
  players: {
    nickname: string;
    stats: ComparePlayerStats;
    colorIndex: number;
  }[];
}

export const StatsBarChart = ({ players }: Props) => {
  const normalizedPerAxis = AXES.map(({ key, invert }) => {
    const rawValues = players.map((p) => p.stats[key]);
    return normalizeAxis(rawValues, invert);
  });

  return (
    <Wrapper>
      {AXES.map(({ key, label, format }, ai) => (
        <StatGroup key={key}>
          <StatGroupLabel>{label}</StatGroupLabel>
          {players.map((player, pi) => {
            const pct = normalizedPerAxis[ai][pi] * 100;
            const color = PLAYER_COLORS[player.colorIndex];
            return (
              <PlayerBarRow key={player.nickname}>
                <PlayerName $color={color}>{player.nickname}</PlayerName>
                <BarTrack>
                  <BarFill $pct={pct} $color={color} />
                </BarTrack>
                <BarValue $color={color}>{format(player.stats[key])}</BarValue>
              </PlayerBarRow>
            );
          })}
        </StatGroup>
      ))}
    </Wrapper>
  );
};

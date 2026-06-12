import type { UserStats } from "@repo/er-type";
import styled, { css } from "styled-components";

// ─── styled ───────────────────────────────────────────────────────────────────
const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[5]} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
`;

const StatItem = styled.div``;

const StatLabel = styled.h4`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 4px;
`;

const BarTrack = styled.div`
  height: 4px;
  border-radius: ${({ theme }) => theme.radius.fullPill};
  background: ${({ theme }) => theme.colors.background.elevated};
  overflow: hidden;
  margin-bottom: 4px;
`;

const BarFill = styled.div<{ $pct: number; $color: "green" | "blue" | "default" }>`
  width: ${({ $pct }) => Math.min($pct, 100)}%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.fullPill};
  background: ${({ theme, $color }) => {
    if ($color === "green") return theme.colors.brand.green;
    if ($color === "blue") return theme.colors.semantic.announcement;
    return theme.colors.text.secondary;
  }};
  transition: width 0.4s ease;
`;

const StatValue = styled.div<{ $color: "green" | "blue" | "default" }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme, $color }) => {
    if ($color === "green") return theme.colors.brand.green;
    if ($color === "blue") return theme.colors.semantic.announcement;
    return theme.colors.text.primary;
  }};
`;

// ─── helpers ─────────────────────────────────────────────────────────────────
function pct(value: number, refMax: number): number {
  if (refMax === 0) return 0;
  return Math.min((value / refMax) * 100, 100);
}

// ─── component ────────────────────────────────────────────────────────────────
interface Props {
  stats: UserStats | null;
}

export function ProfileStats({ stats }: Props) {
  if (!stats || stats.totalGames === 0) return null;

  const g = stats.totalGames;
  const winRate    = (stats.totalWins / g) * 100;
  const avgTK      = stats.totalTeamKills / g;
  // top2 / top3 는 UserStats에서 이미 비율(0~1 소수)로 내려옴
  const top2Rate   = stats.top2 * 100;
  const top3Rate   = stats.top3 * 100;
  const rankBar    = stats.averageRank > 0 ? ((10 - stats.averageRank) / 9) * 100 : 0;

  const items: Array<{
    label: string;
    value: string;
    bar: number;
    color: "green" | "blue" | "default";
  }> = [
    { label: "승률",       value: `${winRate.toFixed(1)}%`,            bar: winRate,                          color: "green"   },
    { label: "평균 TK",    value: avgTK.toFixed(2),                    bar: pct(avgTK, 15),                   color: "default" },
    { label: "게임 수",    value: g.toLocaleString(),                  bar: pct(g, 100),                      color: "default" },
    { label: "평균 킬",    value: stats.averageKills.toFixed(2),       bar: pct(stats.averageKills, 5),       color: "default" },
    { label: "TOP 2",      value: `${top2Rate.toFixed(1)}%`,           bar: top2Rate,                         color: "blue"    },
    { label: "평균 어시",  value: stats.averageAssistants.toFixed(2),  bar: pct(stats.averageAssistants, 8),  color: "default" },
    { label: "TOP 3",      value: `${top3Rate.toFixed(1)}%`,           bar: top3Rate,                         color: "blue"    },
    { label: "평균 순위",  value: `#${stats.averageRank.toFixed(1)}`,  bar: Math.max(rankBar, 0),             color: "default" },
    { label: "평균 동물킬",value: stats.averageHunts.toFixed(1),       bar: pct(stats.averageHunts, 50),      color: "default" },
  ];

  return (
    <Wrapper>
      <Grid>
        {items.map((item) => (
          <StatItem key={item.label}>
            <StatLabel>{item.label}</StatLabel>
            <BarTrack>
              <BarFill $pct={item.bar} $color={item.color} />
            </BarTrack>
            <StatValue $color={item.color}>{item.value}</StatValue>
          </StatItem>
        ))}
      </Grid>
    </Wrapper>
  );
}


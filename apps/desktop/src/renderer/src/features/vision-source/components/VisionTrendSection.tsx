import styled, { useTheme } from "styled-components";
import { Text } from "@repo/ui";
import type { GameDetail } from "@repo/service";

// 1위=금, 2위=은, 3위=동, 나머지=기본 (도메인 전용 색상 상수)
const RANK_DOT_COLORS: Record<string, string> = {
  "1": "#FFD166",
  "2": "#A8B8C8",
  "3": "#C98E5E",
};

const SVG_W = 800;
const SVG_H = 220;
const PAD = { top: 24, right: 20, bottom: 40, left: 72 };

const Wrapper = styled.div``;

const SectionTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[5]};
`;

interface Props {
  games: GameDetail[];
}

export const VisionTrendSection = ({ games }: Props) => {
  const theme = useTheme();

  if (games.length === 0) return null;

  const reversed = [...games].reverse(); // 오래된 게임 → 왼쪽, 최근 → 오른쪽
  const scores = reversed.map((g) => g.viewContribution);
  const n = scores.length;

  const minRaw = Math.min(...scores);
  const maxRaw = Math.max(...scores);
  const range = maxRaw - minRaw || 100;
  const minY = minRaw - range * 0.15;
  const maxY = maxRaw + range * 0.15;

  const innerW = SVG_W - PAD.left - PAD.right;
  const innerH = SVG_H - PAD.top - PAD.bottom;

  const cx = (i: number) =>
    n <= 1 ? PAD.left + innerW / 2 : PAD.left + (i / (n - 1)) * innerW;
  const cy = (v: number) =>
    PAD.top + (1 - (v - minY) / (maxY - minY)) * innerH;

  const pts = reversed.map((g, i) => ({
    x: cx(i),
    y: cy(g.viewContribution),
    score: g.viewContribution,
    rank: g.gameRank,
  }));

  const linePath = pts
    .map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L${pts[n - 1].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)}` +
    ` L${PAD.left.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  const N_TICKS = 3;
  // i=0을 제외해 최하단 tick이 x축 기준선과 겹치는 현상 방지
  const gridTicks = Array.from(
    { length: N_TICKS },
    (_, i) => minY + (maxY - minY) * ((i + 1) / N_TICKS),
  );

  // x축 레이블: 최대 8개 표시
  const xLabelCount = Math.min(n, 8);
  const xLabelIndices = Array.from({ length: xLabelCount }, (_, i) =>
    Math.round((i / (xLabelCount - 1 || 1)) * (n - 1)),
  );

  return (
    <Wrapper>
      <SectionTitle>
        <Text variant="bodyBold">시야 점수 추이</Text>
      </SectionTitle>
      <ChartCard>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: "100%", overflow: "visible" }}
        >
          {/* 수평 그리드 */}
          {gridTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={cy(tick)}
                x2={SVG_W - PAD.right}
                y2={cy(tick)}
                stroke={theme.colors.border.subtle}
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={cy(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill={theme.colors.text.secondary}
              >
                {Math.round(tick).toLocaleString()}
              </text>
            </g>
          ))}

          {/* x축 기준선 */}
          <line
            x1={PAD.left}
            y1={PAD.top + innerH}
            x2={SVG_W - PAD.right}
            y2={PAD.top + innerH}
            stroke={theme.colors.border.subtle}
            strokeWidth="1"
          />

          {/* x축 레이블 */}
          {xLabelIndices.map((idx) => (
            <text
              key={idx}
              x={cx(idx)}
              y={SVG_H - 8}
              textAnchor="middle"
              fontSize="11"
              fill={theme.colors.text.secondary}
            >
              {idx === n - 1 ? "최근" : `${n - idx}판 전`}
            </text>
          ))}

          {/* 면적 채우기 */}
          <path
            d={areaPath}
            fill={theme.colors.brand.green}
            fillOpacity="0.07"
          />

          {/* 선 */}
          <path
            d={linePath}
            fill="none"
            stroke={theme.colors.brand.green}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 점 */}
          {pts.map(({ x, y, score, rank }, i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="5"
              fill={RANK_DOT_COLORS[String(rank)] ?? theme.colors.brand.green}
              stroke={theme.colors.background.surface}
              strokeWidth="2"
            >
              <title>{`${i === n - 1 ? "최근" : `${n - i}판 전`} · ${rank}등 · 시야 ${score.toLocaleString()}`}</title>
            </circle>
          ))}
        </svg>
      </ChartCard>
    </Wrapper>
  );
};

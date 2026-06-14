import type { ComparePlayerStats } from "@repo/service";

const PLAYER_COLORS = ["#1ed760", "#539df5", "#ffa42b"] as const;

const MARGIN = { top: 20, right: 20, bottom: 44, left: 58 };
const SVG_W = 480;
const SVG_H = 230;
const CHART_W = SVG_W - MARGIN.left - MARGIN.right;
const CHART_H = SVG_H - MARGIN.top - MARGIN.bottom;

interface Props {
  players: {
    nickname: string;
    stats: ComparePlayerStats;
    colorIndex: number;
  }[];
}

export const MmrBarChart = ({ players }: Props) => {
  const allPlacements = [
    ...new Set(
      players.flatMap((p) => p.stats.mmrByPlacement.map((m) => m.rank)),
    ),
  ].sort((a, b) => a - b);

  if (!allPlacements.length) return null;

  const allGains = players.flatMap((p) =>
    p.stats.mmrByPlacement.map((m) => m.avgMmrGain),
  );
  const rawMin = Math.min(0, ...allGains);
  const rawMax = Math.max(0, ...allGains);
  const padding = (rawMax - rawMin) * 0.12 || 10;
  const yMin = rawMin - padding;
  const yMax = rawMax + padding;
  const yRange = yMax - yMin;

  const toY = (v: number) => CHART_H - ((v - yMin) / yRange) * CHART_H;
  const zeroY = toY(0);

  const slotW = CHART_W / allPlacements.length;
  const barW = Math.min(18, (slotW / (players.length + 1)) * 0.9);
  const groupW = barW * players.length + 2 * (players.length - 1);

  const yTicks = 5;
  const yTickValues = Array.from(
    { length: yTicks + 1 },
    (_, i) => yMin + (yRange / yTicks) * i,
  );

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W }}
    >
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
        {yTickValues.map((v) => {
          const y = toY(v);
          return (
            <g key={v}>
              <line
                x1={0}
                y1={y}
                x2={CHART_W}
                y2={y}
                stroke="#2a2a2a"
                strokeWidth="1"
              />
              <text
                x={-6}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="10"
                fill="#7c7c7c"
              >
                {Math.round(v)}
              </text>
            </g>
          );
        })}

        <line
          x1={0}
          y1={zeroY}
          x2={CHART_W}
          y2={zeroY}
          stroke="#4d4d4d"
          strokeWidth="1.2"
        />

        {allPlacements.map((placement, pi) => {
          const slotCX = pi * slotW + slotW / 2;
          const groupStartX = slotCX - groupW / 2;

          return (
            <g key={placement}>
              {players.map((player, li) => {
                const found = player.stats.mmrByPlacement.find(
                  (m) => m.rank === placement,
                );
                if (!found) return null;
                const color = PLAYER_COLORS[player.colorIndex];
                const barH = Math.abs(toY(found.avgMmrGain) - zeroY);
                const barX = groupStartX + li * (barW + 2);
                const barY = found.avgMmrGain >= 0 ? zeroY - barH : zeroY;

                return (
                  <g key={player.nickname}>
                    <rect
                      x={barX}
                      y={barY}
                      width={barW}
                      height={barH || 1}
                      fill={color}
                      rx="2"
                    />
                  </g>
                );
              })}

              <text
                x={slotCX}
                y={CHART_H + 12}
                textAnchor="middle"
                fontSize="10"
                fill="#b3b3b3"
              >
                {placement}위
              </text>
            </g>
          );
        })}

        <line
          x1={0}
          y1={0}
          x2={0}
          y2={CHART_H}
          stroke="#4d4d4d"
          strokeWidth="1"
        />

        <text
          x={CHART_W / 2}
          y={CHART_H + 30}
          textAnchor="middle"
          fontSize="11"
          fill="#7c7c7c"
        >
          최종 순위
        </text>

        <text
          x={-CHART_H / 2}
          y={-42}
          textAnchor="middle"
          fontSize="11"
          fill="#7c7c7c"
          transform="rotate(-90)"
        >
          평균 MMR 변화
        </text>
      </g>
    </svg>
  );
};

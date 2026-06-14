import type { ComparePlayerStats } from "@repo/service";

const AXES = [
  { key: "avgCredit" as const, label: "크레딧", invert: false },
  { key: "avgDamage" as const, label: "딜량", invert: false },
  { key: "avgMonsterKill" as const, label: "동물킬", invert: false },
  { key: "avgMasteryLevel" as const, label: "무기숙련도", invert: false },
  { key: "avgVision" as const, label: "시야점수", invert: false },
  { key: "avgRank" as const, label: "평균순위", invert: true },
];

const PLAYER_COLORS = ["#1ed760", "#539df5", "#ffa42b"] as const;

const CX = 160;
const CY = 165;
const R = 105;
const LABEL_R = 136;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1.0];
const BASE_RATIO = 0.65;
const N = AXES.length;

const axisAngle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / N;

const toPoint = (r: number, angle: number) => ({
  x: CX + r * Math.cos(angle),
  y: CY + r * Math.sin(angle),
});

const pointsStr = (pts: { x: number; y: number }[]) =>
  pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

const normalizeAxis = (values: number[], invert: boolean): number[] => {
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  if (average === 0) return values.map(() => BASE_RATIO);
  return values.map((v) => {
    const ratio = invert ? (v === 0 ? 0 : average / v) : v / average;
    return Math.min(Math.max(ratio * BASE_RATIO, 0.1), 1.0);
  });
};

const textAnchor = (
  angle: number,
): "middle" | "start" | "end" | "inherit" | undefined => {
  const cos = Math.cos(angle);
  if (Math.abs(cos) < 0.15) return "middle";
  return cos > 0 ? "start" : "end";
};

const labelDy = (angle: number): string => {
  const sin = Math.sin(angle);
  if (sin < -0.7) return "-0.4em";
  if (sin > 0.7) return "1.1em";
  return "0.35em";
};

interface Props {
  players: {
    nickname: string;
    stats: ComparePlayerStats;
    colorIndex: number;
  }[];
}

export const PentagonChart = ({ players }: Props) => {
  const normalizedValues = AXES.map(({ key, invert }) => {
    const rawValues = players.map((p) => p.stats[key]);
    return normalizeAxis(rawValues, invert);
  });

  const playerPolygons = players.map((player, pi) => {
    const pts = AXES.map((_, ai) => {
      const v = normalizedValues[ai][pi];
      return toPoint(v * R, axisAngle(ai));
    });
    return { player, pts };
  });

  const gridPolygons = GRID_LEVELS.map((level) =>
    AXES.map((_, i) => toPoint(level * R, axisAngle(i))),
  );

  return (
    <svg viewBox="0 0 320 330" width="100%" style={{ maxWidth: 340 }}>
      {gridPolygons.map((pts, gi) => (
        <polygon
          key={gi}
          points={pointsStr(pts)}
          fill="none"
          stroke="#4d4d4d"
          strokeWidth="0.8"
        />
      ))}

      <polygon
        points={pointsStr(
          AXES.map((_, i) => toPoint(BASE_RATIO * R, axisAngle(i))),
        )}
        fill="#7c7c7c"
        fillOpacity="0.07"
        stroke="#7c7c7c"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {AXES.map((_, i) => {
        const outer = toPoint(R, axisAngle(i));
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={outer.x.toFixed(2)}
            y2={outer.y.toFixed(2)}
            stroke="#4d4d4d"
            strokeWidth="0.8"
          />
        );
      })}

      {playerPolygons.map(({ player, pts }) => {
        const color = PLAYER_COLORS[player.colorIndex];
        return (
          <polygon
            key={player.nickname}
            points={pointsStr(pts)}
            fill={color}
            fillOpacity="0.18"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      })}

      {playerPolygons.map(({ player, pts }) => {
        const color = PLAYER_COLORS[player.colorIndex];
        return pts.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill={color} />
        ));
      })}

      {AXES.map(({ label }, i) => {
        const angle = axisAngle(i);
        const pt = toPoint(LABEL_R, angle);
        return (
          <text
            key={i}
            x={pt.x.toFixed(2)}
            y={pt.y.toFixed(2)}
            textAnchor={textAnchor(angle)}
            dy={labelDy(angle)}
            fontSize="11"
            fill="#b3b3b3"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

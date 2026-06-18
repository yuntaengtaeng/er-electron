import { useEffect, useMemo, useState } from "react";
import styled, { css, useTheme } from "styled-components";
import { Text } from "@repo/ui";
import type { CharacterCompareSide, WeaponTypeGroup } from "@repo/service";
import { weaponGroupToCompareSide } from "@repo/service";
import { getItemById, normalizeImageUrl } from "../../../shared/utils/meta";
import { EQUIPMENT_SLOT_LABELS } from "../constants";
import { useCharacterCompare } from "../hooks/useCharacterCompare";

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[4]};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const InputRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`;

const NicknameInput = styled.input`
  flex: 1;
  min-width: 160px;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => css(theme.typography.styles.body)}
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brand.green};
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) =>
    theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid
    ${({ $primary, theme }) =>
      $primary ? theme.colors.brand.green : theme.colors.border.subtle};
  background-color: ${({ $primary, theme }) =>
    $primary ? theme.colors.brand.green : theme.colors.background.elevated};
  color: ${({ $primary, theme }) =>
    $primary ? theme.colors.text.onGreen : theme.colors.text.primary};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MetricTable = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.subtle};
  overflow: hidden;
`;

const MetricHeader = styled.div`
  display: grid;
  grid-template-columns: 88px 1fr 1fr 72px;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetricHeaderDiff = styled.span`
  text-align: right;
`;

const MetricRow = styled.div`
  display: grid;
  grid-template-columns: 88px 1fr 1fr 72px;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const MetricLabel = styled.div`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ValueCell = styled.div`
  ${({ theme }) => css(theme.typography.styles.bodyBold)}
`;

const PlayerValueCell = styled.div<{ $positive: boolean | null }>`
  ${({ theme }) => css(theme.typography.styles.bodyBold)}
  color: ${({ $positive, theme }) => {
    if ($positive === null) return theme.colors.text.primary;
    return $positive
      ? theme.colors.brand.green
      : theme.colors.semantic.negative;
  }};
`;

const DiffCell = styled.div<{ $positive: boolean | null }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  text-align: right;
  color: ${({ $positive, theme }) => {
    if ($positive === null) return theme.colors.text.secondary;
    return $positive
      ? theme.colors.brand.green
      : theme.colors.semantic.negative;
  }};
`;

const MmrSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const MmrLegend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const MmrLegendItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};

  &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background-color: ${({ $color }) => $color};
  }
`;

const MmrChartWrap = styled.div`
  padding: ${({ theme }) => theme.spacing[2]} 0;
`;

const MmrTableWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const ItemDiffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const SlotCard = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`;

const ItemPair = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const ItemSide = styled.div<{ $highlight?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid
    ${({ $highlight, theme }) =>
      $highlight ? theme.colors.brand.green : "transparent"};
`;

const ItemIcon = styled.img`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  flex-shrink: 0;
`;

const EmptyItem = styled.div`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  background-color: ${({ theme }) => theme.colors.background.card};
  flex-shrink: 0;
`;

const ErrorText = styled.div`
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

type MetricDef = {
  key: string;
  label: string;
  format: (side: CharacterCompareSide) => string;
  raw: (side: CharacterCompareSide) => number;
  invert?: boolean;
  formatDiff?: (diff: number) => string;
};

const formatSigned = (diff: number, decimals: number) => {
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(decimals)}`;
};

const formatSignedInt = (diff: number) => {
  const sign = diff > 0 ? "+" : "";
  return `${sign}${Math.round(diff).toLocaleString()}`;
};

const METRICS: MetricDef[] = [
  {
    key: "kda",
    label: "K/D/A",
    format: (s) =>
      `${s.avgKills.toFixed(1)}/${s.avgDeaths.toFixed(1)}/${s.avgAssists.toFixed(1)}`,
    raw: (s) => s.avgKda,
    formatDiff: (d) => formatSigned(d, 2),
  },
  {
    key: "vision",
    label: "시야",
    format: (s) => s.avgVision.toFixed(1),
    raw: (s) => s.avgVision,
    formatDiff: (d) => formatSigned(d, 1),
  },
  {
    key: "credits",
    label: "템 크레딧",
    format: (s) => Math.round(s.avgItemCredits).toLocaleString(),
    raw: (s) => s.avgItemCredits,
    formatDiff: formatSignedInt,
  },
  {
    key: "damage",
    label: "평균 딜량",
    format: (s) => Math.round(s.avgDamage).toLocaleString(),
    raw: (s) => s.avgDamage,
    formatDiff: formatSignedInt,
  },
  {
    key: "rank",
    label: "평균 순위",
    format: (s) => `${s.avgRank.toFixed(1)}위`,
    raw: (s) => s.avgRank,
    invert: true,
    formatDiff: (d) => `${formatSigned(d, 1)}위`,
  },
  {
    key: "winRate",
    label: "승률",
    format: (s) => `${s.winRate.toFixed(1)}%`,
    raw: (s) => s.winRate,
    formatDiff: (d) => `${formatSigned(d, 1)}%`,
  },
];

const playerAdvantage = (ranker: number, player: number, invert?: boolean) => {
  const diff = invert ? ranker - player : player - ranker;
  if (Math.abs(diff) < 0.05) return { diff, positive: null as boolean | null };
  return { diff, positive: diff > 0 };
};

const formatMmrDiff = (diff: number) => {
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}`;
};

const formatMmrValue = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
};

const getMmrPlacements = (
  ranker: CharacterCompareSide,
  player: CharacterCompareSide,
) =>
  [
    ...new Set([
      ...ranker.mmrByPlacement.map((m) => m.rank),
      ...player.mmrByPlacement.map((m) => m.rank),
    ]),
  ].sort((a, b) => a - b);

const CompareMmrChart = ({
  ranker,
  player,
  rankerColor,
  playerColor,
  axisColor,
  labelColor,
  negativeColor,
}: {
  ranker: CharacterCompareSide;
  player: CharacterCompareSide;
  rankerColor: string;
  playerColor: string;
  axisColor: string;
  labelColor: string;
  negativeColor: string;
}) => {
  const placements = getMmrPlacements(ranker, player);

  if (placements.length === 0) return null;

  const allGains = [
    ...ranker.mmrByPlacement.map((m) => m.avgMmrGain),
    ...player.mmrByPlacement.map((m) => m.avgMmrGain),
  ];
  const rawMin = Math.min(0, ...allGains);
  const rawMax = Math.max(0, ...allGains);
  const pad = (rawMax - rawMin) * 0.15 || 10;
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;
  const yRange = yMax - yMin;

  const W = 440;
  const H = 200;
  const margin = { top: 16, right: 16, bottom: 36, left: 48 };
  const chartW = W - margin.left - margin.right;
  const chartH = H - margin.top - margin.bottom;
  const toY = (v: number) => chartH - ((v - yMin) / yRange) * chartH;
  const zeroY = toY(0);
  const slotW = chartW / placements.length;
  const barW = 14;
  const minBarH = 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {rawMin < 0 && (
          <rect
            x={0}
            y={zeroY}
            width={chartW}
            height={chartH - zeroY}
            fill={negativeColor}
            opacity={0.08}
          />
        )}
        <line
          x1={0}
          y1={zeroY}
          x2={chartW}
          y2={zeroY}
          stroke={axisColor}
          strokeWidth="1.5"
        />
        {placements.map((placement, pi) => {
          const cx = pi * slotW + slotW / 2;
          const rankerMmr = ranker.mmrByPlacement.find(
            (m) => m.rank === placement,
          );
          const playerMmr = player.mmrByPlacement.find(
            (m) => m.rank === placement,
          );
          const rv = rankerMmr?.avgMmrGain;
          const pv = playerMmr?.avgMmrGain;

          const sides = [
            { value: rv, color: rankerColor, key: "ranker" },
            { value: pv, color: playerColor, key: "player" },
          ];

          return (
            <g key={placement}>
              {sides.map(({ value, color, key }, li) => {
                if (value == null) return null;
                const barH = Math.max(
                  Math.abs(toY(value) - zeroY),
                  value !== 0 ? minBarH : 1,
                );
                const x = cx - barW - 2 + li * (barW + 4);
                const y = value >= 0 ? zeroY - barH : zeroY;

                return (
                  <rect
                    key={key}
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    fill={color}
                    rx="2"
                  />
                );
              })}
              <text
                x={cx}
                y={chartH + 14}
                textAnchor="middle"
                fontSize="10"
                fill={labelColor}
              >
                {placement}위
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

type Props = {
  characterNum: number;
  activeGroup: WeaponTypeGroup;
};

export const CharacterCompareSection = ({
  characterNum,
  activeGroup,
}: Props) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const { compare, loading, error, playerSide, reset } = useCharacterCompare();

  useEffect(() => {
    reset();
  }, [activeGroup.weaponType, reset]);

  const rankerSide = useMemo(
    () => weaponGroupToCompareSide(activeGroup),
    [activeGroup],
  );

  const handleCompare = () => {
    compare(nickname, characterNum, activeGroup.weaponType);
  };

  const rankerColor = theme.colors.semantic.announcement;
  const playerColor = theme.colors.brand.green;
  const showMmrChart =
    playerSide != null &&
    (rankerSide.mmrByPlacement.length > 0 ||
      playerSide.mmrByPlacement.length > 0);

  const mmrPlacements = useMemo(
    () => (playerSide ? getMmrPlacements(rankerSide, playerSide) : []),
    [rankerSide, playerSide],
  );

  return (
    <Section>
      {!open ? (
        <ActionButton type="button" $primary onClick={() => setOpen(true)}>
          나와 비교하기
        </ActionButton>
      ) : (
        <Card>
          <HeaderRow>
            <Text variant="bodyBold">나와 비교하기</Text>
            <ActionButton
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              닫기
            </ActionButton>
          </HeaderRow>

          <InputRow>
            <NicknameInput
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="내 닉네임"
              onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            />
            <ActionButton
              type="button"
              $primary
              disabled={loading}
              onClick={handleCompare}
            >
              {loading ? "불러오는 중..." : "비교"}
            </ActionButton>
          </InputRow>

          {error && (
            <ErrorText>
              <Text variant="caption" color="secondary">
                {error}
              </Text>
            </ErrorText>
          )}

          {playerSide && (
            <>
              <MetricTable>
                <MetricHeader>
                  <span>항목</span>
                  <span>랭커({rankerSide.games}판)</span>
                  <span>나({playerSide.games}판)</span>
                  <MetricHeaderDiff>차이</MetricHeaderDiff>
                </MetricHeader>
                {METRICS.map((metric) => {
                  const rv = metric.raw(rankerSide);
                  const pv = metric.raw(playerSide);
                  const { diff, positive } = playerAdvantage(
                    rv,
                    pv,
                    metric.invert,
                  );
                  const formatDiff =
                    metric.formatDiff ?? ((d) => formatSigned(d, 1));

                  return (
                    <MetricRow key={metric.key}>
                      <MetricLabel>{metric.label}</MetricLabel>
                      <ValueCell>{metric.format(rankerSide)}</ValueCell>
                      <ValueCell>{metric.format(playerSide)}</ValueCell>
                      <DiffCell $positive={positive}>
                        {formatDiff(diff)}
                      </DiffCell>
                    </MetricRow>
                  );
                })}
              </MetricTable>

              {showMmrChart && (
                <MmrSection>
                  <Text variant="captionBold">순위별 RP 획득</Text>
                  <MmrLegend>
                    <MmrLegendItem $color={rankerColor}>랭커</MmrLegendItem>
                    <MmrLegendItem $color={playerColor}>나</MmrLegendItem>
                  </MmrLegend>
                  <MmrChartWrap>
                    <CompareMmrChart
                      ranker={rankerSide}
                      player={playerSide}
                      rankerColor={rankerColor}
                      playerColor={playerColor}
                      axisColor={theme.colors.border.subtle}
                      labelColor={theme.colors.text.secondary}
                      negativeColor={theme.colors.semantic.negative}
                    />
                  </MmrChartWrap>
                  <MmrTableWrap>
                    <MetricTable>
                      <MetricHeader>
                        <span>순위</span>
                        <span>랭커({rankerSide.games}판)</span>
                        <span>나({playerSide.games}판)</span>
                        <MetricHeaderDiff>차이</MetricHeaderDiff>
                      </MetricHeader>
                      {mmrPlacements.map((placement) => {
                        const rankerMmr = rankerSide.mmrByPlacement.find(
                          (m) => m.rank === placement,
                        );
                        const playerMmr = playerSide.mmrByPlacement.find(
                          (m) => m.rank === placement,
                        );
                        const rv = rankerMmr?.avgMmrGain;
                        const pv = playerMmr?.avgMmrGain;
                        const hasBoth = rv != null && pv != null;
                        const { diff, positive } = hasBoth
                          ? playerAdvantage(rv, pv)
                          : { diff: 0, positive: null };

                        return (
                          <MetricRow key={placement}>
                            <MetricLabel>{placement}위</MetricLabel>
                            <ValueCell>
                              {rv != null ? formatMmrValue(rv) : "-"}
                            </ValueCell>
                            <PlayerValueCell
                              $positive={hasBoth ? positive : null}
                            >
                              {pv != null ? formatMmrValue(pv) : "-"}
                            </PlayerValueCell>
                            <DiffCell $positive={hasBoth ? positive : null}>
                              {hasBoth ? formatMmrDiff(diff) : "-"}
                            </DiffCell>
                          </MetricRow>
                        );
                      })}
                    </MetricTable>
                  </MmrTableWrap>
                </MmrSection>
              )}

              <Text variant="captionBold">선호 아이템 (1픽 기준)</Text>
              <ItemDiffGrid>
                {Object.keys(EQUIPMENT_SLOT_LABELS).map((slot) => {
                  const rankerItem = rankerSide.topItemsBySlot[slot]?.[0];
                  const playerItem = playerSide.topItemsBySlot[slot]?.[0];
                  const different = rankerItem?.itemId !== playerItem?.itemId;
                  const rankerMeta = rankerItem
                    ? getItemById(rankerItem.itemId)
                    : null;
                  const playerMeta = playerItem
                    ? getItemById(playerItem.itemId)
                    : null;

                  return (
                    <SlotCard key={slot}>
                      <Text variant="caption" color="secondary">
                        {EQUIPMENT_SLOT_LABELS[slot]}
                      </Text>
                      <ItemPair>
                        <ItemSide $highlight={different}>
                          {rankerMeta?.imageUrl ? (
                            <ItemIcon
                              src={normalizeImageUrl(rankerMeta.imageUrl)}
                              alt={rankerMeta.name}
                              title={rankerMeta.name}
                            />
                          ) : (
                            <EmptyItem />
                          )}
                          <Text variant="caption" color="secondary">
                            랭커
                          </Text>
                        </ItemSide>
                        <ItemSide $highlight={different}>
                          {playerMeta?.imageUrl ? (
                            <ItemIcon
                              src={normalizeImageUrl(playerMeta.imageUrl)}
                              alt={playerMeta.name}
                              title={playerMeta.name}
                            />
                          ) : (
                            <EmptyItem />
                          )}
                          <Text variant="caption" color="secondary">
                            나
                          </Text>
                        </ItemSide>
                      </ItemPair>
                    </SlotCard>
                  );
                })}
              </ItemDiffGrid>
            </>
          )}
        </Card>
      )}
    </Section>
  );
};

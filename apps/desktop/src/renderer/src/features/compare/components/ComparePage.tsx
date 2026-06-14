import { useState } from "react";
import styled, { css } from "styled-components";
import { Text } from "@repo/ui";
import { useCompareData } from "../hooks/useCompareData";
import { PentagonChart } from "./PentagonChart";
import { MmrBarChart } from "./MmrBarChart";
import { AppHeader } from "../../../shared/components/AppHeader";
import type { ComparePlayerStats } from "@repo/service";

const PLAYER_COLORS = ["#1ed760", "#539df5", "#ffa42b"] as const;

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.base};
`;

const PageContent = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[10]}
    ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[20]};
`;

const SectionTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const InputCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const InputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const InputLabel = styled.label<{ $colorIndex: number }>`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ $colorIndex }) => PLAYER_COLORS[$colorIndex]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  padding-right: ${({ theme }) => theme.spacing[8]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1.5px solid ${({ theme }) => theme.colors.background.elevated};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => css(theme.typography.styles.body)}
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brand.green};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const InlineClearButton = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: ${({ theme }) => theme.spacing[1]};
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.semantic.negative};
  }
`;

const AddOpponentButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1.5px dashed ${({ theme }) => theme.colors.border.subtle};
  background: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  ${({ theme }) => css(theme.typography.styles.body)}
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brand.green};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const PopularSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const PopularLabel = styled.span`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-right: ${({ theme }) => theme.spacing[2]};
`;

const ChipList = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const Chip = styled.button`
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.fullPill};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.text.secondary};
  ${({ theme }) => css(theme.typography.styles.caption)}
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brand.green};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const CompareButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  border: none;
  background-color: ${({ theme }) => theme.colors.brand.green};
  color: ${({ theme }) => theme.colors.text.onGreen};
  ${({ theme }) => css(theme.typography.styles.bodyBold)}
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[8]};
`;

const ResultCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[6]};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const ResultCardTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const ChartRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[8]};
  flex-wrap: wrap;
`;

const ChartWrapper = styled.div`
  flex: 0 0 auto;
`;

const StatsTable = styled.div`
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: 80px repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
`;

const StatLabel = styled.span`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatValue = styled.span<{ $colorIndex: number }>`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ $colorIndex }) => PLAYER_COLORS[$colorIndex]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-align: right;
`;

const Legend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[5]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const LegendName = styled.span`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorText = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing[1]};
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.semantic.negative};
`;

const fmt = (v: number, decimals = 0) => v.toFixed(decimals);

interface StatsRowData {
  label: string;
  getValue: (s: ComparePlayerStats) => string;
}

const STAT_ROWS: StatsRowData[] = [
  { label: "평균 크레딧", getValue: (s) => fmt(s.avgCredit) },
  { label: "평균 순위", getValue: (s) => `${fmt(s.avgRank, 1)}위` },
  { label: "평균 딜량", getValue: (s) => fmt(s.avgDamage) },
  { label: "시야 점수", getValue: (s) => fmt(s.avgVision, 1) },
  { label: "평균 동물킬", getValue: (s) => fmt(s.avgMonsterKill, 1) },
  { label: "무기숙련도", getValue: (s) => `Lv.${fmt(s.avgMasteryLevel, 1)}` },
];

export default function ComparePage() {
  const [selfNickname, setSelfNickname] = useState("");
  const [opponents, setOpponents] = useState<string[]>([]);
  const { results, compare, popularNicknames } = useCompareData();

  const addOpponent = () => setOpponents((prev) => [...prev, ""]);
  const removeOpponent = (i: number) =>
    setOpponents((prev) => prev.filter((_, idx) => idx !== i));
  const setOpponent = (i: number, v: string) =>
    setOpponents((prev) => prev.map((n, idx) => (idx === i ? v : n)));

  const fillSuggestion = (nickname: string) => {
    const emptyIdx = opponents.findIndex((o) => !o.trim());
    if (emptyIdx !== -1) {
      setOpponent(emptyIdx, nickname);
    } else if (opponents.length < 2) {
      setOpponents((prev) => [...prev, nickname]);
    }
  };

  const allNicknames = [selfNickname, opponents[0] ?? "", opponents[1] ?? ""];
  const activeCount = allNicknames.filter((n) => n.trim() !== "").length;
  const isLoading = results.some((r) => r.loading);
  const canCompare = activeCount >= 2 && !isLoading;

  const successResults = results
    .map((r, i) => (r.stats ? { ...r, colorIndex: i } : null))
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const chartPlayers = successResults.map((r) => ({
    nickname: r.stats!.nickname,
    stats: r.stats!,
    colorIndex: r.colorIndex,
  }));

  const showPentagon = chartPlayers.length >= 2;
  const showMmr = chartPlayers.length >= 1;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canCompare) compare(allNicknames);
  };

  return (
    <PageWrapper>
      <AppHeader />

      <PageContent>
        <SectionTitle>
          <Text variant="h2">비교하기</Text>
        </SectionTitle>

        <InputCard>
          <InputGroup>
            <InputLabel $colorIndex={0} htmlFor="nickname-self">
              나
            </InputLabel>
            <InputWrapper>
              <StyledInput
                id="nickname-self"
                value={selfNickname}
                onChange={(e) => setSelfNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="내 닉네임 입력"
              />
              {selfNickname && (
                <InlineClearButton
                  onClick={() => setSelfNickname("")}
                  aria-label="입력 초기화"
                >
                  ×
                </InlineClearButton>
              )}
            </InputWrapper>
            {results[0].error && <ErrorText>{results[0].error}</ErrorText>}
          </InputGroup>

          {opponents.map((opp, i) => (
            <InputGroup key={i}>
              <InputLabel $colorIndex={i + 1} htmlFor={`nickname-opp-${i}`}>
                비교 {i + 1}
              </InputLabel>
              <InputWrapper>
                <StyledInput
                  id={`nickname-opp-${i}`}
                  value={opp}
                  onChange={(e) => setOpponent(i, e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="닉네임 입력"
                />
                <InlineClearButton
                  onClick={() => removeOpponent(i)}
                  aria-label="비교 대상 제거"
                >
                  ×
                </InlineClearButton>
              </InputWrapper>
              {results[i + 1].error && (
                <ErrorText>{results[i + 1].error}</ErrorText>
              )}
            </InputGroup>
          ))}

          {opponents.length < 2 && (
            <AddOpponentButton onClick={addOpponent}>
              + 비교 대상 추가
            </AddOpponentButton>
          )}

          {popularNicknames.length > 0 && (
            <PopularSection>
              <PopularLabel>인기 비교:</PopularLabel>
              <ChipList>
                {popularNicknames.map((n) => (
                  <Chip key={n} onClick={() => fillSuggestion(n)}>
                    {n}
                  </Chip>
                ))}
              </ChipList>
            </PopularSection>
          )}

          <CompareButton
            disabled={!canCompare}
            onClick={() => compare(allNicknames)}
          >
            {isLoading ? "불러오는 중..." : "비교하기"}
          </CompareButton>
        </InputCard>

        {(showPentagon || showMmr) && (
          <ResultsWrapper>
            {showPentagon && (
              <ResultCard>
                <ResultCardTitle>
                  <Text variant="h3">능력치 비교</Text>
                </ResultCardTitle>
                <Legend>
                  {chartPlayers.map((p) => (
                    <LegendItem key={p.nickname}>
                      <LegendDot $color={PLAYER_COLORS[p.colorIndex]} />
                      <LegendName>
                        {p.nickname} ({p.stats.gamesAnalyzed}판)
                      </LegendName>
                    </LegendItem>
                  ))}
                  <LegendItem>
                    <LegendDot $color="#7c7c7c" />
                    <LegendName>평균 (기준선)</LegendName>
                  </LegendItem>
                </Legend>
                <ChartRow>
                  <ChartWrapper>
                    <PentagonChart players={chartPlayers} />
                  </ChartWrapper>
                  <StatsTable>
                    <StatRow>
                      <StatLabel />
                      {chartPlayers.map((p) => (
                        <StatValue key={p.nickname} $colorIndex={p.colorIndex}>
                          {p.nickname}
                        </StatValue>
                      ))}
                    </StatRow>
                    {STAT_ROWS.map(({ label, getValue }) => (
                      <StatRow key={label}>
                        <StatLabel>{label}</StatLabel>
                        {chartPlayers.map((p) => (
                          <StatValue
                            key={p.nickname}
                            $colorIndex={p.colorIndex}
                          >
                            {getValue(p.stats)}
                          </StatValue>
                        ))}
                      </StatRow>
                    ))}
                  </StatsTable>
                </ChartRow>
              </ResultCard>
            )}

            {showMmr && (
              <ResultCard>
                <ResultCardTitle>
                  <Text variant="h3">등수별 MMR 변화</Text>
                </ResultCardTitle>
                <Legend>
                  {chartPlayers.map((p) => (
                    <LegendItem key={p.nickname}>
                      <LegendDot $color={PLAYER_COLORS[p.colorIndex]} />
                      <LegendName>{p.nickname}</LegendName>
                    </LegendItem>
                  ))}
                </Legend>
                <MmrBarChart players={chartPlayers} />
              </ResultCard>
            )}
          </ResultsWrapper>
        )}
      </PageContent>
    </PageWrapper>
  );
}

import { useState } from "react";
import styled, { css } from "styled-components";
import { Text } from "@repo/ui";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Loading } from "../../../shared/components/Loading";
import { useVisionSourceData } from "../hooks/useVisionSourceData";
import { VisionBreakdownSection } from "./VisionBreakdownSection";
import { VisionTrendSection } from "./VisionTrendSection";
import { VisionStatsSection } from "./VisionStatsSection";
import { VisionCameraSourceSection } from "./VisionCameraSourceSection";
import { VisionInsightSection } from "./VisionInsightSection";
import { GameDetailSection } from "./GameDetailSection";

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

const ResultStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[8]};
`;

const InputCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const InputWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
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

const AnalyzeButton = styled.button`
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

const ErrorText = styled.p`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.semantic.negative};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const EmptyText = styled.div`
  ${({ theme }) => css(theme.typography.styles.body)}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing[16]} 0;
`;

export default function VisionSourcePage() {
  const [nickname, setNickname] = useState("");
  const { result, rankerBenchmark, loading, error, analyze } = useVisionSourceData();

  const handleSubmit = () => analyze(nickname);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <PageWrapper>
      <AppHeader />

      <PageContent>
        <SectionTitle>
          <Text variant="h2">시야 점수 분석</Text>
        </SectionTitle>

        <InputCard>
          <InputWrapper>
            <StyledInput
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="닉네임을 입력하세요..."
            />
          </InputWrapper>
          {error && <ErrorText>{error}</ErrorText>}
          <AnalyzeButton disabled={!nickname.trim() || loading} onClick={handleSubmit}>
            {loading ? "분석 중..." : "분석하기"}
          </AnalyzeButton>
        </InputCard>

        {loading && <Loading />}

        {!loading && result && (
          result.gamesAnalyzed === 0 ? (
            <EmptyText>최근 랭크 게임 기록이 없습니다.</EmptyText>
          ) : (
            <ResultStack>
              <VisionBreakdownSection data={result} rankerBenchmark={rankerBenchmark} />
              <VisionTrendSection games={result.games} />
              <VisionStatsSection
                games={result.games}
                rankerGames={rankerBenchmark?.games}
                rankerPeriodLabel={rankerBenchmark?.periodLabel}
              />
              <VisionCameraSourceSection games={result.games} />
              <VisionInsightSection
                games={result.games}
                rankerGames={rankerBenchmark?.games}
                rankerPeriodLabel={rankerBenchmark?.periodLabel}
              />
              <GameDetailSection games={result.games} />
            </ResultStack>
          )
        )}
      </PageContent>
    </PageWrapper>
  );
}

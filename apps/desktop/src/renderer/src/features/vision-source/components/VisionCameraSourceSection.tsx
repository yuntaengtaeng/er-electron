import { useMemo } from "react";
import styled from "styled-components";
import { Text } from "@repo/ui";
import type { GameDetail } from "@repo/service";

// 카메라 획득 경로별 도메인 색상
const SOURCE_COLORS = {
  bat: "#7BA7D4",
  drone: "#72C07D",
  console: "#D49E6A",
} as const;

const avgOf = (nums: number[]) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

const Wrapper = styled.div``;

const SectionTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;

const StackedBar = styled.div`
  display: flex;
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  gap: 2px;
`;

const BarSegment = styled.div<{ $flex: number }>`
  flex: ${({ $flex }) => $flex};
  border-radius: 4px;
  min-width: 0;
  transition: flex 0.3s ease;
`;

const LegendList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[8]};
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ColorDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const LegendTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface Props {
  games: GameDetail[];
}

export const VisionCameraSourceSection = ({ games }: Props) => {
  const { sources, total } = useMemo(() => {
    const avgBat = avgOf(
      games.map((g) => g.batKills + g.mutantBatKills * 2),
    );
    const avgDrone = avgOf(games.map((g) => g.cameraFromDrone));
    const avgConsole = avgOf(games.map((g) => g.cameraFromConsole));
    const total = avgBat + avgDrone + avgConsole || 1;
    return {
      sources: [
        { key: "bat", label: "박쥐 처치", avg: avgBat, color: SOURCE_COLORS.bat },
        { key: "drone", label: "드론 구매", avg: avgDrone, color: SOURCE_COLORS.drone },
        { key: "console", label: "콘솔 구매", avg: avgConsole, color: SOURCE_COLORS.console },
      ],
      total,
    };
  }, [games]);

  return (
    <Wrapper>
      <SectionTitle>
        <Text variant="bodyBold">카메라 획득 경로</Text>
      </SectionTitle>
      <Card>
        <StackedBar>
          {sources
            .filter(({ avg: value }) => value > 0)
            .map(({ key, avg: value, color }) => (
              <BarSegment
                key={key}
                $flex={value / total}
                style={{ backgroundColor: color }}
              />
            ))}
        </StackedBar>

        <LegendList>
          {sources.map(({ key, label, avg: value, color }) => {
            const pct = Math.round((value / total) * 100);
            return (
              <LegendItem key={key}>
                <ColorDot style={{ backgroundColor: color }} />
                <LegendTexts>
                  <Text variant="caption" color="secondary">{label}</Text>
                  <ValueRow>
                    <Text variant="bodyBold">{value.toFixed(1)}개</Text>
                    <Text variant="caption" color="secondary">({pct}%)</Text>
                  </ValueRow>
                </LegendTexts>
              </LegendItem>
            );
          })}
        </LegendList>
      </Card>
    </Wrapper>
  );
};

import { useMemo } from "react";
import styled from "styled-components";
import { Text } from "@repo/ui";
import type { PhaseCombatResult } from "@repo/service";
import {
  getCharacterByKey,
  getCharacterById,
  normalizeImageUrl,
} from "../../../shared/utils/meta";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ChartCard = styled.div`
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
  width: 96px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  overflow: hidden;
`;

const CharImg = styled.img`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  object-fit: cover;
  flex-shrink: 0;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 18px;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: 3px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number; $color: string }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background-color: ${({ $color }) => $color};
  border-radius: 3px;
`;

const BarValue = styled.div`
  flex-shrink: 0;
  width: 32px;
  text-align: right;
`;

const EmptyNote = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} 0;
`;

const DEATH_COLOR = "#e05c5c";
const KILL_COLOR = "#4caf6e";

interface Props {
  data: PhaseCombatResult;
}

export const CharacterMatchupSection = ({ data }: Props) => {
  const killedByItems = useMemo(() => {
    return Object.entries(data.killerCharacterCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => {
        const char = getCharacterByKey(key);
        return { key, name: char?.name ?? key, imageUrl: char?.imageUrl, count };
      });
  }, [data.killerCharacterCounts]);

  const killedItems = useMemo(() => {
    return Object.entries(data.killedCharacterCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => {
        const char = getCharacterById(Number(id));
        return { key: id, name: char?.name ?? `#${id}`, imageUrl: char?.imageUrl, count };
      });
  }, [data.killedCharacterCounts]);

  const maxDeath = Math.max(...killedByItems.map((i) => i.count), 1);
  const maxKill = Math.max(...killedItems.map((i) => i.count), 1);

  return (
    <Wrapper>
      <Text variant="bodyBold">실험체 매치업</Text>
      <Grid>
        <ChartCard>
          <CardTitle>
            <Text variant="bodyBold">나를 많이 죽인 실험체 Top 5</Text>
          </CardTitle>
          {killedByItems.length === 0 ? (
            <EmptyNote>
              <Text variant="caption" color="secondary">플레이어에게 사망한 기록이 없습니다.</Text>
            </EmptyNote>
          ) : (
            killedByItems.map((item) => (
              <BarRow key={item.key}>
                <BarLabel>
                  {item.imageUrl && (
                    <CharImg
                      src={normalizeImageUrl(item.imageUrl)}
                      alt={item.name}
                      title={item.name}
                    />
                  )}
                  <Text variant="caption" color="secondary">{item.name}</Text>
                </BarLabel>
                <BarTrack>
                  <BarFill $pct={(item.count / maxDeath) * 100} $color={DEATH_COLOR} />
                </BarTrack>
                <BarValue>
                  <Text variant="caption">{item.count}회</Text>
                </BarValue>
              </BarRow>
            ))
          )}
        </ChartCard>

        <ChartCard>
          <CardTitle>
            <Text variant="bodyBold">내가 많이 죽인 실험체 Top 5</Text>
          </CardTitle>
          {killedItems.length === 0 ? (
            <EmptyNote>
              <Text variant="caption" color="secondary">처치 기록이 없습니다.</Text>
            </EmptyNote>
          ) : (
            killedItems.map((item) => (
              <BarRow key={item.key}>
                <BarLabel>
                  {item.imageUrl && (
                    <CharImg
                      src={normalizeImageUrl(item.imageUrl)}
                      alt={item.name}
                      title={item.name}
                    />
                  )}
                  <Text variant="caption" color="secondary">{item.name}</Text>
                </BarLabel>
                <BarTrack>
                  <BarFill $pct={(item.count / maxKill) * 100} $color={KILL_COLOR} />
                </BarTrack>
                <BarValue>
                  <Text variant="caption">{item.count}회</Text>
                </BarValue>
              </BarRow>
            ))
          )}
        </ChartCard>
      </Grid>
    </Wrapper>
  );
};

import styled from "styled-components";
import { Text } from "@repo/ui";
import type { RankerVisionBenchmark, VisionSourceResult } from "@repo/service";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const SectionTitle = styled.div`
  margin-bottom: 0;
`;

const ComparisonHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: 0 ${({ theme }) => theme.spacing[6]};
`;

const SummaryCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[6]};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: end;
`;

const SummaryMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const SummaryMeta = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const DeviceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const DeviceCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[5]};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const CardTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const ComparisonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ComparisonSubRow = styled(ComparisonRow)`
  padding-left: ${({ theme }) => theme.spacing[4]};
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const fmt = (n: number) => n.toFixed(1);
const fmtCredits = (n: number) => Math.round(n).toLocaleString();

interface Props {
  data: VisionSourceResult;
  rankerBenchmark: RankerVisionBenchmark | null;
}

const ComparisonValue = ({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
}) => (
  <Text variant="bodyBold">{format(value)}</Text>
);

const RankerValue = ({
  value,
  format,
}: {
  value: number | undefined;
  format: (n: number) => string;
}) => (
  <Text variant="bodyBold" color="secondary">
    {value == null ? "-" : format(value)}
  </Text>
);

export const VisionBreakdownSection = ({ data, rankerBenchmark }: Props) => (
  <Wrapper>
    <SectionTitle>
      <Text variant="bodyBold">시야 점수 요약</Text>
    </SectionTitle>

    {rankerBenchmark && (
      <ComparisonHeader>
        <span />
        <Text variant="caption" color="secondary">내 평균</Text>
        <Text variant="caption" color="secondary">
          랭커 평균 ({rankerBenchmark.periodLabel})
        </Text>
      </ComparisonHeader>
    )}

    <SummaryCard>
      <SummaryGrid>
        <SummaryMain>
          <Text variant="caption" color="secondary">평균 시야 점수</Text>
        </SummaryMain>
        <SummaryMain>
          <Text variant="h2">{Math.round(data.avgViewContribution).toLocaleString()}점</Text>
        </SummaryMain>
        <SummaryMain>
          {rankerBenchmark ? (
            <Text variant="h2" color="secondary">
              {Math.round(rankerBenchmark.avgViewContribution).toLocaleString()}점
            </Text>
          ) : (
            <Text variant="h2" color="secondary">-</Text>
          )}
        </SummaryMain>
      </SummaryGrid>
      <SummaryMeta>
        <Text variant="caption" color="secondary">{data.gamesAnalyzed}게임 분석</Text>
        {rankerBenchmark && (
          <Text variant="caption" color="secondary">
            랭커 {rankerBenchmark.rankerCount.toLocaleString()}명 · {rankerBenchmark.gamesAnalyzed.toLocaleString()}게임
          </Text>
        )}
      </SummaryMeta>
    </SummaryCard>

    <DeviceGrid>
      <DeviceCard>
        <CardTitle>
          <Text variant="bodyBold">망원 카메라</Text>
        </CardTitle>
        <ComparisonRow>
          <Text variant="caption" color="secondary">설치 수</Text>
          <ComparisonValue value={data.avgTelephotoPlaced} format={fmt} />
          <RankerValue value={rankerBenchmark?.avgTelephotoPlaced} format={fmt} />
        </ComparisonRow>
        <Divider />
        <ComparisonRow>
          <Text variant="caption" color="secondary">박쥐 처치</Text>
          <ComparisonValue value={data.avgCameraFromBat} format={fmt} />
          <RankerValue value={rankerBenchmark?.avgCameraFromBat} format={fmt} />
        </ComparisonRow>
        <ComparisonSubRow>
          <Text variant="caption" color="secondary">박쥐 {fmt(data.avgBatKills)}마리</Text>
          <Text variant="caption">{fmt(data.avgBatKills)}개</Text>
          <Text variant="caption" color="secondary">
            {rankerBenchmark ? `${fmt(rankerBenchmark.avgBatKills)}개` : "-"}
          </Text>
        </ComparisonSubRow>
        <ComparisonSubRow>
          <Text variant="caption" color="secondary">
            변이 박쥐 {fmt(data.avgMutantBatKills)}마리 ×2
          </Text>
          <Text variant="caption">{fmt(data.avgMutantBatKills * 2)}개</Text>
          <Text variant="caption" color="secondary">
            {rankerBenchmark ? `${fmt(rankerBenchmark.avgMutantBatKills * 2)}개` : "-"}
          </Text>
        </ComparisonSubRow>
        <ComparisonRow>
          <Text variant="caption" color="secondary">원격 구매</Text>
          <ComparisonValue value={data.avgCameraFromPurchase} format={fmt} />
          <RankerValue value={rankerBenchmark?.avgCameraFromPurchase} format={fmt} />
        </ComparisonRow>
      </DeviceCard>

      <DeviceCard>
        <CardTitle>
          <Text variant="bodyBold">정찰 드론</Text>
        </CardTitle>
        <ComparisonRow>
          <Text variant="caption" color="secondary">사용량</Text>
          <ComparisonValue value={data.avgReconDrone} format={(n) => `${fmt(n)}회`} />
          <RankerValue value={rankerBenchmark?.avgReconDrone} format={(n) => `${fmt(n)}회`} />
        </ComparisonRow>
        <Divider />
        <ComparisonRow>
          <Text variant="caption" color="secondary">구매한 드론량</Text>
          <ComparisonValue value={data.avgReconDroneBought} format={fmt} />
          <RankerValue value={rankerBenchmark?.avgReconDroneBought} format={fmt} />
        </ComparisonRow>
        <ComparisonRow>
          <Text variant="caption" color="secondary">구매 금액</Text>
          <ComparisonValue value={data.avgReconDroneBoughtCredits} format={(n) => `${fmtCredits(n)}원`} />
          <RankerValue value={rankerBenchmark?.avgReconDroneBoughtCredits} format={(n) => `${fmtCredits(n)}원`} />
        </ComparisonRow>
      </DeviceCard>

      <DeviceCard>
        <CardTitle>
          <Text variant="bodyBold">EMP 드론</Text>
        </CardTitle>
        <ComparisonRow>
          <Text variant="caption" color="secondary">사용량</Text>
          <ComparisonValue value={data.avgEmpDrone} format={(n) => `${fmt(n)}회`} />
          <RankerValue value={rankerBenchmark?.avgEmpDrone} format={(n) => `${fmt(n)}회`} />
        </ComparisonRow>
        <Divider />
        <ComparisonRow>
          <Text variant="caption" color="secondary">구매한 드론량</Text>
          <ComparisonValue value={data.avgEmpDroneBought} format={fmt} />
          <RankerValue value={rankerBenchmark?.avgEmpDroneBought} format={fmt} />
        </ComparisonRow>
        <ComparisonRow>
          <Text variant="caption" color="secondary">구매 금액</Text>
          <ComparisonValue value={data.avgEmpDroneBoughtCredits} format={(n) => `${fmtCredits(n)}원`} />
          <RankerValue value={rankerBenchmark?.avgEmpDroneBoughtCredits} format={(n) => `${fmtCredits(n)}원`} />
        </ComparisonRow>
      </DeviceCard>

      <DeviceCard>
        <CardTitle>
          <Text variant="bodyBold">감시 카메라</Text>
        </CardTitle>
        <ComparisonRow>
          <Text variant="caption" color="secondary">설치 수</Text>
          <ComparisonValue value={data.avgSurveillanceCamera} format={fmt} />
          <RankerValue value={rankerBenchmark?.avgSurveillanceCamera} format={fmt} />
        </ComparisonRow>
      </DeviceCard>
    </DeviceGrid>
  </Wrapper>
);

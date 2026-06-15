import styled from "styled-components";
import { Text } from "@repo/ui";
import type { VisionSourceResult } from "@repo/service";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const SectionTitle = styled.div`
  margin-bottom: 0;
`;

const SummaryCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[6]};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SummaryMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
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

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const SourceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const SubRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;


const fmt = (n: number) => n.toFixed(1);
const fmtCredits = (n: number) => Math.round(n).toLocaleString();

interface Props {
  data: VisionSourceResult;
}

export const VisionBreakdownSection = ({ data }: Props) => (
  <Wrapper>
    <SectionTitle>
      <Text variant="bodyBold">시야 점수 요약</Text>
    </SectionTitle>
    <SummaryCard>
      <SummaryMain>
        <Text variant="caption" color="secondary">평균 시야 점수</Text>
        <Text variant="h2">{Math.round(data.avgViewContribution).toLocaleString()}점</Text>
      </SummaryMain>
      <Text variant="caption" color="secondary">{data.gamesAnalyzed}게임 분석</Text>
    </SummaryCard>

    <DeviceGrid>
      <DeviceCard>
        <CardTitle>
          <Text variant="bodyBold">망원 카메라</Text>
        </CardTitle>
        <StatRow>
          <Text variant="caption" color="secondary">설치 수</Text>
          <Text variant="bodyBold">{fmt(data.avgTelephotoPlaced)}개</Text>
        </StatRow>
        <Divider />
        <SourceRow>
          <Text variant="caption" color="secondary">박쥐 처치</Text>
          <Text variant="caption">{fmt(data.avgCameraFromBat)}개</Text>
        </SourceRow>
        <SubRow>
          <Text variant="caption" color="secondary">박쥐 {fmt(data.avgBatKills)}마리</Text>
          <Text variant="caption" color="secondary">{fmt(data.avgBatKills)}개</Text>
        </SubRow>
        <SubRow>
          <Text variant="caption" color="secondary">
            변이 박쥐 {fmt(data.avgMutantBatKills)}마리 ×2
          </Text>
          <Text variant="caption" color="secondary">
            {fmt(data.avgMutantBatKills * 2)}개
          </Text>
        </SubRow>
        <SourceRow>
          <Text variant="caption" color="secondary">원격 구매</Text>
          <Text variant="caption">{fmt(data.avgCameraFromPurchase)}개</Text>
        </SourceRow>
      </DeviceCard>

      <DeviceCard>
        <CardTitle>
          <Text variant="bodyBold">정찰 드론</Text>
        </CardTitle>
        <StatRow>
          <Text variant="caption" color="secondary">사용량</Text>
          <Text variant="bodyBold">{fmt(data.avgReconDrone)}회</Text>
        </StatRow>
        <Divider />
        <SourceRow>
          <Text variant="caption" color="secondary">구매한 드론량</Text>
          <Text variant="caption">{fmt(data.avgReconDroneBought)}개</Text>
        </SourceRow>
        <SourceRow>
          <Text variant="caption" color="secondary">구매 금액</Text>
          <Text variant="caption">{fmtCredits(data.avgReconDroneBoughtCredits)}원</Text>
        </SourceRow>
      </DeviceCard>

      <DeviceCard>
        <CardTitle>
          <Text variant="bodyBold">EMP 드론</Text>
        </CardTitle>
        <StatRow>
          <Text variant="caption" color="secondary">사용량</Text>
          <Text variant="bodyBold">{fmt(data.avgEmpDrone)}회</Text>
        </StatRow>
        <Divider />
        <SourceRow>
          <Text variant="caption" color="secondary">구매한 드론량</Text>
          <Text variant="caption">{fmt(data.avgEmpDroneBought)}개</Text>
        </SourceRow>
        <SourceRow>
          <Text variant="caption" color="secondary">구매 금액</Text>
          <Text variant="caption">{fmtCredits(data.avgEmpDroneBoughtCredits)}원</Text>
        </SourceRow>
      </DeviceCard>

      <DeviceCard>
        <CardTitle>
          <Text variant="bodyBold">감시 카메라</Text>
        </CardTitle>
        <StatRow>
          <Text variant="caption" color="secondary">설치 수</Text>
          <Text variant="bodyBold">{fmt(data.avgSurveillanceCamera)}개</Text>
        </StatRow>
      </DeviceCard>
    </DeviceGrid>

  </Wrapper>
);

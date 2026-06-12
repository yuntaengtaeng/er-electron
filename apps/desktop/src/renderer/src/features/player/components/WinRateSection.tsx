import styled, { css } from "styled-components";

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[5]} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[1.5]};
`;

const BarTrack = styled.div`
  flex: 1;
  height: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radius.fullPill};
  background-color: ${({ theme }) => `${theme.colors.semantic.negative}25`};
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.fullPill};
  background-color: ${({ theme }) => theme.colors.brand.green};
  transition: width 0.4s ease;
`;

const Labels = styled.div`
  display: flex;
  justify-content: space-between;
  ${({ theme }) => css(theme.typography.styles.small)}
`;

const Positive = styled.span`
  color: ${({ theme }) => theme.colors.brand.green};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const Negative = styled.span`
  color: ${({ theme }) => theme.colors.semantic.negative};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

interface Props {
  wins: number;
  losses: number;
  winRate: string;
}

export function WinRateSection({ wins, losses, winRate }: Props) {
  const pct = parseFloat(winRate);

  return (
    <Wrapper>
      <BarRow>
        <Positive>{winRate}%</Positive>
        <BarTrack>
          <BarFill $pct={pct} />
        </BarTrack>
        <Negative>{(100 - pct).toFixed(1)}%</Negative>
      </BarRow>
      <Labels>
        <Positive>{wins}승</Positive>
        <Negative>{losses}패</Negative>
      </Labels>
    </Wrapper>
  );
}


import styled, { css } from "styled-components";
import { Text } from "@repo/ui";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const Cell = styled.div<{ $bordered?: boolean }>`
  padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[4]};
  text-align: center;
  border-left: ${({ theme, $bordered }) =>
    $bordered ? `1px solid ${theme.colors.border.subtle}` : "none"};
`;

const Value = styled.div`
  ${({ theme }) => css(theme.typography.styles.featureHeading)}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.title};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

interface Props {
  avgPlacement: string;
  avgKills: string;
  avgAssists: string;
  avgDamage: number;
}

export function StatsGrid({ avgPlacement, avgKills, avgAssists, avgDamage }: Props) {
  const stats = [
    { label: "평균 순위", value: `${avgPlacement}위` },
    { label: "평균 킬", value: `${avgKills}킬` },
    { label: "평균 도움", value: `${avgAssists}도움` },
    { label: "평균 피해", value: avgDamage.toLocaleString() },
  ];

  return (
    <Grid>
      {stats.map((stat, i) => (
        <Cell key={stat.label} $bordered={i > 0}>
          <Value>{stat.value}</Value>
          <Text variant="small" color="secondary">{stat.label}</Text>
        </Cell>
      ))}
    </Grid>
  );
}


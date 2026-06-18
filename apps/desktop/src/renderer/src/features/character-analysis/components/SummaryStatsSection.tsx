import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import type { WeaponTypeGroup } from '@repo/service'
import { formatDuration } from '../../../shared/utils/format'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`

const StatLabel = styled.div`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
`

type Props = {
  group: WeaponTypeGroup
  characterPickRate: number
  totalPoolGames: number
}

export const SummaryStatsSection = ({ group, characterPickRate, totalPoolGames }: Props) => {
  const { summary } = group
  const kdaValue = `${summary.avgKills.toFixed(1)} / ${summary.avgDeaths.toFixed(1)} / ${summary.avgAssists.toFixed(1)}`

  const stats = [
    { label: '시야 점수', value: summary.avgVision.toFixed(1) },
    {
      label: 'RP 획득',
      value: `${summary.avgMmrGain >= 0 ? '+' : ''}${summary.avgMmrGain.toFixed(1)}`,
    },
    { label: '승률', value: `${summary.winRate.toFixed(1)}%` },
    {
      label: '픽률',
      value: `${characterPickRate.toFixed(1)}%`,
      hint: `${group.games}판`,
    },
    { label: '평균 순위', value: `${summary.avgRank.toFixed(1)}위` },
    { label: '평균 K/D/A', value: kdaValue },
    { label: '평균 템 크레딧', value: Math.round(summary.avgItemCredits).toLocaleString() },
    { label: '평균 딜량', value: Math.round(summary.avgDamage).toLocaleString() },
    { label: '평균 생존', value: formatDuration(Math.round(summary.avgPlayTime)) },
  ]

  return (
    <Grid>
      {stats.map((stat) => (
        <StatCard key={stat.label}>
          <StatLabel>{stat.label}</StatLabel>
          <Text variant="h3">{stat.value}</Text>
          {stat.hint && (
            <Text variant="caption" color="secondary">
              전체 {totalPoolGames}판 중 {stat.hint}
            </Text>
          )}
        </StatCard>
      ))}
    </Grid>
  )
}

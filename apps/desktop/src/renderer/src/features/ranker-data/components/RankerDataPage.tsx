import { useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import { AppHeader } from '../../../shared/components/AppHeader'
import { useRankerData } from '../hooks/useRankerData'
import { getTierByMmr } from '../../../shared/utils/meta'
import { currentSeasonDisplayVersion } from '../../../shared/utils/meta'
import { getTierColor } from '../../../shared/constants/tierColors'

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.base};
  color: ${({ theme }) => theme.colors.text.primary};
`

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]}
    ${({ theme }) => theme.spacing[16]};
`

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`

const SummaryChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`

const Chip = styled.span`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.full};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
`

const TableCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  overflow: hidden;
`

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 120px 140px;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`

const HeadCell = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.secondary};
`

const TableBody = styled.div`
  overflow-y: auto;
  max-height: calc(100vh - 260px);
`

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 120px 140px;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  cursor: pointer;
  transition: background-color 0.12s;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`

const RankCell = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const NicknameCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const Nickname = styled.span`
  ${({ theme }) => css(theme.typography.styles.body)}
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const TierLabel = styled.span<{ $color: string }>`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ $color }) => $color};
`

const MmrCell = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.primary};
  align-self: center;
`

const DateCell = styled.span`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
  align-self: center;
`

const EmptyWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[20]} 0;
  text-align: center;
`

const formatCollectedAt = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function RankerDataPage() {
  const navigate = useNavigate()
  const { rankers, versions, loading, error } = useRankerData()

  const lastCollectedAt =
    rankers.length > 0 ? formatCollectedAt(rankers[0]!.collectedAt) : null

  const versionLabels = versions
    .map((v) => `v${currentSeasonDisplayVersion}.${v}`)
    .join(', ')

  return (
    <PageWrapper>
      <AppHeader />

      <ContentWrapper>
        <PageHeader>
          <TitleRow>
            <Text variant="h1">랭커 데이터</Text>
            {!loading && rankers.length > 0 && (
              <Text variant="caption" color="secondary">
                AS 서버 · 솔로 랭크
              </Text>
            )}
          </TitleRow>

          {!loading && rankers.length > 0 && (
            <SummaryChips>
              <Chip>{rankers.length.toLocaleString()}명 수집됨</Chip>
              {versionLabels && <Chip>{versionLabels}</Chip>}
              {lastCollectedAt && <Chip>마지막 수집: {lastCollectedAt}</Chip>}
            </SummaryChips>
          )}
        </PageHeader>

        {loading && (
          <EmptyWrapper>
            <Text variant="body" color="secondary">불러오는 중...</Text>
          </EmptyWrapper>
        )}

        {error && (
          <EmptyWrapper>
            <Text variant="body" color="secondary">데이터를 불러올 수 없습니다.</Text>
          </EmptyWrapper>
        )}

        {!loading && !error && rankers.length === 0 && (
          <EmptyWrapper>
            <Text variant="body" color="secondary">
              수집된 데이터가 없습니다. GitHub Actions가 실행되면 자동으로 수집됩니다.
            </Text>
          </EmptyWrapper>
        )}

        {!loading && !error && rankers.length > 0 && (
          <TableCard>
            <TableHead>
              <HeadCell>순위</HeadCell>
              <HeadCell>닉네임</HeadCell>
              <HeadCell>MMR</HeadCell>
              <HeadCell>수집 일시</HeadCell>
            </TableHead>
            <TableBody>
              {rankers.map((ranker) => {
                const tier = getTierByMmr(ranker.mmr)
                const tierColor = getTierColor(tier?.key)
                return (
                  <TableRow
                    key={ranker.nickname}
                    onClick={() => navigate(`/player/${encodeURIComponent(ranker.nickname)}`)}
                  >
                    <RankCell>#{ranker.rank}</RankCell>
                    <NicknameCell>
                      <Nickname>{ranker.nickname}</Nickname>
                      <TierLabel $color={tierColor}>{tier?.name ?? 'Unrank'}</TierLabel>
                    </NicknameCell>
                    <MmrCell>{ranker.mmr.toLocaleString()} RP</MmrCell>
                    <DateCell>{formatCollectedAt(ranker.collectedAt)}</DateCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </TableCard>
        )}
      </ContentWrapper>
    </PageWrapper>
  )
}

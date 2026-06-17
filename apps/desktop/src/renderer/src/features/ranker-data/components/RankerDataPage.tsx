import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import { AppHeader } from '../../../shared/components/AppHeader'
import { useRankerData } from '../hooks/useRankerData'
import type { TabKey } from '../hooks/useRankerData'
import { currentSeasonDisplayVersion } from '../../../shared/utils/meta'

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.base};
  color: ${({ theme }) => theme.colors.text.primary};
`

const ContentWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing[4]};
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

const TabRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`

const TabButton = styled.button<{ $active: boolean }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border: none;
  border-bottom: 2px solid ${({ $active, theme }) => $active ? theme.colors.text.primary : 'transparent'};
  background: none;
  color: ${({ $active, theme }) => $active ? theme.colors.text.primary : theme.colors.text.secondary};
  cursor: pointer;
  margin-bottom: -1px;
`

const TableScroll = styled.div`
  overflow: auto;
  max-height: calc(100vh - 240px);
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
`

const Table = styled.table`
  border-collapse: collapse;
  white-space: nowrap;
  font-size: 12px;
  width: 100%;
`

const Th = styled.th`
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-right: 1px solid ${({ theme }) => theme.colors.border.subtle};
  text-align: left;

  &:last-child {
    border-right: none;
  }
`

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-right: 1px solid ${({ theme }) => theme.colors.border.subtle};
  color: ${({ theme }) => theme.colors.text.primary};
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;

  &:last-child {
    border-right: none;
  }
`

const Tr = styled.tr`
  &:last-child td {
    border-bottom: none;
  }

  &:hover td {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`

const EmptyWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[20]} 0;
  text-align: center;
`

const formatCell = (v: unknown): string => {
  if (v == null) return ''
  if (typeof v === 'object') {
    const s = JSON.stringify(v)
    return s.length > 60 ? s.slice(0, 60) + '…' : s
  }
  return String(v)
}

type RawTableProps = {
  rows: Record<string, unknown>[]
  loading: boolean
}

const RawTable = ({ rows, loading }: RawTableProps) => {
  if (loading) {
    return (
      <EmptyWrapper>
        <Text variant="body" color="secondary">불러오는 중...</Text>
      </EmptyWrapper>
    )
  }
  if (rows.length === 0) {
    return (
      <EmptyWrapper>
        <Text variant="body" color="secondary">데이터가 없습니다.</Text>
      </EmptyWrapper>
    )
  }
  const columns = Object.keys(rows[0]!)
  return (
    <TableScroll>
      <Table>
        <thead>
          <tr>
            {columns.map((col) => <Th key={col}>{col}</Th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <Tr key={i}>
              {columns.map((col) => (
                <Td key={col} title={formatCell(row[col])}>{formatCell(row[col])}</Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableScroll>
  )
}

const TAB_LABELS: Record<TabKey, string> = {
  rankers: '랭커',
  games: '게임',
  matchups: '킬 매치업',
}

export default function RankerDataPage() {
  const { tab, setTab, rankers, versions, games, matchups, loading, gamesLoading, matchupsLoading, error } = useRankerData()

  const versionLabels = versions.map((v) => `v${currentSeasonDisplayVersion}.${v}`).join(', ')

  const tabRows: Record<TabKey, Record<string, unknown>[]> = {
    rankers: rankers.map((r) => ({
      rank: r.rank,
      nickname: r.nickname,
      mmr: r.mmr,
      collected_at: r.collectedAt,
    })),
    games,
    matchups,
  }

  const tabLoading: Record<TabKey, boolean> = {
    rankers: loading,
    games: gamesLoading,
    matchups: matchupsLoading,
  }

  return (
    <PageWrapper>
      <AppHeader />
      <ContentWrapper>
        <div>
          <TitleRow>
            <Text variant="h1">랭커 데이터</Text>
            {!loading && rankers.length > 0 && (
              <Text variant="caption" color="secondary">AS 서버 · 트리오 랭크</Text>
            )}
          </TitleRow>

          {!loading && rankers.length > 0 && (
            <SummaryChips>
              <Chip>{rankers.length.toLocaleString()}명</Chip>
              {versionLabels && <Chip>{versionLabels}</Chip>}
            </SummaryChips>
          )}
        </div>

        {error && (
          <EmptyWrapper>
            <Text variant="body" color="secondary">데이터를 불러올 수 없습니다.</Text>
          </EmptyWrapper>
        )}

        {!error && (
          <>
            <TabRow>
              {(Object.keys(TAB_LABELS) as TabKey[]).map((t) => (
                <TabButton key={t} $active={tab === t} onClick={() => setTab(t)}>
                  {TAB_LABELS[t]}
                  {t === 'rankers' && !loading && ` (${rankers.length})`}
                  {t === 'games' && !gamesLoading && games.length > 0 && ` (${games.length})`}
                  {t === 'matchups' && !matchupsLoading && matchups.length > 0 && ` (${matchups.length})`}
                </TabButton>
              ))}
            </TabRow>

            <RawTable rows={tabRows[tab]} loading={tabLoading[tab]} />
          </>
        )}
      </ContentWrapper>
    </PageWrapper>
  )
}

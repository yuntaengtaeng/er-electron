import { Fragment, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import type { TeamComboRow, TeamComboSize, TeamComboSort } from '@repo/service'
import { computeTeamComboDetail } from '@repo/service'
import { getCharacterById, normalizeImageUrl } from '../../../shared/utils/meta'
import { useTeamCombos } from '../hooks/useTeamCombos'
import { CharacterFilter } from './CharacterFilter'
import { TeamComboDetailPanel } from './TeamComboDetailPanel'

const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`

const TabGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.radius.comfortable};
`

const SortGroup = styled(TabGroup)``

const FilterButton = styled.button<{ $active: boolean }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border: none;
  border-radius: ${({ theme }) => theme.radius.subtle};
  cursor: pointer;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.background.surface : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
`

const ListCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  overflow-x: auto;
`

const GRID_COLS = '36px 1fr minmax(128px, 1.1fr) 88px 52px'

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: ${GRID_COLS};
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: center;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`

const ListRow = styled.div<{ $selected: boolean }>`
  display: grid;
  grid-template-columns: ${GRID_COLS};
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  cursor: pointer;
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.background.elevated : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`

const CharStack = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`

const CharAvatar = styled.div<{ $highlight: boolean }>`
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radius.medium};
  border: 2px solid
    ${({ $highlight, theme }) =>
      $highlight ? theme.colors.brand.green : theme.colors.border.subtle};
  background-color: ${({ $highlight, theme }) =>
    $highlight ? theme.colors.background.elevated : 'transparent'};
  overflow: hidden;
  transition: border-color 0.15s;
`

const CharImg = styled.img`
  display: block;
  width: 52px;
  height: 52px;
  object-fit: cover;
`

const StatCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[0.5]};
`

const RankRatesCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`

const RankRateLine = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`

const AvgCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[0.5]};
`

const RpValue = styled.span<{ $positive: boolean }>`
  ${({ theme }) => css(theme.typography.styles.bodyBold)}
  color: ${({ $positive, theme }) =>
    $positive ? theme.colors.brand.green : theme.colors.semantic.negative};
`

const EmptyBox = styled.div`
  padding: ${({ theme }) => theme.spacing[12]} ${({ theme }) => theme.spacing[5]};
  text-align: center;
`

const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`

const PageButton = styled.button<{ $disabled: boolean }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.subtle};
  background-color: ${({ theme }) => theme.colors.background.card};
  color: ${({ $disabled, theme }) =>
    $disabled ? theme.colors.text.secondary : theme.colors.text.primary};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
`

const PAGE_SIZE = 20

const SIZE_TABS: { key: TeamComboSize; label: string }[] = [
  { key: 2, label: '2인 조합' },
  { key: 3, label: '3인 조합' },
]

const SORT_TABS: { key: TeamComboSort; label: string }[] = [
  { key: 'mmrGain', label: '획득 RP 순' },
  { key: 'kills', label: '킬 수 순' },
]

const ComboCharacters = ({
  characterNums,
  highlightId,
}: {
  characterNums: number[]
  highlightId: number | null
}) => (
  <CharStack>
    {characterNums.map((id) => {
      const char = getCharacterById(id)
      const highlight = highlightId != null && id === highlightId
      return char ? (
        <CharAvatar key={id} $highlight={highlight} title={char.name}>
          <CharImg
            src={normalizeImageUrl(char.imageUrl)}
            alt={char.name}
          />
        </CharAvatar>
      ) : (
        <Text key={id} variant="caption" color="secondary">#{id}</Text>
      )
    })}
  </CharStack>
)

const RankRates = ({ combo }: { combo: TeamComboRow }) => (
  <RankRatesCell>
    <RankRateLine>
      <Text variant="caption" color="secondary">1등</Text>
      <Text variant="captionBold">{combo.rank1Rate.toFixed(1)}%</Text>
      <Text variant="caption" color="secondary">{combo.rank1Count}회</Text>
    </RankRateLine>
    <RankRateLine>
      <Text variant="caption" color="secondary">2등</Text>
      <Text variant="captionBold">{combo.rank2Rate.toFixed(1)}%</Text>
      <Text variant="caption" color="secondary">{combo.rank2Count}회</Text>
    </RankRateLine>
    <RankRateLine>
      <Text variant="caption" color="secondary">3등</Text>
      <Text variant="captionBold">{combo.rank3Rate.toFixed(1)}%</Text>
      <Text variant="caption" color="secondary">{combo.rank3Count}회</Text>
    </RankRateLine>
  </RankRatesCell>
)

const comboRowKey = (nums: number[]) => [...nums].sort((a, b) => a - b).join('-')

const ComboRow = ({
  combo,
  rank,
  highlightId,
  selected,
  onClick,
}: {
  combo: TeamComboRow
  rank: number
  highlightId: number | null
  selected: boolean
  onClick: () => void
}) => (
  <ListRow $selected={selected} onClick={onClick}>
    <Text variant="caption" color="secondary">{rank}</Text>
    <ComboCharacters characterNums={combo.characterNums} highlightId={highlightId} />
    <RankRates combo={combo} />
    <AvgCell>
      <RpValue $positive={combo.avgMmrGain >= 0}>
        {combo.avgMmrGain >= 0 ? '+' : ''}{combo.avgMmrGain.toFixed(1)} RP
      </RpValue>
      <Text variant="caption" color="secondary">
        킬 {combo.avgKills.toFixed(1)}
      </Text>
    </AvgCell>
    <StatCell>
      <Text variant="bodyBold">{combo.games}</Text>
      <Text variant="caption" color="secondary">{combo.pickRate.toFixed(1)}%</Text>
    </StatCell>
  </ListRow>
)

export const TeamComboContent = () => {
  const [size, setSize] = useState<TeamComboSize>(2)
  const [sort, setSort] = useState<TeamComboSort>('mmrGain')
  const [characterFilter, setCharacterFilter] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const { combos, rows, loading, error } = useTeamCombos(size, sort, characterFilter)

  const totalPages = Math.max(1, Math.ceil(combos.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const visible = combos.slice(pageStart, pageStart + PAGE_SIZE)

  const selectedDetail = useMemo(() => {
    if (!selectedKey) return null
    const nums = selectedKey.split('-').map(Number)
    return computeTeamComboDetail(rows, nums)
  }, [selectedKey, rows])

  const handleSizeChange = (next: TeamComboSize) => { setSize(next); setPage(1); setSelectedKey(null) }
  const handleSortChange = (next: TeamComboSort) => { setSort(next); setPage(1); setSelectedKey(null) }
  const handleFilterChange = (next: number | null) => { setCharacterFilter(next); setPage(1); setSelectedKey(null) }

  return (
    <>
      <CharacterFilter
        selectedId={characterFilter}
        onSelect={handleFilterChange}
      />

      <ControlRow>
        <TabGroup>
          {SIZE_TABS.map((tab) => (
            <FilterButton
              key={tab.key}
              $active={size === tab.key}
              onClick={() => handleSizeChange(tab.key)}
            >
              {tab.label}
            </FilterButton>
          ))}
        </TabGroup>
        <SortGroup>
          {SORT_TABS.map((tab) => (
            <FilterButton
              key={tab.key}
              $active={sort === tab.key}
              onClick={() => handleSortChange(tab.key)}
            >
              {tab.label}
            </FilterButton>
          ))}
        </SortGroup>
      </ControlRow>

      <ListCard>
        <ListHeader>
          <Text variant="captionBold" color="secondary">#</Text>
          <Text variant="captionBold" color="secondary">조합</Text>
          <Text variant="captionBold" color="secondary">TOP3 비율</Text>
          <StatCell><Text variant="captionBold" color="secondary">평균</Text></StatCell>
          <StatCell><Text variant="captionBold" color="secondary">판 / 픽률</Text></StatCell>
        </ListHeader>

        {loading && (
          <EmptyBox>
            <Text variant="body" color="secondary">불러오는 중...</Text>
          </EmptyBox>
        )}

        {!loading && error && (
          <EmptyBox>
            <Text variant="body" color="secondary">{error}</Text>
          </EmptyBox>
        )}

        {!loading && !error && combos.length === 0 && (
          <EmptyBox>
            <Text variant="body" color="secondary">
              {characterFilter != null
                ? '선택한 실험체가 포함된 조합이 없습니다.'
                : '조합 데이터가 없습니다. 크롤러를 다시 실행해 주세요.'}
            </Text>
          </EmptyBox>
        )}

        {!loading && !error && visible.map((combo, index) => {
          const key = comboRowKey(combo.characterNums)
          const isSelected = selectedKey === key
          return (
            <Fragment key={key}>
              <ComboRow
                combo={combo}
                rank={pageStart + index + 1}
                highlightId={characterFilter}
                selected={isSelected}
                onClick={() => setSelectedKey(isSelected ? null : key)}
              />
              {isSelected && selectedDetail && (
                <TeamComboDetailPanel detail={selectedDetail} />
              )}
            </Fragment>
          )
        })}
      </ListCard>

      {!loading && !error && totalPages > 1 && (
        <PaginationRow>
          <PageButton
            type="button"
            $disabled={safePage === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </PageButton>
          <Text variant="caption" color="secondary">
            {safePage} / {totalPages}
          </Text>
          <PageButton
            type="button"
            $disabled={safePage === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </PageButton>
        </PaginationRow>
      )}
    </>
  )
}

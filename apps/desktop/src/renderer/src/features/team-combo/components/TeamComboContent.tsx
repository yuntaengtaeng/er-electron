import { useState } from 'react'
import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import type { TeamComboRow, TeamComboSize, TeamComboSort } from '@repo/service'
import { getCharacterById, normalizeImageUrl } from '../../../shared/utils/meta'
import { useTeamCombos } from '../hooks/useTeamCombos'
import { CharacterFilter } from './CharacterFilter'

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

const ListRow = styled.div`
  display: grid;
  grid-template-columns: ${GRID_COLS};
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-child {
    border-bottom: none;
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
  text-align: right;
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

const EmptyBox = styled.div`
  padding: ${({ theme }) => theme.spacing[12]} ${({ theme }) => theme.spacing[5]};
  text-align: center;
`

const SIZE_TABS: { key: TeamComboSize; label: string }[] = [
  { key: 2, label: '2인 조합' },
  { key: 3, label: '3인 조합' },
]

const SORT_TABS: { key: TeamComboSort; label: string }[] = [
  { key: 'rank1Rate', label: '1등 비율 순' },
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

const ComboRow = ({
  combo,
  rank,
  highlightId,
}: {
  combo: TeamComboRow
  rank: number
  highlightId: number | null
}) => (
  <ListRow>
    <Text variant="caption" color="secondary">{rank}</Text>
    <ComboCharacters characterNums={combo.characterNums} highlightId={highlightId} />
    <RankRates combo={combo} />
    <AvgCell>
      <Text variant="bodyBold">
        {combo.avgMmrGain >= 0 ? '+' : ''}{combo.avgMmrGain.toFixed(1)} RP
      </Text>
      <Text variant="caption" color="secondary">
        킬 {combo.avgKills.toFixed(1)}
      </Text>
    </AvgCell>
    <StatCell>
      <Text variant="bodyBold">{combo.games}</Text>
    </StatCell>
  </ListRow>
)

export const TeamComboContent = () => {
  const [size, setSize] = useState<TeamComboSize>(2)
  const [sort, setSort] = useState<TeamComboSort>('rank1Rate')
  const [characterFilter, setCharacterFilter] = useState<number | null>(null)
  const { combos, loading, error } = useTeamCombos(size, sort, characterFilter)

  return (
    <>
      <CharacterFilter
        selectedId={characterFilter}
        onSelect={setCharacterFilter}
      />

      <ControlRow>
        <TabGroup>
          {SIZE_TABS.map((tab) => (
            <FilterButton
              key={tab.key}
              $active={size === tab.key}
              onClick={() => setSize(tab.key)}
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
              onClick={() => setSort(tab.key)}
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
          <StatCell><Text variant="captionBold" color="secondary">판</Text></StatCell>
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

        {!loading && !error && combos.map((combo, index) => (
          <ComboRow
            key={combo.characterNums.join('-')}
            combo={combo}
            rank={index + 1}
            highlightId={characterFilter}
          />
        ))}
      </ListCard>
    </>
  )
}

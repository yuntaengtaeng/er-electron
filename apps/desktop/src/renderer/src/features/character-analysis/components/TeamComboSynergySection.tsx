import { useState } from 'react'
import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import type { TeamComboSize } from '@repo/service'
import { getCharacterById, normalizeImageUrl } from '../../../shared/utils/meta'
import { useTeamCombos } from '../../team-combo/hooks/useTeamCombos'

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`

const TabGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[0.5]};
  padding: ${({ theme }) => theme.spacing[0.5]};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.radius.subtle};
`

const TabButton = styled.button<{ $active: boolean }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
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
  overflow: hidden;
`

const GRID_COLS = '20px 1fr 52px 36px'

const ListRow = styled.div`
  display: grid;
  grid-template-columns: ${GRID_COLS};
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-child {
    border-bottom: none;
  }
`

const CharStack = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`

const CharAvatar = styled.div<{ $highlight: boolean }>`
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid
    ${({ $highlight, theme }) =>
      $highlight ? theme.colors.brand.green : theme.colors.border.subtle};
  overflow: hidden;
`

const CharImg = styled.img`
  display: block;
  width: 32px;
  height: 32px;
  object-fit: cover;
`

const StatCell = styled.div`
  text-align: right;
`

const EmptyBox = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[3]};
  text-align: center;
`

const DISPLAY_LIMIT = 5

type Props = {
  characterNum: number
}

export const TeamComboSynergySection = ({ characterNum }: Props) => {
  const [size, setSize] = useState<TeamComboSize>(2)
  const { combos, loading, error } = useTeamCombos(size, 'rank1Rate', characterNum)
  const visible = combos.slice(0, DISPLAY_LIMIT)

  return (
    <Section>
      <Header>
        <Text variant="bodyBold">조합 시너지</Text>
        <TabGroup>
          <TabButton
            type="button"
            $active={size === 2}
            onClick={() => setSize(2)}
          >
            2인
          </TabButton>
          <TabButton
            type="button"
            $active={size === 3}
            onClick={() => setSize(3)}
          >
            3인
          </TabButton>
        </TabGroup>
      </Header>

      <ListCard>
        {loading && (
          <EmptyBox>
            <Text variant="caption" color="secondary">불러오는 중...</Text>
          </EmptyBox>
        )}

        {!loading && error && (
          <EmptyBox>
            <Text variant="caption" color="secondary">{error}</Text>
          </EmptyBox>
        )}

        {!loading && !error && visible.length === 0 && (
          <EmptyBox>
            <Text variant="caption" color="secondary">조합 데이터 없음</Text>
          </EmptyBox>
        )}

        {!loading && !error && visible.map((combo, index) => (
          <ListRow key={combo.characterNums.join('-')}>
            <Text variant="caption" color="secondary">{index + 1}</Text>
            <CharStack>
              {combo.characterNums.map((id) => {
                const char = getCharacterById(id)
                const highlight = id === characterNum
                return char ? (
                  <CharAvatar key={id} $highlight={highlight} title={char.name}>
                    <CharImg src={normalizeImageUrl(char.imageUrl)} alt={char.name} />
                  </CharAvatar>
                ) : (
                  <Text key={id} variant="caption" color="secondary">#{id}</Text>
                )
              })}
            </CharStack>
            <StatCell>
              <Text variant="captionBold">{combo.rank1Rate.toFixed(1)}%</Text>
            </StatCell>
            <StatCell>
              <Text variant="caption" color="secondary">{combo.games}</Text>
            </StatCell>
          </ListRow>
        ))}
      </ListCard>
    </Section>
  )
}

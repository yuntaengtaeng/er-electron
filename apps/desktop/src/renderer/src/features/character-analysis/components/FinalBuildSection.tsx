import { useState } from 'react'
import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import type { FinalBuildRow } from '@repo/service'
import { getItemById, normalizeImageUrl } from '../../../shared/utils/meta'

const Section = styled.section<{ $embedded?: boolean }>`
  margin-bottom: ${({ $embedded, theme }) => ($embedded ? 0 : theme.spacing[8])};
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`

const TabGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.radius.comfortable};
`

const TabButton = styled.button<{ $active: boolean }>`
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
  overflow: hidden;
`

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 72px 72px 56px;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`

const ListRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 72px 72px 56px;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-child {
    border-bottom: none;
  }
`

const BuildCell = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`

const SlotWrap = styled.div`
  display: flex;
  align-items: center;
`

const ItemIcon = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.background.elevated};
`

const EmptySlot = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`

const StatCell = styled.div`
  text-align: right;
`

type Props = {
  byPick: FinalBuildRow[]
  byWinRate: FinalBuildRow[]
  embedded?: boolean
}

const BuildSlots = ({ itemIds }: { itemIds: number[] }) => (
  <BuildCell>
    {itemIds.map((id, index) => {
      const item = id > 0 ? getItemById(id) : null
      return (
        <SlotWrap key={`${index}-${id}`} title={item?.name}>
          {item ? (
            <ItemIcon src={normalizeImageUrl(item.imageUrl)} alt={item.name} />
          ) : (
            <EmptySlot />
          )}
        </SlotWrap>
      )
    })}
  </BuildCell>
)

export const FinalBuildSection = ({ byPick, byWinRate, embedded }: Props) => {
  const [sort, setSort] = useState<'pick' | 'winRate'>('pick')
  const rows = (sort === 'pick' ? byPick : byWinRate).slice(0, 10)

  return (
    <Section $embedded={embedded}>
      <SectionHeader>
        <Text variant={embedded ? 'bodyBold' : 'h3'}>최종 빌드 (5부위)</Text>
        <TabGroup>
          <TabButton type="button" $active={sort === 'pick'} onClick={() => setSort('pick')}>
            픽률 순
          </TabButton>
          <TabButton type="button" $active={sort === 'winRate'} onClick={() => setSort('winRate')}>
            승률 순
          </TabButton>
        </TabGroup>
      </SectionHeader>

      <ListCard>
        <ListHeader>
          <Text variant="captionBold" color="secondary">빌드</Text>
          <StatCell><Text variant="captionBold" color="secondary">픽률</Text></StatCell>
          <StatCell><Text variant="captionBold" color="secondary">승률</Text></StatCell>
          <StatCell><Text variant="captionBold" color="secondary">판</Text></StatCell>
        </ListHeader>

        {rows.length === 0 && (
          <ListRow>
            <Text variant="body" color="secondary">데이터가 없습니다.</Text>
          </ListRow>
        )}

        {rows.map((row) => (
          <ListRow key={row.itemIds.join('-')}>
            <BuildSlots itemIds={row.itemIds} />
            <StatCell><Text variant="bodyBold">{row.pickRate.toFixed(1)}%</Text></StatCell>
            <StatCell><Text variant="bodyBold">{row.winRate.toFixed(1)}%</Text></StatCell>
            <StatCell><Text variant="caption" color="secondary">{row.games}</Text></StatCell>
          </ListRow>
        ))}
      </ListCard>
    </Section>
  )
}

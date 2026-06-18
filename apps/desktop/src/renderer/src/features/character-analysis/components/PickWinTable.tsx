import { useState } from 'react'
import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import type { PickWinRow } from '@repo/service'
import { normalizeImageUrl } from '../../../shared/utils/meta'

const Section = styled.section<{ $embedded?: boolean }>`
  margin-bottom: ${({ $embedded, theme }) => ($embedded ? 0 : theme.spacing[8])};
  min-width: 0;
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

const ListHeader = styled.div<{ $embedded?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $embedded }) =>
    $embedded ? '1fr 52px 52px 36px' : '1fr 72px 72px 72px'};
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`

const ListRow = styled.div<{ $embedded?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $embedded }) =>
    $embedded ? '1fr 52px 52px 36px' : '1fr 72px 72px 72px'};
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-child {
    border-bottom: none;
  }
`

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  min-width: 0;
`

const Icon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`

const StatCell = styled.div`
  text-align: right;
`

const EmptyBox = styled.div`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[5]};
  text-align: center;
`

export type RowMeta = {
  name: string
  imageUrl?: string
}

type Props = {
  title: string
  byPick: PickWinRow[]
  byWinRate: PickWinRow[]
  resolveRow: (id: number) => RowMeta
  limit?: number
  compactName?: boolean
  embedded?: boolean
}

export const PickWinTable = ({
  title,
  byPick,
  byWinRate,
  resolveRow,
  limit = 10,
  compactName = false,
  embedded = false,
}: Props) => {
  const [sort, setSort] = useState<'pick' | 'winRate'>('pick')
  const rows = (embedded ? byPick : sort === 'pick' ? byPick : byWinRate).slice(0, limit)

  return (
    <Section $embedded={embedded}>
      <SectionHeader>
        <Text variant={embedded ? 'bodyBold' : 'h3'}>{title}</Text>
        {!embedded && (
          <TabGroup>
            <TabButton type="button" $active={sort === 'pick'} onClick={() => setSort('pick')}>
              픽률 순
            </TabButton>
            <TabButton type="button" $active={sort === 'winRate'} onClick={() => setSort('winRate')}>
              승률 순
            </TabButton>
          </TabGroup>
        )}
      </SectionHeader>

      <ListCard>
        <ListHeader $embedded={embedded}>
          <Text variant="captionBold" color="secondary">항목</Text>
          <StatCell><Text variant="captionBold" color="secondary">픽률</Text></StatCell>
          <StatCell><Text variant="captionBold" color="secondary">승률</Text></StatCell>
          <StatCell><Text variant="captionBold" color="secondary">판</Text></StatCell>
        </ListHeader>

        {rows.length === 0 && (
          <EmptyBox>
            <Text variant="body" color="secondary">데이터가 없습니다.</Text>
          </EmptyBox>
        )}

        {rows.map((row) => {
          const meta = resolveRow(row.id)
          return (
            <ListRow key={row.id} $embedded={embedded}>
              <NameCell>
                {meta.imageUrl && (
                  <Icon src={normalizeImageUrl(meta.imageUrl)} alt={meta.name} />
                )}
                <Text variant={compactName || embedded ? 'captionBold' : 'bodyBold'}>{meta.name}</Text>
              </NameCell>
              <StatCell>
                <Text variant={embedded ? 'captionBold' : 'bodyBold'}>{row.pickRate.toFixed(1)}%</Text>
              </StatCell>
              <StatCell>
                <Text variant={embedded ? 'captionBold' : 'bodyBold'}>{row.winRate.toFixed(1)}%</Text>
              </StatCell>
              <StatCell>
                <Text variant="caption" color="secondary">{row.games}</Text>
              </StatCell>
            </ListRow>
          )
        })}
      </ListCard>
    </Section>
  )
}

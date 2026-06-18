import { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import type { PickWinRow } from '@repo/service'
import {
  getItemById,
  isItemGradeEqual,
  normalizeImageUrl,
  type ItemGrade,
} from '../../../shared/utils/meta'
import { EQUIPMENT_SLOT_LABELS, ITEM_GRADE_FILTERS, type ItemGradeFilterKey } from '../constants'
import { PickWinTable } from './PickWinTable'

const GradeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`

const GradeButton = styled.button<{ $active: boolean }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.brand.green : theme.colors.border.subtle};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.background.elevated : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  cursor: pointer;
`

const filterByGrade = (rows: PickWinRow[], gradeKey: ItemGradeFilterKey): PickWinRow[] => {
  if (gradeKey === 'all') return rows
  return rows.filter((row) => isItemGradeEqual(row.id, gradeKey as ItemGrade))
}

type Props = {
  slot: string
  byPick: PickWinRow[]
  byWinRate: PickWinRow[]
}

export const SlotItemSection = ({ slot, byPick, byWinRate }: Props) => {
  const [gradeFilter, setGradeFilter] = useState<ItemGradeFilterKey>('all')

  const filteredPick = useMemo(
    () => filterByGrade(byPick, gradeFilter),
    [byPick, gradeFilter],
  )
  const filteredWin = useMemo(
    () => filterByGrade(byWinRate, gradeFilter),
    [byWinRate, gradeFilter],
  )

  const resolveItem = (id: number) => {
    const item = getItemById(id)
    return { name: item?.name ?? `#${id}`, imageUrl: item?.imageUrl }
  }

  return (
    <div>
      <GradeRow>
        {ITEM_GRADE_FILTERS.map((filter) => (
          <GradeButton
            key={filter.key}
            type="button"
            $active={gradeFilter === filter.key}
            onClick={() => setGradeFilter(filter.key)}
          >
            {filter.label}
          </GradeButton>
        ))}
      </GradeRow>

      <PickWinTable
        title={`${EQUIPMENT_SLOT_LABELS[slot] ?? slot} 아이템`}
        byPick={filteredPick}
        byWinRate={filteredWin}
        resolveRow={resolveItem}
        compactName
      />
    </div>
  )
}

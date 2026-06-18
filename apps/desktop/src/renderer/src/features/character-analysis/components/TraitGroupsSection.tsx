import { useState } from 'react'
import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import type { TraitCoreGroup } from '@repo/service'
import { getTraitById, normalizeImageUrl } from '../../../shared/utils/meta'

const Section = styled.section<{ $embedded?: boolean }>`
  margin-bottom: ${({ $embedded, theme }) => ($embedded ? 0 : theme.spacing[8])};
  min-width: 0;
`

const SectionTitle = styled.div<{ $embedded?: boolean }>`
  margin-bottom: ${({ $embedded, theme }) =>
    $embedded ? theme.spacing[3] : theme.spacing[4]};
`

const CoreBlock = styled.div`
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  overflow: hidden;
`

const CoreHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  cursor: pointer;
`

const CoreIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.subtle};
`

const CoreInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  min-width: 0;
`

const CoreStat = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: left;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-child,
  &:nth-last-child(2) {
    text-align: right;
    width: 64px;
  }
`

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  vertical-align: middle;

  &:last-child,
  &:nth-last-child(2) {
    text-align: right;
  }
`

const TraitComboCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`

const SubDivider = styled.div`
  width: 1px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
  flex-shrink: 0;
`

const TraitRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[0.5]};
`

const SmallTraitIcon = styled.img`
  width: 22px;
  height: 22px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`

const TraitIcons = ({ ids }: { ids: number[] }) => (
  <TraitRow>
    {ids.map((id) => {
      const trait = getTraitById(id)
      return trait ? (
        <SmallTraitIcon
          key={id}
          src={normalizeImageUrl(trait.imageUrl)}
          alt={trait.name}
          title={trait.name}
        />
      ) : null
    })}
  </TraitRow>
)

const MAX_SUB_COMBOS = 8

type Props = {
  groups: TraitCoreGroup[]
  embedded?: boolean
}

export const TraitGroupsSection = ({ groups, embedded = false }: Props) => {
  const [expandedCore, setExpandedCore] = useState<number | null>(
    groups[0]?.coreId ?? null,
  )

  if (groups.length === 0) {
    return (
      <Section $embedded={embedded}>
        <SectionTitle $embedded={embedded}>
          <Text variant={embedded ? 'bodyBold' : 'h3'}>특성</Text>
        </SectionTitle>
        <Text variant="body" color="secondary">데이터가 없습니다.</Text>
      </Section>
    )
  }

  return (
    <Section $embedded={embedded}>
      <SectionTitle $embedded={embedded}>
        <Text variant={embedded ? 'bodyBold' : 'h3'}>특성</Text>
      </SectionTitle>

      {groups.map((group) => {
        const core = getTraitById(group.coreId)
        const open = expandedCore === group.coreId
        const visibleCombos = group.subCombos.slice(0, MAX_SUB_COMBOS)
        const hiddenCount = group.subCombos.length - visibleCombos.length

        return (
          <CoreBlock key={group.coreId}>
            <CoreHeader
              role="button"
              tabIndex={0}
              onClick={() => setExpandedCore(open ? null : group.coreId)}
              onKeyDown={(e) => e.key === 'Enter' && setExpandedCore(open ? null : group.coreId)}
            >
              {core && (
                <CoreIcon src={normalizeImageUrl(core.imageUrl)} alt={core.name} />
              )}
              <CoreInfo>
                <Text variant="bodyBold">{core?.name ?? `#${group.coreId}`}</Text>
                <CoreStat>
                  <Text variant="caption" color="secondary">
                    {group.pickRate.toFixed(1)}% · {group.winRate.toFixed(1)}%
                  </Text>
                </CoreStat>
              </CoreInfo>
            </CoreHeader>

            {open && (
              <Table>
                <thead>
                  <tr>
                    <Th>서브 조합</Th>
                    <Th>픽률</Th>
                    <Th>승률</Th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCombos.map((combo) => (
                    <tr key={`${combo.firstSub.join('-')}-${combo.secondSub.join('-')}`}>
                      <Td>
                        <TraitComboCell>
                          <TraitIcons ids={combo.firstSub} />
                          <SubDivider />
                          <TraitIcons ids={combo.secondSub} />
                        </TraitComboCell>
                      </Td>
                      <Td>
                        <Text variant="captionBold">{combo.pickRate.toFixed(1)}%</Text>
                      </Td>
                      <Td>
                        <Text variant="captionBold">{combo.winRate.toFixed(1)}%</Text>
                      </Td>
                    </tr>
                  ))}
                  {hiddenCount > 0 && (
                    <tr>
                      <Td colSpan={3}>
                        <Text variant="caption" color="secondary">
                          외 {hiddenCount}개 조합
                        </Text>
                      </Td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </CoreBlock>
        )
      })}
    </Section>
  )
}

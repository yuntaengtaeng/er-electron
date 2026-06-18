import styled from 'styled-components'
import { Text } from '@repo/ui'
import type { WeaponTypeGroup } from '@repo/service'
import { getMasteryByKey, normalizeImageUrl } from '../../../shared/utils/meta'
import { FinalBuildSection } from './FinalBuildSection'
import { SlotItemSection } from './SlotItemSection'

const GroupCard = styled.section`
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  overflow: hidden;
`

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`

const WeaponIcon = styled.img`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radius.subtle};
`

const GroupStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-left: auto;
`

const StatItem = styled.div`
  text-align: right;
`

const GroupBody = styled.div`
  padding: ${({ theme }) => theme.spacing[5]};
`

const NestedSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`

const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing[5]};
`

type Props = {
  group: WeaponTypeGroup
  showHeader?: boolean
}

export const WeaponTypeGroupSection = ({ group, showHeader = true }: Props) => {
  const mastery = getMasteryByKey(group.weaponType)
  const iconUrl = mastery?.iconUrl ? normalizeImageUrl(mastery.iconUrl) : undefined

  return (
    <GroupCard>
      {showHeader && (
        <GroupHeader>
          {iconUrl && <WeaponIcon src={iconUrl} alt={mastery?.name} />}
          <Text variant="bodyBold">{mastery?.name ?? group.weaponType}</Text>
          <GroupStats>
            <StatItem>
              <Text variant="caption" color="secondary">픽률</Text>
              <Text variant="bodyBold">{group.pickRate.toFixed(1)}%</Text>
            </StatItem>
            <StatItem>
              <Text variant="caption" color="secondary">판수</Text>
              <Text variant="bodyBold">{group.games}</Text>
            </StatItem>
          </GroupStats>
        </GroupHeader>
      )}

      <GroupBody>
        <NestedSection>
          <FinalBuildSection
            byPick={group.finalBuilds.byPick}
            byWinRate={group.finalBuilds.byWinRate}
            embedded
          />
        </NestedSection>

        <SlotGrid>
          {group.slotItems.map((slot) => (
            <SlotItemSection
              key={slot.slot}
              slot={slot.slot}
              byPick={slot.byPick}
              byWinRate={slot.byWinRate}
            />
          ))}
        </SlotGrid>
      </GroupBody>
    </GroupCard>
  )
}

import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import type { WeaponTypeGroup } from '@repo/service'
import {
  getCharacterById,
  getCharacterCommunityImageUrl,
  getCharacterSkillBar,
  getMasteryByKey,
  normalizeImageUrl,
} from '../../../shared/utils/meta'

const Card = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  overflow: hidden;
`

const Portrait = styled.div`
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: ${({ theme }) => theme.radius.comfortable};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background.elevated};
`

const PortraitImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
`

const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`

const WeaponTabGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1]};
`

const WeaponTab = styled.button<{ $active: boolean }>`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.brand.green : theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.subtle};
  cursor: pointer;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.background.surface : theme.colors.background.elevated};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
`

const WeaponTabIcon = styled.img`
  width: 18px;
  height: 18px;
  border-radius: ${({ theme }) => theme.radius.subtle};
`

const SkillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1]};
`

const SkillSlot = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  overflow: hidden;
`

const SkillIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const SlotLabel = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  position: absolute;
  right: 2px;
  bottom: 1px;
  font-size: 10px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text.primary};
  text-shadow: 0 0 3px ${({ theme }) => theme.colors.background.base};
`

type Props = {
  characterId: number
  weaponGroups?: WeaponTypeGroup[]
  activeWeaponType?: string
  onWeaponTypeChange?: (weaponType: string) => void
}

export const CharacterProfileHeader = ({
  characterId,
  weaponGroups,
  activeWeaponType,
  onWeaponTypeChange,
}: Props) => {
  const character = getCharacterById(characterId)
  if (!character) return null

  const portraitUrl = getCharacterCommunityImageUrl(characterId)
  const skills = getCharacterSkillBar(characterId)

  const activeMastery = activeWeaponType ? getMasteryByKey(activeWeaponType) : null
  const weaponName = activeMastery?.name ?? ''

  const showWeaponTabs =
    weaponGroups != null && weaponGroups.length > 1 && onWeaponTypeChange != null

  return (
    <Card>
      <Portrait>
        {portraitUrl && (
          <PortraitImg src={portraitUrl} alt={character.name} />
        )}
      </Portrait>

      <Info>
        <TitleRow>
          <Text variant="h3" as="h3">
            {weaponName && <strong>{weaponName} </strong>}
            {character.name}
          </Text>
        </TitleRow>

        {showWeaponTabs && (
          <WeaponTabGroup>
            {weaponGroups.map((group) => {
              const mastery = getMasteryByKey(group.weaponType)
              const iconUrl = mastery?.iconUrl ? normalizeImageUrl(mastery.iconUrl) : undefined

              return (
                <WeaponTab
                  key={group.weaponType}
                  type="button"
                  $active={activeWeaponType === group.weaponType}
                  onClick={() => onWeaponTypeChange(group.weaponType)}
                >
                  {iconUrl && <WeaponTabIcon src={iconUrl} alt={mastery?.name} />}
                  {mastery?.name ?? group.weaponType}
                </WeaponTab>
              )
            })}
          </WeaponTabGroup>
        )}

        {skills.length > 0 && (
          <SkillRow>
            {skills.map((skill) => (
              <SkillSlot key={skill.slot} title={skill.name}>
                <SkillIcon src={skill.imageUrl} alt={skill.name} />
                <SlotLabel>{skill.slot}</SlotLabel>
              </SkillSlot>
            ))}
          </SkillRow>
        )}
      </Info>
    </Card>
  )
}

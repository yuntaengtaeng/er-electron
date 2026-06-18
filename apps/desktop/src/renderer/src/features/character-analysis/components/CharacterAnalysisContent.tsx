import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Text } from '@repo/ui'
import { getTacticalSkillById } from '../../../shared/utils/meta'
import { useCharacterAnalysis } from '../hooks/useCharacterAnalysis'
import { CharacterPicker } from './CharacterPicker'
import { CharacterProfileHeader } from './CharacterProfileHeader'
import { CharacterCompareSection } from './CharacterCompareSection'
import { SummaryStatsSection } from './SummaryStatsSection'
import { TeamComboSynergySection } from './TeamComboSynergySection'
import { PickWinTable } from './PickWinTable'
import { TraitGroupsSection } from './TraitGroupsSection'
import { WeaponBuildSection } from './WeaponBuildSection'
import { KillMatchupSection } from './KillMatchupSection'

const LoadingBox = styled.div`
  padding: ${({ theme }) => theme.spacing[12]};
  text-align: center;
`

const EmptyHint = styled.div`
  padding: ${({ theme }) => theme.spacing[8]};
  text-align: center;
`

const MetaSplitRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: start;
  margin-bottom: ${({ theme }) => theme.spacing[8]};

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

type Props = {
  selectedId: number | null
  onSelect: (id: number) => void
}

export const CharacterAnalysisContent = ({ selectedId, onSelect }: Props) => {
  const { result, loading, error } = useCharacterAnalysis(selectedId)
  const [activeWeaponType, setActiveWeaponType] = useState('')

  useEffect(() => {
    if (!result?.weaponTypeGroups.length) {
      setActiveWeaponType('')
      return
    }
    if (!result.weaponTypeGroups.some((g) => g.weaponType === activeWeaponType)) {
      setActiveWeaponType(result.weaponTypeGroups[0]!.weaponType)
    }
  }, [result, activeWeaponType])

  const activeGroup =
    result?.weaponTypeGroups.find((g) => g.weaponType === activeWeaponType) ??
    result?.weaponTypeGroups[0]

  const resolveTactical = useCallback((id: number) => {
    const skill = getTacticalSkillById(id)
    return { name: skill?.name ?? `#${id}`, imageUrl: skill?.imageUrl }
  }, [])

  return (
    <>
      <CharacterPicker selectedId={selectedId} onSelect={onSelect} />

      {selectedId != null && (
        <CharacterProfileHeader
          characterId={selectedId}
          weaponGroups={result?.weaponTypeGroups}
          activeWeaponType={activeGroup?.weaponType}
          onWeaponTypeChange={setActiveWeaponType}
        />
      )}

      {selectedId == null && (
        <EmptyHint>
          <Text variant="body" color="secondary">
            분석할 실험체를 선택하세요.
          </Text>
        </EmptyHint>
      )}

      {selectedId != null && loading && (
        <LoadingBox>
          <Text variant="body" color="secondary">불러오는 중...</Text>
        </LoadingBox>
      )}

      {selectedId != null && !loading && error && (
        <LoadingBox>
          <Text variant="body" color="secondary">{error}</Text>
        </LoadingBox>
      )}

      {selectedId != null && !loading && result && result.games === 0 && (
        <LoadingBox>
          <Text variant="body" color="secondary">
            수집된 랭커 게임에 해당 실험체 데이터가 없습니다.
          </Text>
        </LoadingBox>
      )}

      {selectedId != null && !loading && result && result.games > 0 && activeGroup && (
        <>
          <SummaryStatsSection
            group={activeGroup}
            characterPickRate={result.pickRate}
            totalPoolGames={result.totalPoolGames}
          />

          <CharacterCompareSection
            characterNum={selectedId}
            activeGroup={activeGroup}
          />

          <TeamComboSynergySection characterNum={selectedId} />

          <KillMatchupSection
            killedByMe={activeGroup.killedByMe}
            killedMe={activeGroup.killedMe}
          />

          <MetaSplitRow>
            <PickWinTable
              title="전술 스킬"
              byPick={activeGroup.tacticalSkills.byPick}
              byWinRate={activeGroup.tacticalSkills.byWinRate}
              resolveRow={resolveTactical}
              embedded
            />

            <TraitGroupsSection groups={activeGroup.traitGroups} embedded />
          </MetaSplitRow>

          <WeaponBuildSection group={activeGroup} />
        </>
      )}
    </>
  )
}

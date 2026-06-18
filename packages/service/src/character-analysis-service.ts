import {
  getGameTeamMmrLookup,
  getGamesByCharacter,
  getKillMatchupsForCharacter,
  getTrioRankGameCount,
} from '@repo/club-store'
import {
  aggregateCharacterAnalysis,
  type CharacterAnalysisResult,
  type CharacterGameRow,
} from './character-analysis-utils'

export type {
  CharacterAnalysisResult,
  PickWinRow,
  SlotItemStats,
  TraitCoreGroup,
  TraitSubComboRow,
  FinalBuildRow,
  KillVsRow,
  WeaponTypeGroup,
  WeaponTypeSummary,
  MmrByPlacement,
} from './character-analysis-utils'

const buildMmrLookup = (
  teams: Awaited<ReturnType<typeof getGameTeamMmrLookup>>,
): Map<string, number> => {
  const map = new Map<string, number>()
  for (const team of teams) {
    for (const m of team.members) {
      map.set(`${team.game_id}-${m.character_num}`, m.mmr_gain)
    }
  }
  return map
}

export const getCharacterAnalysis = async (
  characterNum: number,
  getWeaponType: (equipment: Record<string, number>) => string,
  calcCredits: (equipment: Record<string, number>) => number,
): Promise<CharacterAnalysisResult> => {
  const [games, totalPoolGames, teams, killMatchups] = await Promise.all([
    getGamesByCharacter(characterNum),
    getTrioRankGameCount(),
    getGameTeamMmrLookup(),
    getKillMatchupsForCharacter(characterNum),
  ])

  const mmrByGameChar = buildMmrLookup(teams)
  return aggregateCharacterAnalysis(
    games as CharacterGameRow[],
    totalPoolGames,
    characterNum,
    mmrByGameChar,
    killMatchups,
    getWeaponType,
    calcCredits,
  )
}

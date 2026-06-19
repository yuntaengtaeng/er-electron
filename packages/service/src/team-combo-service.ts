import { getGameTeamsForCombos } from '@repo/club-store'
import {
  aggregateTeamCombos,
  computeTeamComboDetail,
  type GameTeamComboRow,
  type TeamComboRow,
  type TeamComboSize,
  type TeamComboSort,
  type TeamComboDetail,
  type RankBucket,
  type CharacterContrib,
} from './team-combo-utils'

export type {
  TeamComboRow,
  TeamComboSize,
  TeamComboSort,
  GameTeamComboRow,
  TeamComboDetail,
  RankBucket,
  CharacterContrib,
}
export { aggregateTeamCombos, computeTeamComboDetail }

export const getTeamComboRows = async (): Promise<GameTeamComboRow[]> =>
  getGameTeamsForCombos()

export const getTeamCombos = async (
  size: TeamComboSize,
  sort: TeamComboSort,
  characterNum?: number | null,
): Promise<TeamComboRow[]> => {
  const rows = await getGameTeamsForCombos()
  return aggregateTeamCombos(rows, size, sort, characterNum)
}

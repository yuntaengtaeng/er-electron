import { getGameTeamsForCombos } from '@repo/club-store'
import {
  aggregateTeamCombos,
  type GameTeamComboRow,
  type TeamComboRow,
  type TeamComboSize,
  type TeamComboSort,
} from './team-combo-utils'

export type { TeamComboRow, TeamComboSize, TeamComboSort, GameTeamComboRow }
export { aggregateTeamCombos }

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

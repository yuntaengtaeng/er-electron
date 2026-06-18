import { getClient } from './client'
import type { ClubMember } from './types'

type Row = Record<string, unknown>

const fromRow = (row: Row): ClubMember => ({
  nickname: row.nickname as string,
  mmr: row.mmr as number,
  rank: (row.rank as number | null) ?? null,
  rankPercent: (row.rank_percent as number | null) ?? null,
  seasonId: row.season_id as number,
  updatedAt: row.updated_at as string,
  representativeCharacterCode: (row.representative_character_code as number | null) ?? null,
})

export const getMemberByNickname = async (nickname: string): Promise<ClubMember | null> => {
  const { data, error } = await getClient()
    .from('club_members')
    .select('*')
    .eq('nickname', nickname)
    .maybeSingle()
  if (error) throw error
  return data ? fromRow(data as Row) : null
}

export const upsertMember = async (member: Omit<ClubMember, 'updatedAt'>): Promise<void> => {
  const { error } = await getClient().from('club_members').upsert({
    nickname: member.nickname,
    mmr: member.mmr,
    rank: member.rank,
    rank_percent: member.rankPercent,
    season_id: member.seasonId,
    updated_at: new Date().toISOString(),
    representative_character_code: member.representativeCharacterCode,
  })
  if (error) throw error
}

export const getAllMembers = async (): Promise<ClubMember[]> => {
  const { data, error } = await getClient()
    .from('club_members')
    .select('*')
    .order('mmr', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => fromRow(row as Row))
}

export type CrawlStatusRow = {
  status: 'idle' | 'collecting' | 'error'
  started_at: string | null
  completed_at: string | null
  progress_current: number
  progress_total: number
  error_message: string | null
}

export type RankerRow = {
  nickname: string
  mmr: number
  rank: number
  collectedAt: string
}

export const getRankers = async (): Promise<RankerRow[]> => {
  const { data, error } = await getClient()
    .from('rankers')
    .select('*')
    .order('rank', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row) => {
    const r = row as Row
    return {
      nickname: r.nickname as string,
      mmr: r.mmr as number,
      rank: r.rank as number,
      collectedAt: r.collected_at as string,
    }
  })
}

export const getAllGames = async (): Promise<Record<string, unknown>[]> => {
  const { data, error } = await getClient()
    .from('games')
    .select('*')
    .order('game_id', { ascending: false })
  if (error) throw error
  return (data ?? []) as Record<string, unknown>[]
}

export const getGamesSince = async (sinceIso: string): Promise<Record<string, unknown>[]> => {
  const { data, error } = await getClient()
    .from('games')
    .select('*')
    .gte('start_dtm', sinceIso)
  if (error) throw error
  return (data ?? []) as Record<string, unknown>[]
}

export const getAllKillMatchups = async (): Promise<Record<string, unknown>[]> => {
  const { data, error } = await getClient()
    .from('kill_matchups')
    .select('*')
    .order('game_id', { ascending: false })
  if (error) throw error
  return (data ?? []) as Record<string, unknown>[]
}

export type TeamMemberSnapshot = {
  character_num: number
  player_kill: number
  player_assistant: number
  mmr_gain: number
}

export type GameTeamComboRow = {
  game_id: number
  team_rank: number
  character_nums: number[]
  members: TeamMemberSnapshot[]
}

export type CharacterGameRow = {
  game_id: number
  game_rank: number
  character_num: number
  player_kill: number
  player_assistant: number
  player_deaths: number
  damage_to_player: number
  play_time: number
  view_contribution: number
  tactical_skill_group: number
  trait_first_core: number
  trait_first_sub: number[]
  trait_second_sub: number[]
  equipment: Record<string, number>
  death_details: string | null
}

const ANALYSIS_GAME_COLUMNS =
  'game_id, game_rank, character_num, player_kill, player_assistant, player_deaths, damage_to_player, play_time, view_contribution, tactical_skill_group, trait_first_core, trait_first_sub, trait_second_sub, equipment, death_details'

const parseCharacterGameRow = (row: Row): CharacterGameRow => ({
  game_id: row.game_id as number,
  game_rank: row.game_rank as number,
  character_num: row.character_num as number,
  player_kill: (row.player_kill as number) ?? 0,
  player_assistant: (row.player_assistant as number) ?? 0,
  player_deaths: (row.player_deaths as number) ?? 0,
  damage_to_player: (row.damage_to_player as number) ?? 0,
  play_time: (row.play_time as number) ?? 0,
  view_contribution: (row.view_contribution as number) ?? 0,
  tactical_skill_group: (row.tactical_skill_group as number) ?? 0,
  trait_first_core: (row.trait_first_core as number) ?? 0,
  trait_first_sub: (row.trait_first_sub as number[]) ?? [],
  trait_second_sub: (row.trait_second_sub as number[]) ?? [],
  equipment: (row.equipment as Record<string, number>) ?? {},
  death_details: (row.death_details as string | null) ?? null,
})

export const getGamesByCharacter = async (characterNum: number): Promise<CharacterGameRow[]> => {
  const { data, error } = await getClient()
    .from('games')
    .select(ANALYSIS_GAME_COLUMNS)
    .eq('matching_team_mode', 3)
    .eq('character_num', characterNum)

  if (error) throw error

  return (data ?? []).map((row) => parseCharacterGameRow(row as Row))
}

export const getTrioRankGameCount = async (): Promise<number> => {
  const { count, error } = await getClient()
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('matching_team_mode', 3)

  if (error) throw error
  return count ?? 0
}

export const getKillMatchupsForCharacter = async (
  characterNum: number,
): Promise<{ game_id: number; killed_char_num: number; count: number }[]> => {
  const { data: gameRows, error: gameError } = await getClient()
    .from('games')
    .select('game_id')
    .eq('matching_team_mode', 3)
    .eq('character_num', characterNum)

  if (gameError) throw gameError

  const gameIds = (gameRows ?? []).map((r) => (r as Row).game_id as number)
  if (gameIds.length === 0) return []

  const { data, error } = await getClient()
    .from('kill_matchups')
    .select('game_id, killed_char_num, count')
    .eq('killer_char_num', characterNum)
    .in('game_id', gameIds)

  if (error) throw error
  return (data ?? []).map((row) => {
    const r = row as Row
    return {
      game_id: r.game_id as number,
      killed_char_num: r.killed_char_num as number,
      count: r.count as number,
    }
  })
}

export const getGameTeamMmrLookup = async (): Promise<
  { game_id: number; members: TeamMemberSnapshot[] }[]
> => {
  const { data, error } = await getClient()
    .from('game_teams')
    .select('game_id, members')

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as Row
    return {
      game_id: r.game_id as number,
      members: (r.members as TeamMemberSnapshot[]) ?? [],
    }
  })
}

export const getGameTeamsForCombos = async (): Promise<GameTeamComboRow[]> => {
  const { data, error } = await getClient()
    .from('game_teams')
    .select('game_id, team_rank, character_nums, members')

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as Row
    return {
      game_id: r.game_id as number,
      team_rank: r.team_rank as number,
      character_nums: (r.character_nums as number[]) ?? [],
      members: (r.members as TeamMemberSnapshot[]) ?? [],
    }
  })
}

export const getCollectedVersions = async (): Promise<number[]> => {
  const { data } = await getClient()
    .from('games')
    .select('version_major')
    .order('version_major', { ascending: false })
  if (!data) return []
  return [...new Set(data.map((r) => (r as Row).version_major as number))]
}

export const getCrawlStatus = async (): Promise<CrawlStatusRow> => {
  const { data } = await getClient()
    .from('crawl_status')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (!data) {
    return { status: 'idle', started_at: null, completed_at: null, progress_current: 0, progress_total: 0, error_message: null }
  }
  const row = data as Row
  return {
    status: (row.status as CrawlStatusRow['status']) ?? 'idle',
    started_at: (row.started_at as string | null) ?? null,
    completed_at: (row.completed_at as string | null) ?? null,
    progress_current: (row.progress_current as number) ?? 0,
    progress_total: (row.progress_total as number) ?? 0,
    error_message: (row.error_message as string | null) ?? null,
  }
}

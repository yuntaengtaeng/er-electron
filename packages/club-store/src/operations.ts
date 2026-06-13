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

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

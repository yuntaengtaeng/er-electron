import { getClient } from './client'

type CompareHistoryRow = { nickname: string; search_count: number; last_searched_at: string }

export const logCompareSearch = async (nickname: string): Promise<void> => {
  const client = getClient()
  const { data } = await client
    .from('compare_history')
    .select('search_count')
    .eq('nickname', nickname)
    .maybeSingle()

  const { error } = await client.from('compare_history').upsert({
    nickname,
    search_count: ((data as Pick<CompareHistoryRow, 'search_count'> | null)?.search_count ?? 0) + 1,
    last_searched_at: new Date().toISOString(),
  })
  if (error) throw error
}

export const getPopularCompareNicknames = async (limit = 10): Promise<string[]> => {
  const { data, error } = await getClient()
    .from('compare_history')
    .select('nickname')
    .order('search_count', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map((r) => (r as Pick<CompareHistoryRow, 'nickname'>).nickname)
}

import {
  initClubStore,
  getMemberByNickname,
  upsertMember,
  getAllMembers,
  getCrawlStatus,
  logCompareSearch,
  getPopularCompareNicknames,
} from '@repo/club-store'
import type { ClubMember, CrawlStatusRow } from '@repo/club-store'

export const initClubService = (supabaseUrl: string, supabaseAnonKey: string): void => {
  initClubStore(supabaseUrl, supabaseAnonKey)
}

export type { ClubMember, CrawlStatusRow }
export { getMemberByNickname, upsertMember, getAllMembers as getAllClubMembers }
export { getCrawlStatus }
export { logCompareSearch, getPopularCompareNicknames }

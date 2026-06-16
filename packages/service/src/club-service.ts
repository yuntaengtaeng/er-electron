import {
  initClubStore,
  getMemberByNickname,
  upsertMember,
  getAllMembers,
  getCrawlStatus,
  getRankers,
  getCollectedVersions,
  logCompareSearch,
  getPopularCompareNicknames,
} from '@repo/club-store'
import type { ClubMember, CrawlStatusRow, RankerRow } from '@repo/club-store'

export const initClubService = (supabaseUrl: string, supabaseAnonKey: string): void => {
  initClubStore(supabaseUrl, supabaseAnonKey)
}

export type { ClubMember, CrawlStatusRow, RankerRow }
export { getMemberByNickname, upsertMember, getAllMembers as getAllClubMembers }
export { getCrawlStatus }
export { getRankers, getCollectedVersions }
export { logCompareSearch, getPopularCompareNicknames }

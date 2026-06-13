import {
  initClubStore,
  getMemberByNickname,
  upsertMember,
  getAllMembers,
} from '@repo/club-store'
import type { ClubMember } from '@repo/club-store'

export const initClubService = (supabaseUrl: string, supabaseAnonKey: string): void => {
  initClubStore(supabaseUrl, supabaseAnonKey)
}

export type { ClubMember }
export { getMemberByNickname, upsertMember, getAllMembers as getAllClubMembers }

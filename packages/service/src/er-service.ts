import { ErApiClient } from "@repo/er-api-client";
import type { UserGame, UserInfo, UserStats, TopRank } from "@repo/er-type";
import { MatchingMode, MatchingTeamMode } from "@repo/er-type";

let erApiClient: ErApiClient;

export function initErService(apiKey: string): void {
  erApiClient = new ErApiClient(apiKey);
}

export const CURRENT_SEASON_ID = 39;

export const getUserByNickname = async (nickname: string): Promise<UserInfo> => {
  return erApiClient.getUserByNickname(nickname);
}

export async function getUserGames(
  userId: string,
  cursor?: number,
): Promise<{ games: UserGame[]; next?: number }> {
  const { data, next } = await erApiClient.getUserGamesByUserId(userId, cursor);
  return { games: data ?? [], next };
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const userStats = await erApiClient.getUserStatsByUserId(
    userId,
    CURRENT_SEASON_ID,
    MatchingMode.Rank,
  );
  if (!userStats.length) return null;
  return userStats.reduce((best, cur) =>
    cur.totalGames > best.totalGames ? cur : best,
  );
}

export async function getTopRankers(matchingTeamMode: MatchingTeamMode): Promise<TopRank[]> {
  return erApiClient.getTopRankers(CURRENT_SEASON_ID, matchingTeamMode);
}

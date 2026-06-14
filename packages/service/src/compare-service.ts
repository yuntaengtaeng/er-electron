import type { UserGame } from "@repo/er-type";
import { MatchingMode } from "@repo/er-type";
import { getUserByNickname, getUserGames } from "./er-service";

export interface ComparePlayerStats {
  nickname: string;
  userId: string;
  avgCredit: number;
  avgRank: number;
  avgDamage: number;
  avgVision: number;
  avgMonsterKill: number;
  avgMasteryLevel: number;
  mmrByPlacement: { rank: number; avgMmrGain: number; gameCount: number }[];
  gamesAnalyzed: number;
}

const avg = (values: number[]): number =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

export const getCompareStats = async (nickname: string): Promise<ComparePlayerStats> => {
  const userInfo = await getUserByNickname(nickname);

  const page1 = await getUserGames(userInfo.userId);
  const ranked: UserGame[] = page1.games.filter((g) => g.matchingMode === MatchingMode.Rank);

  if (ranked.length < 10 && page1.next != null) {
    const page2 = await getUserGames(userInfo.userId, page1.next);
    ranked.push(...page2.games.filter((g) => g.matchingMode === MatchingMode.Rank));
  }

  const games = ranked.slice(0, 10);

  if (!games.length) {
    return {
      nickname,
      userId: userInfo.userId,
      avgCredit: 0,
      avgRank: 0,
      avgDamage: 0,
      avgVision: 0,
      avgMonsterKill: 0,
      avgMasteryLevel: 0,
      mmrByPlacement: [],
      gamesAnalyzed: 0,
    };
  }

  const placementMap = new Map<number, number[]>();
  for (const g of games) {
    const existing = placementMap.get(g.gameRank) ?? [];
    existing.push(g.mmrGain);
    placementMap.set(g.gameRank, existing);
  }

  const mmrByPlacement = [...placementMap.entries()]
    .map(([rank, gains]) => ({ rank, avgMmrGain: avg(gains), gameCount: gains.length }))
    .sort((a, b) => a.rank - b.rank);

  return {
    nickname,
    userId: userInfo.userId,
    // activelyGainedCredits는 랭크 게임에서 플레이어가 획득한 크레딧
    avgCredit: avg(games.map((g) => g.activelyGainedCredits)),
    avgRank: avg(games.map((g) => g.gameRank)),
    avgDamage: avg(games.map((g) => g.damageToPlayer)),
    avgVision: avg(games.map((g) => g.viewContribution)),
    avgMonsterKill: avg(games.map((g) => g.monsterKill)),
    avgMasteryLevel: avg(games.map((g) => g.bestWeaponLevel)),
    mmrByPlacement,
    gamesAnalyzed: games.length,
  };
};

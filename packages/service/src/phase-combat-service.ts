import { MatchingMode } from "@repo/er-type";
import { getUserByNickname, getUserGames } from "./er-service";

export interface CombatGame {
  characterNum: number;
  gameRank: number;
  playTime: number;
}

export interface AreaDeathStat {
  areaKey: string;
  count: number;
  topKillerKey: string | null;
}

export interface PhaseCombatResult {
  nickname: string;
  gamesAnalyzed: number;
  winCount: number;
  avgPlayTime: number;
  killerCharacterCounts: Record<string, number>;
  killedCharacterCounts: Record<number, number>;
  deathAreaStats: AreaDeathStat[];
  games: CombatGame[];
}

const avg = (nums: number[]) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

const parseKillDetails = (raw: string): Array<{ charId: number; count: number }> => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return Object.entries(parsed as Record<string, number>)
        .map(([key, count]) => ({ charId: Number(key), count }))
        .filter((e) => e.charId > 0 && e.count > 0);
    }
    if (Array.isArray(parsed)) {
      return (parsed as Array<Record<string, unknown>>)
        .map((e) => ({
          charId: Number(e.characterNum ?? e.charNum ?? 0),
          count: Number(e.count ?? 1),
        }))
        .filter((e) => e.charId > 0);
    }
  } catch { /**/ }
  return [];
};

export const getPhaseCombat = async (
  nickname: string,
): Promise<PhaseCombatResult> => {
  const userInfo = await getUserByNickname(nickname);

  const page1 = await getUserGames(userInfo.userId);
  const ranked = page1.games.filter(
    (g) => g.matchingMode === MatchingMode.Rank,
  );

  if (ranked.length < 20 && page1.next != null) {
    const page2 = await getUserGames(userInfo.userId, page1.next);
    ranked.push(
      ...page2.games.filter((g) => g.matchingMode === MatchingMode.Rank),
    );
  }

  const killerCharacterCounts: Record<string, number> = {};
  const killedCharacterCounts: Record<number, number> = {};
  const deathAreaMap = new Map<string, number>();
  const areaKillerMap = new Map<string, Map<string, number>>();

  for (const g of ranked) {
    if (g.killerCharacter) {
      killerCharacterCounts[g.killerCharacter] =
        (killerCharacterCounts[g.killerCharacter] ?? 0) + 1;
    }
    for (const { charId, count } of parseKillDetails(g.killDetails)) {
      killedCharacterCounts[charId] = (killedCharacterCounts[charId] ?? 0) + count;
    }
    if (g.gameRank !== 1 && g.placeOfDeath) {
      deathAreaMap.set(g.placeOfDeath, (deathAreaMap.get(g.placeOfDeath) ?? 0) + 1);
      if (g.killerCharacter) {
        const killerMap = areaKillerMap.get(g.placeOfDeath) ?? new Map<string, number>();
        killerMap.set(g.killerCharacter, (killerMap.get(g.killerCharacter) ?? 0) + 1);
        areaKillerMap.set(g.placeOfDeath, killerMap);
      }
    }
  }

  return {
    nickname,
    gamesAnalyzed: ranked.length,
    winCount: ranked.filter((g) => g.gameRank === 1).length,
    avgPlayTime: avg(ranked.map((g) => g.playTime)),
    killerCharacterCounts,
    killedCharacterCounts,
    deathAreaStats: Array.from(deathAreaMap.entries())
      .map(([areaKey, count]) => {
        const killerMap = areaKillerMap.get(areaKey);
        let topKillerKey: string | null = null;
        if (killerMap) {
          let max = 0;
          for (const [key, cnt] of killerMap) {
            if (cnt > max) { max = cnt; topKillerKey = key; }
          }
        }
        return { areaKey, count, topKillerKey };
      })
      .sort((a, b) => b.count - a.count),
    games: ranked.map((g) => ({
      characterNum: g.characterNum,
      gameRank: g.gameRank,
      playTime: g.playTime,
    })),
  };
};

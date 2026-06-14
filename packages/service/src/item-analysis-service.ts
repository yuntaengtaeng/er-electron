import type { UserGame } from "@repo/er-type";
import { MatchingMode } from "@repo/er-type";
import { getUserByNickname, getUserGames } from "./er-service";


export interface SlotItemStat {
  itemId: number;
  count: number;
}

export interface WeaponTypeAnalysis {
  weaponType: string;
  gamesAnalyzed: number;
  slotItems: Record<string, SlotItemStat[]>;
  avgItemCredits: number;
  avgDamage: number;
  damageEfficiency: number;
  tankEfficiency: number;
}

export interface CharacterItemAnalysis {
  characterNum: number;
  gamesAnalyzed: number;
  weaponTypes: WeaponTypeAnalysis[];
}

export interface ItemAnalysisResult {
  nickname: string;
  userId: string;
  characters: CharacterItemAnalysis[];
}

const avg = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

const buildWeaponTypeAnalysis = (
  weaponType: string,
  games: UserGame[],
  calcCredits: (equipment: Record<string, number>) => number
): WeaponTypeAnalysis => {
  const slotMap: Record<string, Map<number, number>> = {};
  for (const game of games) {
    for (const [slot, itemId] of Object.entries(game.equipment)) {
      if (itemId <= 0) continue;
      if (!slotMap[slot]) slotMap[slot] = new Map();
      slotMap[slot].set(itemId, (slotMap[slot].get(itemId) ?? 0) + 1);
    }
  }

  const slotItems: Record<string, SlotItemStat[]> = {};
  for (const [slot, map] of Object.entries(slotMap)) {
    slotItems[slot] = [...map.entries()]
      .map(([itemId, count]) => ({ itemId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  return {
    weaponType,
    gamesAnalyzed: games.length,
    slotItems,
    avgItemCredits: avg(games.map((g) => calcCredits(g.equipment))),
    avgDamage: avg(games.map((g) => g.damageToPlayer)),
    damageEfficiency: avg(
      games
        .map((g) => ({ damage: g.damageToPlayer, credits: calcCredits(g.equipment) }))
        .filter(({ credits }) => credits > 0)
        .map(({ damage, credits }) => damage / credits)
    ),
    tankEfficiency: avg(
      games
        .map((g) => ({
          tanked: g.damageFromPlayer + g.damageOffsetedByShield_Player,
          credits: calcCredits(g.equipment),
        }))
        .filter(({ credits }) => credits > 0)
        .map(({ tanked, credits }) => tanked / credits)
    ),
  };
};

export const getItemAnalysis = async (
  nickname: string,
  calcCredits: (equipment: Record<string, number>) => number,
  getWeaponType: (equipment: Record<string, number>) => string
): Promise<ItemAnalysisResult> => {
  const userInfo = await getUserByNickname(nickname);

  const page1 = await getUserGames(userInfo.userId);
  const ranked = page1.games.filter((g) => g.matchingMode === MatchingMode.Rank);

  if (ranked.length < 20 && page1.next != null) {
    const page2 = await getUserGames(userInfo.userId, page1.next);
    ranked.push(...page2.games.filter((g) => g.matchingMode === MatchingMode.Rank));
  }

  // Group by characterNum
  const charMap = new Map<number, UserGame[]>();
  for (const game of ranked) {
    const existing = charMap.get(game.characterNum) ?? [];
    existing.push(game);
    charMap.set(game.characterNum, existing);
  }

  const characters: CharacterItemAnalysis[] = [...charMap.entries()]
    .map(([characterNum, games]) => {
      // Group by weapon type within character
      const weaponMap = new Map<string, UserGame[]>();
      for (const game of games) {
        const wt = getWeaponType(game.equipment);
        const existing = weaponMap.get(wt) ?? [];
        existing.push(game);
        weaponMap.set(wt, existing);
      }

      const weaponTypes = [...weaponMap.entries()]
        .map(([weaponType, wGames]) => buildWeaponTypeAnalysis(weaponType, wGames, calcCredits))
        .sort((a, b) => b.gamesAnalyzed - a.gamesAnalyzed);

      return { characterNum, gamesAnalyzed: games.length, weaponTypes };
    })
    .sort((a, b) => b.gamesAnalyzed - a.gamesAnalyzed);

  return { nickname, userId: userInfo.userId, characters };
};

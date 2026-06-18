import type { UserGame } from '@repo/er-type'
import { MatchingMode, MatchingTeamMode } from '@repo/er-type'
import { getUserByNickname, getUserGames } from './er-service'
import type { MmrByPlacement, WeaponTypeGroup } from './character-analysis-utils'

export type { MmrByPlacement }

export type SlotItemPick = {
  itemId: number
  pickRate: number
}

export type CharacterCompareSide = {
  label: string
  games: number
  avgKills: number
  avgAssists: number
  avgDeaths: number
  avgKda: number
  avgVision: number
  avgRank: number
  winRate: number
  avgItemCredits: number
  avgDamage: number
  mmrByPlacement: MmrByPlacement[]
  topItemsBySlot: Record<string, SlotItemPick[]>
}

const SLOT_KEYS = ['0', '1', '2', '3', '4'] as const

const avg = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0

const avgKdaForGame = (kill: number, assist: number, death: number) =>
  (kill + assist) / Math.max(death, 1)

const emptySide = (label: string): CharacterCompareSide => ({
  label,
  games: 0,
  avgKills: 0,
  avgAssists: 0,
  avgDeaths: 0,
  avgKda: 0,
  avgVision: 0,
  avgRank: 0,
  winRate: 0,
  avgItemCredits: 0,
  avgDamage: 0,
  mmrByPlacement: [],
  topItemsBySlot: {},
})

const buildCompareSideFromGames = (
  label: string,
  games: UserGame[],
  calcCredits: (equipment: Record<string, number>) => number,
): CharacterCompareSide => {
  if (games.length === 0) return emptySide(label)

  const placementMmr = new Map<number, number[]>()
  const slotCounts: Record<string, Map<number, number>> = Object.fromEntries(
    SLOT_KEYS.map((s) => [s, new Map<number, number>()]),
  ) as Record<string, Map<number, number>>

  let wins = 0
  for (const g of games) {
    if (g.gameRank === 1) wins += 1
    const gains = placementMmr.get(g.gameRank) ?? []
    gains.push(g.mmrGain)
    placementMmr.set(g.gameRank, gains)

    for (const slot of SLOT_KEYS) {
      const itemId = g.equipment[slot] ?? 0
      if (itemId > 0) {
        const map = slotCounts[slot]!
        map.set(itemId, (map.get(itemId) ?? 0) + 1)
      }
    }
  }

  const pool = games.length
  const topItemsBySlot: Record<string, SlotItemPick[]> = {}
  for (const slot of SLOT_KEYS) {
    topItemsBySlot[slot] = [...slotCounts[slot]!.entries()]
      .map(([itemId, count]) => ({
        itemId,
        pickRate: (count / pool) * 100,
      }))
      .sort((a, b) => b.pickRate - a.pickRate)
      .slice(0, 3)
  }

  const mmrByPlacement: MmrByPlacement[] = [...placementMmr.entries()]
    .map(([rank, gains]) => ({
      rank,
      avgMmrGain: avg(gains),
      gameCount: gains.length,
    }))
    .sort((a, b) => a.rank - b.rank)

  return {
    label,
    games: pool,
    avgKills: avg(games.map((g) => g.playerKill)),
    avgAssists: avg(games.map((g) => g.playerAssistant)),
    avgDeaths: avg(games.map((g) => g.playerDeaths)),
    avgKda: avg(
      games.map((g) => avgKdaForGame(g.playerKill, g.playerAssistant, g.playerDeaths)),
    ),
    avgVision: avg(games.map((g) => g.viewContribution)),
    avgRank: avg(games.map((g) => g.gameRank)),
    winRate: (wins / pool) * 100,
    avgItemCredits: avg(games.map((g) => calcCredits(g.equipment))),
    avgDamage: avg(games.map((g) => g.damageToPlayer)),
    mmrByPlacement,
    topItemsBySlot,
  }
}

export const weaponGroupToCompareSide = (group: WeaponTypeGroup): CharacterCompareSide => {
  const topItemsBySlot: Record<string, SlotItemPick[]> = {}
  for (const slot of group.slotItems) {
    topItemsBySlot[slot.slot] = slot.byPick.slice(0, 3).map((row) => ({
      itemId: row.id,
      pickRate: row.pickRate,
    }))
  }

  return {
    label: '랭커',
    games: group.games,
    avgKills: group.summary.avgKills,
    avgAssists: group.summary.avgAssists,
    avgDeaths: group.summary.avgDeaths,
    avgKda: group.summary.avgKda,
    avgVision: group.summary.avgVision,
    avgRank: group.summary.avgRank,
    winRate: group.summary.winRate,
    avgItemCredits: group.summary.avgItemCredits,
    avgDamage: group.summary.avgDamage,
    mmrByPlacement: group.summary.mmrByPlacement,
    topItemsBySlot,
  }
}

export const getPlayerCharacterWeaponStats = async (
  nickname: string,
  characterNum: number,
  weaponType: string,
  getWeaponType: (equipment: Record<string, number>) => string,
  calcCredits: (equipment: Record<string, number>) => number,
): Promise<CharacterCompareSide> => {
  const userInfo = await getUserByNickname(nickname)

  const page1 = await getUserGames(userInfo.userId)
  const isTrioRank = (g: UserGame) =>
    g.matchingMode === MatchingMode.Rank && g.matchingTeamMode === MatchingTeamMode.Trio

  const ranked: UserGame[] = page1.games.filter(isTrioRank)

  if (ranked.length < 20 && page1.next != null) {
    const page2 = await getUserGames(userInfo.userId, page1.next)
    ranked.push(...page2.games.filter(isTrioRank))
  }

  const filtered = ranked.filter(
    (g) =>
      g.characterNum === characterNum && getWeaponType(g.equipment) === weaponType,
  )

  return buildCompareSideFromGames(nickname, filtered, calcCredits)
}

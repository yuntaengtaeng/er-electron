export type CharacterGameRow = {
  game_id: number
  game_rank: number
  character_num: number
  player_kill: number
  player_assistant: number
  player_deaths: number
  damage_to_player: number
  play_time: number
  view_contribution: number
  tactical_skill_group: number
  trait_first_core: number
  trait_first_sub: number[]
  trait_second_sub: number[]
  equipment: Record<string, number>
  death_details: string | null
}

export type PickWinRow = {
  id: number
  games: number
  wins: number
  pickRate: number
  winRate: number
}

export type FinalBuildRow = {
  itemIds: number[]
  games: number
  wins: number
  pickRate: number
  winRate: number
}

export type TraitSubComboRow = {
  firstSub: number[]
  secondSub: number[]
  games: number
  wins: number
  pickRate: number
  winRate: number
}

export type TraitCoreGroup = {
  coreId: number
  games: number
  wins: number
  pickRate: number
  winRate: number
  subCombos: TraitSubComboRow[]
}

export type SlotItemStats = {
  slot: string
  byPick: PickWinRow[]
  byWinRate: PickWinRow[]
}

export type KillVsRow = {
  characterNum: number
  count: number
}

export type MmrByPlacement = {
  rank: number
  avgMmrGain: number
  gameCount: number
}

export type WeaponTypeSummary = {
  avgKills: number
  avgAssists: number
  avgDeaths: number
  avgKda: number
  avgVision: number
  avgRank: number
  winRate: number
  avgItemCredits: number
  avgMmrGain: number
  avgDamage: number
  avgPlayTime: number
  mmrByPlacement: MmrByPlacement[]
}

export type WeaponTypeGroup = {
  weaponType: string
  games: number
  pickRate: number
  summary: WeaponTypeSummary
  tacticalSkills: { byPick: PickWinRow[]; byWinRate: PickWinRow[] }
  traitGroups: TraitCoreGroup[]
  finalBuilds: { byPick: FinalBuildRow[]; byWinRate: FinalBuildRow[] }
  slotItems: SlotItemStats[]
  killedByMe: KillVsRow[]
  killedMe: KillVsRow[]
}

export type CharacterAnalysisResult = {
  characterNum: number
  games: number
  totalPoolGames: number
  pickRate: number
  weaponTypeGroups: WeaponTypeGroup[]
}

const SLOT_KEYS = ['0', '1', '2', '3', '4'] as const

type Acc = { games: number; wins: number }

const win = (gameRank: number) => gameRank === 1

const rate = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0)

const avg = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0

const bump = (map: Map<number, Acc>, id: number, won: boolean) => {
  if (id <= 0) return
  const acc = map.get(id) ?? { games: 0, wins: 0 }
  acc.games += 1
  if (won) acc.wins += 1
  map.set(id, acc)
}

const bumpKey = (map: Map<string, Acc>, key: string, won: boolean) => {
  const acc = map.get(key) ?? { games: 0, wins: 0 }
  acc.games += 1
  if (won) acc.wins += 1
  map.set(key, acc)
}

const toPickWinRows = (map: Map<number, Acc>, pool: number): PickWinRow[] =>
  Array.from(map.entries()).map(([id, acc]) => ({
    id,
    games: acc.games,
    wins: acc.wins,
    pickRate: rate(acc.games, pool),
    winRate: rate(acc.wins, acc.games),
  }))

const sortByPick = <T extends { games: number; winRate?: number; pickRate?: number }>(rows: T[]) =>
  [...rows].sort((a, b) => b.games - a.games || (b.winRate ?? 0) - (a.winRate ?? 0))

const sortByWinRate = <T extends { games: number; winRate: number }>(rows: T[]) =>
  [...rows].sort((a, b) => b.winRate - a.winRate || b.games - a.games)

const sortedNums = (ids: number[]) => [...ids].filter((id) => id > 0).sort((a, b) => a - b)

const subComboKey = (firstSub: number[], secondSub: number[]) =>
  `${sortedNums(firstSub).join(',')}|${sortedNums(secondSub).join(',')}`

const buildKey = (equipment: Record<string, number>) =>
  SLOT_KEYS.map((slot) => equipment[slot] ?? 0).join('-')

const parseItemIdsFromBuildKey = (key: string): number[] => key.split('-').map(Number)

const parseDeathDetails = (raw: string | null): Record<string, number> => {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, number>
  } catch {
    return {}
  }
}

const aggregateKills = (map: Map<number, number>, topN = 5): KillVsRow[] =>
  [...map.entries()]
    .map(([characterNum, count]) => ({ characterNum, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)

const avgKdaForGame = (kill: number, assist: number, death: number) =>
  (kill + assist) / Math.max(death, 1)

type WeaponGroupAcc = {
  games: number
  wins: number
  kills: number[]
  assists: number[]
  deaths: number[]
  vision: number[]
  ranks: number[]
  credits: number[]
  damage: number[]
  playTime: number[]
  mmrValues: number[]
  placementMmr: Map<number, number[]>
  gameIds: number[]
  tacticalMap: Map<number, Acc>
  coreMap: Map<number, Acc>
  subByCore: Map<number, Map<string, Acc>>
  killedMeMap: Map<number, number>
  buildMap: Map<string, Acc>
  slotMaps: Record<string, Map<number, Acc>>
}

const createWeaponGroupAcc = (): WeaponGroupAcc => ({
  games: 0,
  wins: 0,
  kills: [],
  assists: [],
  deaths: [],
  vision: [],
  ranks: [],
  credits: [],
  damage: [],
  playTime: [],
  mmrValues: [],
  placementMmr: new Map(),
  gameIds: [],
  tacticalMap: new Map(),
  coreMap: new Map(),
  subByCore: new Map(),
  killedMeMap: new Map(),
  buildMap: new Map(),
  slotMaps: Object.fromEntries(SLOT_KEYS.map((s) => [s, new Map<number, Acc>()])) as Record<
    string,
    Map<number, Acc>
  >,
})

const buildMmrByPlacement = (map: Map<number, number[]>): MmrByPlacement[] =>
  [...map.entries()]
    .map(([rank, gains]) => ({
      rank,
      avgMmrGain: avg(gains),
      gameCount: gains.length,
    }))
    .sort((a, b) => a.rank - b.rank)

const buildWeaponSummary = (acc: WeaponGroupAcc): WeaponTypeSummary => ({
  avgKills: avg(acc.kills),
  avgAssists: avg(acc.assists),
  avgDeaths: avg(acc.deaths),
  avgKda: avg(acc.kills.map((k, i) => avgKdaForGame(k, acc.assists[i] ?? 0, acc.deaths[i] ?? 0))),
  avgVision: avg(acc.vision),
  avgRank: avg(acc.ranks),
  winRate: rate(acc.wins, acc.games),
  avgItemCredits: avg(acc.credits),
  avgMmrGain: avg(acc.mmrValues),
  avgDamage: avg(acc.damage),
  avgPlayTime: avg(acc.playTime),
  mmrByPlacement: buildMmrByPlacement(acc.placementMmr),
})

const buildTraitGroups = (
  coreMap: Map<number, Acc>,
  subByCore: Map<number, Map<string, Acc>>,
  pool: number,
): TraitCoreGroup[] =>
  [...coreMap.entries()]
    .map(([coreId, coreAcc]) => {
      const subMap = subByCore.get(coreId) ?? new Map<string, Acc>()
      const subCombos: TraitSubComboRow[] = [...subMap.entries()].map(([key, subAcc]) => {
        const [firstPart, secondPart] = key.split('|')
        return {
          firstSub: firstPart ? firstPart.split(',').map(Number).filter((n) => n > 0) : [],
          secondSub: secondPart ? secondPart.split(',').map(Number).filter((n) => n > 0) : [],
          games: subAcc.games,
          wins: subAcc.wins,
          pickRate: rate(subAcc.games, coreAcc.games),
          winRate: rate(subAcc.wins, subAcc.games),
        }
      })

      return {
        coreId,
        games: coreAcc.games,
        wins: coreAcc.wins,
        pickRate: rate(coreAcc.games, pool),
        winRate: rate(coreAcc.wins, coreAcc.games),
        subCombos: sortByPick(subCombos),
      }
    })
    .sort((a, b) => b.games - a.games)

const buildKilledByMe = (
  gameIds: Set<number>,
  killMatchups: { game_id: number; killed_char_num: number; count: number }[],
): KillVsRow[] => {
  const map = new Map<number, number>()
  for (const row of killMatchups) {
    if (!gameIds.has(row.game_id)) continue
    map.set(row.killed_char_num, (map.get(row.killed_char_num) ?? 0) + row.count)
  }
  return aggregateKills(map)
}

const weaponGroupToResult = (
  weaponType: string,
  acc: WeaponGroupAcc,
  charPool: number,
  killMatchups: { game_id: number; killed_char_num: number; count: number }[],
): WeaponTypeGroup => {
  const wtPool = acc.games
  const finalBuilds: FinalBuildRow[] = [...acc.buildMap.entries()].map(([key, buildAcc]) => ({
    itemIds: parseItemIdsFromBuildKey(key),
    games: buildAcc.games,
    wins: buildAcc.wins,
    pickRate: rate(buildAcc.games, wtPool),
    winRate: rate(buildAcc.wins, buildAcc.games),
  }))

  const tacticalRows = toPickWinRows(acc.tacticalMap, wtPool)

  return {
    weaponType,
    games: wtPool,
    pickRate: rate(wtPool, charPool),
    summary: buildWeaponSummary(acc),
    tacticalSkills: {
      byPick: sortByPick(tacticalRows),
      byWinRate: sortByWinRate(tacticalRows),
    },
    traitGroups: buildTraitGroups(acc.coreMap, acc.subByCore, wtPool),
    finalBuilds: {
      byPick: sortByPick(finalBuilds),
      byWinRate: sortByWinRate(finalBuilds),
    },
    slotItems: SLOT_KEYS.map((slot) => {
      const rows = toPickWinRows(acc.slotMaps[slot]!, wtPool)
      return {
        slot,
        byPick: sortByPick(rows),
        byWinRate: sortByWinRate(rows),
      }
    }),
    killedByMe: buildKilledByMe(new Set(acc.gameIds), killMatchups),
    killedMe: aggregateKills(acc.killedMeMap),
  }
}

export const aggregateCharacterAnalysis = (
  games: CharacterGameRow[],
  totalPoolGames: number,
  characterNum: number,
  mmrByGameChar: Map<string, number>,
  killMatchups: { game_id: number; killed_char_num: number; count: number }[],
  getWeaponType: (equipment: Record<string, number>) => string,
  calcCredits: (equipment: Record<string, number>) => number,
): CharacterAnalysisResult => {
  const charGames = games.filter((g) => g.character_num === characterNum)
  const pool = charGames.length

  const weaponGroups = new Map<string, WeaponGroupAcc>()

  for (const g of charGames) {
    const won = win(g.game_rank)
    const mmr = mmrByGameChar.get(`${g.game_id}-${g.character_num}`)
    const weaponType = getWeaponType(g.equipment)
    const wtAcc = weaponGroups.get(weaponType) ?? createWeaponGroupAcc()

    wtAcc.games += 1
    wtAcc.gameIds.push(g.game_id)
    if (won) wtAcc.wins += 1
    wtAcc.kills.push(g.player_kill)
    wtAcc.assists.push(g.player_assistant)
    wtAcc.deaths.push(g.player_deaths)
    wtAcc.vision.push(g.view_contribution)
    wtAcc.ranks.push(g.game_rank)
    wtAcc.credits.push(calcCredits(g.equipment))
    wtAcc.damage.push(g.damage_to_player)
    wtAcc.playTime.push(g.play_time)

    if (mmr != null) {
      wtAcc.mmrValues.push(mmr)
      const placementGains = wtAcc.placementMmr.get(g.game_rank) ?? []
      placementGains.push(mmr)
      wtAcc.placementMmr.set(g.game_rank, placementGains)
    }

    bump(wtAcc.tacticalMap, g.tactical_skill_group, won)
    bumpKey(wtAcc.buildMap, buildKey(g.equipment), won)

    for (const slot of SLOT_KEYS) {
      const itemId = g.equipment[slot] ?? 0
      if (itemId > 0) bump(wtAcc.slotMaps[slot]!, itemId, won)
    }

    const coreId = g.trait_first_core
    if (coreId > 0) {
      bump(wtAcc.coreMap, coreId, won)
      const subKey = subComboKey(g.trait_first_sub ?? [], g.trait_second_sub ?? [])
      const coreSubs = wtAcc.subByCore.get(coreId) ?? new Map<string, Acc>()
      bumpKey(coreSubs, subKey, won)
      wtAcc.subByCore.set(coreId, coreSubs)
    }

    for (const [charStr, count] of Object.entries(parseDeathDetails(g.death_details))) {
      const id = parseInt(charStr, 10)
      if (!Number.isNaN(id) && id > 0) {
        wtAcc.killedMeMap.set(id, (wtAcc.killedMeMap.get(id) ?? 0) + count)
      }
    }

    weaponGroups.set(weaponType, wtAcc)
  }

  const weaponTypeGroups = [...weaponGroups.entries()]
    .map(([weaponType, acc]) => weaponGroupToResult(weaponType, acc, pool, killMatchups))
    .sort((a, b) => b.games - a.games)

  return {
    characterNum,
    games: pool,
    totalPoolGames,
    pickRate: rate(pool, totalPoolGames),
    weaponTypeGroups,
  }
}

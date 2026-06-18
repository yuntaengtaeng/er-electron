export type TeamMemberSnapshot = {
  character_num: number
  player_kill: number
  player_assistant: number
  mmr_gain: number
}

export type GameTeamComboRow = {
  game_id: number
  team_rank: number
  character_nums: number[]
  members: TeamMemberSnapshot[]
}

export type TeamComboSort = 'rank1Rate' | 'mmrGain' | 'kills'

export type TeamComboSize = 2 | 3

export type TeamComboRow = {
  characterNums: number[]
  games: number
  rank1Count: number
  rank2Count: number
  rank3Count: number
  rank1Rate: number
  rank2Rate: number
  rank3Rate: number
  avgMmrGain: number
  avgKills: number
}

const comboKey = (nums: number[]): string => [...nums].sort((a, b) => a - b).join('-')

const combosFromTeam = (characterNums: number[], size: TeamComboSize): number[][] => {
  const chars = [...new Set(characterNums)]
  if (chars.length < size) return []

  if (size === 3) {
    return [chars.sort((a, b) => a - b)]
  }

  const pairs: number[][] = []
  for (let i = 0; i < chars.length; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      pairs.push([chars[i]!, chars[j]!].sort((a, b) => a - b))
    }
  }
  return pairs
}

const avg = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0

const rate = (count: number, games: number) => (games > 0 ? (count / games) * 100 : 0)

export const aggregateTeamCombos = (
  rows: GameTeamComboRow[],
  size: TeamComboSize,
  sort: TeamComboSort,
  characterNum?: number | null,
): TeamComboRow[] => {
  type Acc = {
    games: number
    rank1: number
    rank2: number
    rank3: number
    mmrSum: number
    killSum: number
  }
  const accMap = new Map<string, Acc>()
  const seen = new Set<string>()

  for (const row of rows) {
    const members = row.members ?? []
    const chars = row.character_nums ?? []
    if (chars.length < size) continue
    if (characterNum != null && !chars.includes(characterNum)) continue

    for (const combo of combosFromTeam(chars, size)) {
      if (characterNum != null && !combo.includes(characterNum)) continue

      const key = comboKey(combo)
      const dedupeKey = `${row.game_id}-${key}`
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      const subset = members.filter((m) => combo.includes(m.character_num))
      const acc = accMap.get(key) ?? {
        games: 0,
        rank1: 0,
        rank2: 0,
        rank3: 0,
        mmrSum: 0,
        killSum: 0,
      }
      acc.games += 1
      if (row.team_rank === 1) acc.rank1 += 1
      if (row.team_rank === 2) acc.rank2 += 1
      if (row.team_rank === 3) acc.rank3 += 1
      acc.mmrSum += avg(subset.map((m) => m.mmr_gain))
      acc.killSum += avg(subset.map((m) => m.player_kill))
      accMap.set(key, acc)
    }
  }

  const result: TeamComboRow[] = Array.from(accMap.entries()).map(([key, acc]) => ({
    characterNums: key.split('-').map(Number),
    games: acc.games,
    rank1Count: acc.rank1,
    rank2Count: acc.rank2,
    rank3Count: acc.rank3,
    rank1Rate: rate(acc.rank1, acc.games),
    rank2Rate: rate(acc.rank2, acc.games),
    rank3Rate: rate(acc.rank3, acc.games),
    avgMmrGain: acc.games > 0 ? acc.mmrSum / acc.games : 0,
    avgKills: acc.games > 0 ? acc.killSum / acc.games : 0,
  }))

  const compare = (a: TeamComboRow, b: TeamComboRow): number => {
    if (sort === 'rank1Rate') return b.rank1Rate - a.rank1Rate || b.games - a.games
    if (sort === 'mmrGain') return b.avgMmrGain - a.avgMmrGain || b.games - a.games
    return b.avgKills - a.avgKills || b.games - a.games
  }

  return result.sort(compare)
}

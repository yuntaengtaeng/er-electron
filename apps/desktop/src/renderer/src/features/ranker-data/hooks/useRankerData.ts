import { useEffect, useRef, useState } from 'react'
import { getRankers, getCollectedVersions, getAllGames, getAllKillMatchups } from '@repo/service'
import type { RankerRow } from '@repo/service'

export type TabKey = 'rankers' | 'games' | 'matchups'

export type RankerDataState = {
  tab: TabKey
  setTab: (t: TabKey) => void
  rankers: RankerRow[]
  versions: number[]
  games: Record<string, unknown>[]
  matchups: Record<string, unknown>[]
  loading: boolean
  gamesLoading: boolean
  matchupsLoading: boolean
  error: string | null
}

export const useRankerData = (): RankerDataState => {
  const [tab, setTabState] = useState<TabKey>('rankers')
  const [rankers, setRankers] = useState<RankerRow[]>([])
  const [versions, setVersions] = useState<number[]>([])
  const [games, setGames] = useState<Record<string, unknown>[]>([])
  const [matchups, setMatchups] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [gamesLoading, setGamesLoading] = useState(false)
  const [matchupsLoading, setMatchupsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const gamesLoaded = useRef(false)
  const matchupsLoaded = useRef(false)

  useEffect(() => {
    Promise.all([getRankers(), getCollectedVersions()])
      .then(([r, v]) => { setRankers(r); setVersions(v) })
      .catch((e: Error) => setError(e.message ?? '데이터 로드 실패'))
      .finally(() => setLoading(false))
  }, [])

  const setTab = async (t: TabKey) => {
    setTabState(t)
    if (t === 'games' && !gamesLoaded.current) {
      gamesLoaded.current = true
      setGamesLoading(true)
      try { setGames(await getAllGames()) }
      catch { /* ignore */ }
      finally { setGamesLoading(false) }
    }
    if (t === 'matchups' && !matchupsLoaded.current) {
      matchupsLoaded.current = true
      setMatchupsLoading(true)
      try { setMatchups(await getAllKillMatchups()) }
      catch { /* ignore */ }
      finally { setMatchupsLoading(false) }
    }
  }

  return { tab, setTab, rankers, versions, games, matchups, loading, gamesLoading, matchupsLoading, error }
}

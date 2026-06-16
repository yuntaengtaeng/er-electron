import { useEffect, useState } from 'react'
import { getRankers, getCollectedVersions } from '@repo/service'
import type { RankerRow } from '@repo/service'

export type RankerDataState = {
  rankers: RankerRow[]
  versions: number[]
  loading: boolean
  error: string | null
}

export const useRankerData = (): RankerDataState => {
  const [rankers, setRankers] = useState<RankerRow[]>([])
  const [versions, setVersions] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getRankers(), getCollectedVersions()])
      .then(([r, v]) => {
        setRankers(r)
        setVersions(v)
      })
      .catch((e: Error) => setError(e.message ?? '데이터 로드 실패'))
      .finally(() => setLoading(false))
  }, [])

  return { rankers, versions, loading, error }
}

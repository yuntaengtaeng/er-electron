import { useEffect, useMemo, useState } from 'react'
import { aggregateTeamCombos, getTeamComboRows } from '@repo/service'
import type { TeamComboRow, TeamComboSize, TeamComboSort } from '@repo/service'

export const useTeamCombos = (
  size: TeamComboSize,
  sort: TeamComboSort,
  characterNum: number | null,
) => {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof getTeamComboRows>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getTeamComboRows()
      .then(setRows)
      .catch(() => setError('조합 데이터를 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [])

  const combos: TeamComboRow[] = useMemo(
    () => aggregateTeamCombos(rows, size, sort, characterNum),
    [rows, size, sort, characterNum],
  )

  return { combos, rows, loading, error }
}

import { useEffect, useState } from 'react'
import { getCharacterAnalysis } from '@repo/service'
import type { CharacterAnalysisResult } from '@repo/service'
import { calcItemCredits, getWeaponTypeFromEquipment } from '../../../shared/utils/meta'

export const useCharacterAnalysis = (characterNum: number | null) => {
  const [result, setResult] = useState<CharacterAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (characterNum == null) {
      setResult(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    getCharacterAnalysis(characterNum, getWeaponTypeFromEquipment, calcItemCredits)
      .then(setResult)
      .catch(() => setError('실험체 분석 데이터를 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [characterNum])

  return { result, loading, error }
}

import { useCallback, useState } from 'react'
import { getPlayerCharacterWeaponStats } from '@repo/service'
import type { CharacterCompareSide } from '@repo/service'
import { calcItemCredits, getWeaponTypeFromEquipment } from '../../../shared/utils/meta'

export const useCharacterCompare = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playerSide, setPlayerSide] = useState<CharacterCompareSide | null>(null)

  const compare = async (
    nickname: string,
    characterNum: number,
    weaponType: string,
  ) => {
    const trimmed = nickname.trim()
    if (!trimmed) {
      setError('닉네임을 입력하세요.')
      return
    }

    setLoading(true)
    setError(null)
    setPlayerSide(null)

    try {
      const side = await getPlayerCharacterWeaponStats(
        trimmed,
        characterNum,
        weaponType,
        getWeaponTypeFromEquipment,
        calcItemCredits,
      )
      if (side.games === 0) {
        setError('해당 실험체·무기 조합의 최근 트리오 랭크 전적이 없습니다.')
        return
      }
      setPlayerSide(side)
    } catch {
      setError('전적을 불러올 수 없습니다. 닉네임을 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  const reset = useCallback(() => {
    setPlayerSide(null)
    setError(null)
  }, [])

  return { compare, loading, error, playerSide, reset }
}

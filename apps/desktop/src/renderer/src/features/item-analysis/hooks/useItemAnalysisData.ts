import { useState } from "react";
import { getItemAnalysis } from "@repo/service";
import type { ItemAnalysisResult } from "@repo/service";
import { calcItemCredits, getWeaponTypeFromEquipment } from "../../../shared/utils/meta";

interface State {
  result: ItemAnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export const useItemAnalysisData = () => {
  const [state, setState] = useState<State>({ result: null, loading: false, error: null });

  const analyze = async (nickname: string) => {
    const trimmed = nickname.trim();
    if (!trimmed) return;

    setState({ result: null, loading: true, error: null });
    try {
      const result = await getItemAnalysis(trimmed, calcItemCredits, getWeaponTypeFromEquipment);
      setState({ result, loading: false, error: null });
    } catch {
      setState({ result: null, loading: false, error: "플레이어를 찾을 수 없습니다." });
    }
  };

  return { ...state, analyze };
};

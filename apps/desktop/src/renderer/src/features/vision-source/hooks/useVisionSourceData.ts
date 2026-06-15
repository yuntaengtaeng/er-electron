import { useState } from "react";
import { getVisionSource } from "@repo/service";
import type { VisionSourceResult } from "@repo/service";

interface State {
  result: VisionSourceResult | null;
  loading: boolean;
  error: string | null;
}

export const useVisionSourceData = () => {
  const [state, setState] = useState<State>({ result: null, loading: false, error: null });

  const analyze = async (nickname: string) => {
    const trimmed = nickname.trim();
    if (!trimmed) return;

    setState({ result: null, loading: true, error: null });
    try {
      const result = await getVisionSource(trimmed);
      setState({ result, loading: false, error: null });
    } catch {
      setState({ result: null, loading: false, error: "플레이어를 찾을 수 없습니다." });
    }
  };

  return { ...state, analyze };
};

import { useState } from "react";
import { getVisionSource, getRankerVisionBenchmark } from "@repo/service";
import type { RankerVisionBenchmark, VisionSourceResult } from "@repo/service";

interface State {
  result: VisionSourceResult | null;
  rankerBenchmark: RankerVisionBenchmark | null;
  loading: boolean;
  error: string | null;
}

export const useVisionSourceData = () => {
  const [state, setState] = useState<State>({
    result: null,
    rankerBenchmark: null,
    loading: false,
    error: null,
  });

  const analyze = async (nickname: string) => {
    const trimmed = nickname.trim();
    if (!trimmed) return;

    setState({ result: null, rankerBenchmark: null, loading: true, error: null });
    try {
      const [result, rankerBenchmark] = await Promise.all([
        getVisionSource(trimmed),
        getRankerVisionBenchmark(3).catch(() => null),
      ]);
      setState({ result, rankerBenchmark, loading: false, error: null });
    } catch {
      setState({
        result: null,
        rankerBenchmark: null,
        loading: false,
        error: "플레이어를 찾을 수 없습니다.",
      });
    }
  };

  return { ...state, analyze };
};

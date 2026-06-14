import { useState, useEffect } from "react";
import {
  getCompareStats,
  logCompareSearch,
  getPopularCompareNicknames,
  type ComparePlayerStats,
} from "@repo/service";

export interface PlayerResult {
  stats: ComparePlayerStats | null;
  loading: boolean;
  error: string | null;
}

export const useCompareData = () => {
  const [results, setResults] = useState<PlayerResult[]>([
    { stats: null, loading: false, error: null },
    { stats: null, loading: false, error: null },
    { stats: null, loading: false, error: null },
  ]);
  const [popularNicknames, setPopularNicknames] = useState<string[]>([]);

  useEffect(() => {
    getPopularCompareNicknames()
      .then(setPopularNicknames)
      .catch(() => {});
  }, []);

  const compare = async (nicknames: string[]) => {
    const trimmed = nicknames.map((n) => n.trim());
    const activeCount = trimmed.filter((n) => n !== "").length;
    if (activeCount < 2) return;

    setResults(
      trimmed.map((n) => ({
        stats: null,
        loading: n !== "",
        error: null,
      }))
    );

    await Promise.all(
      trimmed.map(async (nickname, i) => {
        if (!nickname) return;
        try {
          const stats = await getCompareStats(nickname);
          if (i > 0) logCompareSearch(nickname).catch(() => {});
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i ? { stats, loading: false, error: null } : r
            )
          );
        } catch (err) {
          const error = err instanceof Error ? err.message : "알 수 없는 오류";
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i ? { stats: null, loading: false, error } : r
            )
          );
        }
      })
    );
  };

  return { results, compare, popularNicknames };
};

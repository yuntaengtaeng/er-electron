import { useEffect, useState } from "react";
import type { TopRank } from "@repo/er-type";
import { MatchingTeamMode } from "@repo/er-type";
import { getTopRankers } from "@repo/service";

export function useTopRankers() {
  const [topRankers, setTopRankers] = useState<TopRank[]>([]);

  useEffect(() => {
    getTopRankers(MatchingTeamMode.Solo)
      .then((ranks) => setTopRankers(ranks.slice(0, 5)))
      .catch(() => {});
  }, []);

  return topRankers;
}

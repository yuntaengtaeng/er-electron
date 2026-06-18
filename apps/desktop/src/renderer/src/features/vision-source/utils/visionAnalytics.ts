import type { GameDetail } from "@repo/service";

export const avg = (nums: number[]) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

export const groupBy = (
  games: GameDetail[],
  keyFn: (g: GameDetail) => string,
): Map<string, number[]> => {
  const map = new Map<string, number[]>();
  for (const g of games) {
    const k = keyFn(g);
    const arr = map.get(k) ?? [];
    arr.push(g.viewContribution);
    map.set(k, arr);
  }
  return map;
};

export const PLAYTIME_BUCKETS = [
  { label: "3분 미만", min: 0, max: 180 },
  { label: "3~6분", min: 180, max: 360 },
  { label: "6~9분", min: 360, max: 540 },
  { label: "9~12분", min: 540, max: 720 },
  { label: "12~15분", min: 720, max: 900 },
  { label: "15~18분", min: 900, max: 1080 },
  { label: "18~21분", min: 1080, max: 1260 },
  { label: "21~24분", min: 1260, max: 1440 },
  { label: "24분 이상", min: 1440, max: Infinity },
] as const;

export type VisionBarItem = {
  key: string;
  label: string;
  imageUrl?: string;
  avg: number;
  count: number;
  rankerAvg?: number;
  rankerCount?: number;
};

export const buildPlayTimeItems = (
  games: GameDetail[],
  rankerGames?: GameDetail[],
): VisionBarItem[] =>
  PLAYTIME_BUCKETS.map((bucket, idx) => {
    const bucketGames = games.filter(
      (g) => g.playTime >= bucket.min && g.playTime < bucket.max,
    );
    const rankerBucketGames = rankerGames?.filter(
      (g) => g.playTime >= bucket.min && g.playTime < bucket.max,
    );
    const count = bucketGames.length;
    const rankerCount = rankerBucketGames?.length ?? 0;
    if (count === 0 && rankerCount === 0) return null;

    return {
      key: String(idx),
      label: bucket.label,
      avg: avg(bucketGames.map((g) => g.viewContribution)),
      count,
      rankerAvg: rankerGames
        ? avg((rankerBucketGames ?? []).map((g) => g.viewContribution))
        : undefined,
      rankerCount: rankerGames ? rankerCount : undefined,
    };
  }).filter((item): item is VisionBarItem => item != null);

export const buildCharacterItems = (
  games: GameDetail[],
  getLabel: (characterNum: number) => { label: string; imageUrl?: string },
  rankerGames?: GameDetail[],
): VisionBarItem[] => {
  const playerMap = groupBy(games, (g) => String(g.characterNum));
  const rankerMap = rankerGames
    ? groupBy(rankerGames, (g) => String(g.characterNum))
    : null;

  return Array.from(playerMap.keys())
    .map((key) => {
      const scores = playerMap.get(key) ?? [];
      const rankerScores = rankerMap?.get(key) ?? [];
      const meta = getLabel(Number(key));
      const count = scores.length;
      if (count === 0) return null;

      return {
        key,
        label: meta.label,
        imageUrl: meta.imageUrl,
        avg: avg(scores),
        count,
        rankerAvg: rankerGames ? avg(rankerScores) : undefined,
        rankerCount: rankerGames ? rankerScores.length : undefined,
      };
    })
    .filter((item): item is VisionBarItem => item != null)
    .sort((a, b) => b.avg - a.avg);
};

export const visionPerMin = (g: GameDetail) =>
  g.playTime > 0 ? g.viewContribution / (g.playTime / 60) : 0;

export const avgOf = (games: GameDetail[], fn: (g: GameDetail) => number) =>
  games.length ? games.reduce((a, g) => a + fn(g), 0) / games.length : 0;

export const medianSplit = (
  games: GameDetail[],
  fn: (g: GameDetail) => number,
): { high: GameDetail[]; low: GameDetail[] } => {
  const sorted = [...games].sort((a, b) => fn(a) - fn(b));
  const mid = Math.ceil(sorted.length / 2);
  return { low: sorted.slice(0, mid), high: sorted.slice(mid) };
};

export const boolSplit = (
  games: GameDetail[],
  fn: (g: GameDetail) => boolean,
): { yes: GameDetail[]; no: GameDetail[] } => ({
  yes: games.filter(fn),
  no: games.filter((g) => !fn(g)),
});

export type VisionInsightData = {
  vpmSplit: ReturnType<typeof medianSplit>;
  batSplit: ReturnType<typeof medianSplit>;
  droneSplit: ReturnType<typeof boolSplit>;
  consoleSplit: ReturnType<typeof boolSplit>;
  avgVpmHigh: string;
  avgVpmLow: string;
};

export const computeVisionInsights = (games: GameDetail[]): VisionInsightData => {
  const vpmSplit = medianSplit(games, visionPerMin);
  const batSplit = medianSplit(games, (g) => g.batKills + g.mutantBatKills);
  const droneSplit = boolSplit(games, (g) => g.cameraFromDrone > 0);
  const consoleSplit = boolSplit(games, (g) => g.cameraFromConsole > 0);

  return {
    vpmSplit,
    batSplit,
    droneSplit,
    consoleSplit,
    avgVpmHigh: avgOf(vpmSplit.high, visionPerMin).toFixed(1),
    avgVpmLow: avgOf(vpmSplit.low, visionPerMin).toFixed(1),
  };
};

import type { UserGame } from "@repo/er-type";
import { MatchingMode } from "@repo/er-type";
import { getGamesSince } from "@repo/club-store";
import { getUserByNickname, getUserGames } from "./er-service";

const RECON_DRONE_ID = 502208;
const EMP_DRONE_ID = 502308;
const RECON_DRONE_CALL_PRICE = 25;
const EMP_DRONE_CALL_PRICE = 35;

const TELEPHOTO_CAMERA_ID = 502207;

const MONSTER_IDS = {
  BAT: "2",
  MUTANT_BAT: "13",
} as const;

type VisionGameInput = {
  viewContribution: number;
  addTelephotoCamera: number;
  addSurveillanceCamera: number;
  useReconDrone: number;
  useEmpDrone: number;
  killMonsters: Record<string, number>;
  itemTransferredDrone: number[];
  itemTransferredConsole: number[];
};

export interface GameDetail {
  characterNum: number;
  gameRank: number;
  playTime: number;
  kills: number;
  deaths: number;
  assists: number;
  viewContribution: number;
  batKills: number;
  mutantBatKills: number;
  cameraFromDrone: number;
  cameraFromConsole: number;
  telephotoCount: number;
  reconDroneCount: number;
  empDroneCount: number;
  itemTransferredDrone: number[];
  itemTransferredConsole: number[];
}

export type VisionStatsSummary = {
  gamesAnalyzed: number;
  avgViewContribution: number;
  avgTelephotoPlaced: number;
  avgCameraFromBat: number;
  avgCameraFromPurchase: number;
  avgBatKills: number;
  avgMutantBatKills: number;
  avgReconDrone: number;
  avgReconDroneBought: number;
  avgReconDroneBoughtCredits: number;
  avgEmpDrone: number;
  avgEmpDroneBought: number;
  avgEmpDroneBoughtCredits: number;
  avgSurveillanceCamera: number;
};

export interface VisionSourceResult extends VisionStatsSummary {
  nickname: string;
  userId: string;
  games: GameDetail[];
}

export interface RankerVisionBenchmark extends VisionStatsSummary {
  periodDays: number;
  periodLabel: string;
  rankerCount: number;
  games: GameDetail[];
}

const avg = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

const parseItemArray = (value: unknown): number[] =>
  Array.isArray(value) ? (value as number[]) : [];

const parseKillMonsters = (value: unknown): Record<string, number> =>
  value && typeof value === "object" ? (value as Record<string, number>) : {};

const fromUserGame = (g: UserGame): VisionGameInput => ({
  viewContribution: g.viewContribution,
  addTelephotoCamera: g.addTelephotoCamera,
  addSurveillanceCamera: g.addSurveillanceCamera,
  useReconDrone: g.useReconDrone,
  useEmpDrone: g.useEmpDrone,
  killMonsters: g.killMonsters,
  itemTransferredDrone: g.itemTransferredDrone,
  itemTransferredConsole: g.itemTransferredConsole,
});

const fromDbRow = (row: Record<string, unknown>): VisionGameInput => ({
  viewContribution: (row.view_contribution as number) ?? 0,
  addTelephotoCamera: (row.add_telephoto_camera as number) ?? 0,
  addSurveillanceCamera: (row.add_surveillance_camera as number) ?? 0,
  useReconDrone: (row.use_recon_drone as number) ?? 0,
  useEmpDrone: (row.use_emp_drone as number) ?? 0,
  killMonsters: parseKillMonsters(row.kill_monsters),
  itemTransferredDrone: parseItemArray(row.item_transferred_drone),
  itemTransferredConsole: parseItemArray(row.item_transferred_console),
});

const aggregateVisionStats = (games: VisionGameInput[]): VisionStatsSummary => ({
  gamesAnalyzed: games.length,
  avgViewContribution: avg(games.map((g) => g.viewContribution)),
  avgTelephotoPlaced: avg(games.map((g) => g.addTelephotoCamera)),
  avgCameraFromBat: avg(
    games.map(
      (g) =>
        (g.killMonsters[MONSTER_IDS.BAT] ?? 0) +
        (g.killMonsters[MONSTER_IDS.MUTANT_BAT] ?? 0) * 2,
    ),
  ),
  avgCameraFromPurchase: avg(
    games.map((g) => {
      const fromBat =
        (g.killMonsters[MONSTER_IDS.BAT] ?? 0) +
        (g.killMonsters[MONSTER_IDS.MUTANT_BAT] ?? 0) * 2;
      return Math.max(0, g.addTelephotoCamera - fromBat);
    }),
  ),
  avgBatKills: avg(games.map((g) => g.killMonsters[MONSTER_IDS.BAT] ?? 0)),
  avgMutantBatKills: avg(games.map((g) => g.killMonsters[MONSTER_IDS.MUTANT_BAT] ?? 0)),
  avgReconDrone: avg(games.map((g) => g.useReconDrone)),
  avgReconDroneBought: avg(
    games.map(
      (g) => g.itemTransferredDrone.filter((id) => id === RECON_DRONE_ID).length,
    ),
  ),
  avgReconDroneBoughtCredits: avg(
    games.map(
      (g) =>
        g.itemTransferredDrone.filter((id) => id === RECON_DRONE_ID).length *
        RECON_DRONE_CALL_PRICE,
    ),
  ),
  avgEmpDrone: avg(games.map((g) => g.useEmpDrone)),
  avgEmpDroneBought: avg(
    games.map(
      (g) => g.itemTransferredDrone.filter((id) => id === EMP_DRONE_ID).length,
    ),
  ),
  avgEmpDroneBoughtCredits: avg(
    games.map(
      (g) =>
        g.itemTransferredDrone.filter((id) => id === EMP_DRONE_ID).length *
        EMP_DRONE_CALL_PRICE,
    ),
  ),
  avgSurveillanceCamera: avg(games.map((g) => g.addSurveillanceCamera)),
});

const toGameDetail = (g: UserGame): GameDetail => {
  const bats = g.killMonsters[MONSTER_IDS.BAT] ?? 0;
  const mutantBats = g.killMonsters[MONSTER_IDS.MUTANT_BAT] ?? 0;
  const countItem = (id: number) =>
    g.itemTransferredDrone.filter((x) => x === id).length +
    g.itemTransferredConsole.filter((x) => x === id).length;

  return {
    characterNum: g.characterNum,
    gameRank: g.gameRank,
    playTime: g.playTime,
    kills: g.playerKill,
    deaths: g.playerDeaths,
    assists: g.playerAssistant,
    viewContribution: g.viewContribution,
    batKills: bats,
    mutantBatKills: mutantBats,
    cameraFromDrone: g.itemTransferredDrone.filter((id) => id === TELEPHOTO_CAMERA_ID).length,
    cameraFromConsole: g.itemTransferredConsole.filter((id) => id === TELEPHOTO_CAMERA_ID).length,
    telephotoCount: countItem(TELEPHOTO_CAMERA_ID),
    reconDroneCount: countItem(RECON_DRONE_ID),
    empDroneCount: countItem(EMP_DRONE_ID),
    itemTransferredDrone: g.itemTransferredDrone,
    itemTransferredConsole: g.itemTransferredConsole,
  };
};

const toGameDetailFromDbRow = (row: Record<string, unknown>): GameDetail => {
  const input = fromDbRow(row);
  const bats = input.killMonsters[MONSTER_IDS.BAT] ?? 0;
  const mutantBats = input.killMonsters[MONSTER_IDS.MUTANT_BAT] ?? 0;
  const countItem = (id: number) =>
    input.itemTransferredDrone.filter((x) => x === id).length +
    input.itemTransferredConsole.filter((x) => x === id).length;

  return {
    characterNum: (row.character_num as number) ?? 0,
    gameRank: (row.game_rank as number) ?? 0,
    playTime: (row.play_time as number) ?? 0,
    kills: (row.player_kill as number) ?? 0,
    deaths: (row.player_deaths as number) ?? 0,
    assists: (row.player_assistant as number) ?? 0,
    viewContribution: input.viewContribution,
    batKills: bats,
    mutantBatKills: mutantBats,
    cameraFromDrone: input.itemTransferredDrone.filter((id) => id === TELEPHOTO_CAMERA_ID).length,
    cameraFromConsole: input.itemTransferredConsole.filter((id) => id === TELEPHOTO_CAMERA_ID).length,
    telephotoCount: countItem(TELEPHOTO_CAMERA_ID),
    reconDroneCount: countItem(RECON_DRONE_ID),
    empDroneCount: countItem(EMP_DRONE_ID),
    itemTransferredDrone: input.itemTransferredDrone,
    itemTransferredConsole: input.itemTransferredConsole,
  };
};

export const getCutoffIsoForLastNDays = (days: number): string => {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return cutoff.toISOString();
};

export const formatVisionPeriodLabel = (days: number): string => {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(start)} ~ ${fmt(end)}`;
};

export const getRankerVisionBenchmark = async (
  periodDays = 3,
): Promise<RankerVisionBenchmark> => {
  const sinceIso = getCutoffIsoForLastNDays(periodDays);
  const rows = await getGamesSince(sinceIso);
  const gameDetails = rows.map(toGameDetailFromDbRow);
  const rankerCount = new Set(rows.map((row) => row.user_id as string)).size;

  return {
    ...aggregateVisionStats(rows.map(fromDbRow)),
    periodDays,
    periodLabel: formatVisionPeriodLabel(periodDays),
    rankerCount,
    games: gameDetails,
  };
};

export const getVisionSource = async (
  nickname: string,
): Promise<VisionSourceResult> => {
  const userInfo = await getUserByNickname(nickname);

  const page1 = await getUserGames(userInfo.userId);
  const ranked = page1.games.filter(
    (g) => g.matchingMode === MatchingMode.Rank,
  );

  if (ranked.length < 20 && page1.next != null) {
    const page2 = await getUserGames(userInfo.userId, page1.next);
    ranked.push(
      ...page2.games.filter((g) => g.matchingMode === MatchingMode.Rank),
    );
  }

  const visionGames = ranked.map(fromUserGame);

  return {
    nickname,
    userId: userInfo.userId,
    ...aggregateVisionStats(visionGames),
    games: ranked.map(toGameDetail),
  };
};

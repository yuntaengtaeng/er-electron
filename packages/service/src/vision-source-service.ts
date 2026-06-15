import { MatchingMode } from "@repo/er-type";
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

export interface GameDetail {
  characterNum: number;
  gameRank: number;
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

export interface VisionSourceResult {
  nickname: string;
  userId: string;
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
  games: GameDetail[];
}

const avg = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

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

  return {
    nickname,
    userId: userInfo.userId,
    gamesAnalyzed: ranked.length,
    avgViewContribution: avg(ranked.map((g) => g.viewContribution)),
    avgTelephotoPlaced: avg(ranked.map((g) => g.addTelephotoCamera)),
    avgCameraFromBat: avg(
      ranked.map(
        (g) =>
          (g.killMonsters[MONSTER_IDS.BAT] ?? 0) +
          (g.killMonsters[MONSTER_IDS.MUTANT_BAT] ?? 0) * 2,
      ),
    ),
    avgCameraFromPurchase: avg(
      ranked.map((g) => {
        const fromBat =
          (g.killMonsters[MONSTER_IDS.BAT] ?? 0) +
          (g.killMonsters[MONSTER_IDS.MUTANT_BAT] ?? 0) * 2;
        return Math.max(0, g.addTelephotoCamera - fromBat);
      }),
    ),
    avgBatKills: avg(ranked.map((g) => g.killMonsters[MONSTER_IDS.BAT] ?? 0)),
    avgMutantBatKills: avg(ranked.map((g) => g.killMonsters[MONSTER_IDS.MUTANT_BAT] ?? 0)),
    avgReconDrone: avg(ranked.map((g) => g.useReconDrone)),
    avgReconDroneBought: avg(
      ranked.map(
        (g) => g.itemTransferredDrone.filter((id) => id === RECON_DRONE_ID).length,
      ),
    ),
    avgReconDroneBoughtCredits: avg(
      ranked.map(
        (g) =>
          g.itemTransferredDrone.filter((id) => id === RECON_DRONE_ID).length *
          RECON_DRONE_CALL_PRICE,
      ),
    ),
    avgEmpDrone: avg(ranked.map((g) => g.useEmpDrone)),
    avgEmpDroneBought: avg(
      ranked.map(
        (g) => g.itemTransferredDrone.filter((id) => id === EMP_DRONE_ID).length,
      ),
    ),
    avgEmpDroneBoughtCredits: avg(
      ranked.map(
        (g) =>
          g.itemTransferredDrone.filter((id) => id === EMP_DRONE_ID).length *
          EMP_DRONE_CALL_PRICE,
      ),
    ),
    avgSurveillanceCamera: avg(ranked.map((g) => g.addSurveillanceCamera)),
    games: ranked.map((g) => {
      const bats = g.killMonsters[MONSTER_IDS.BAT] ?? 0;
      const mutantBats = g.killMonsters[MONSTER_IDS.MUTANT_BAT] ?? 0;
      const countItem = (id: number) =>
        g.itemTransferredDrone.filter((x) => x === id).length +
        g.itemTransferredConsole.filter((x) => x === id).length;
      return {
        characterNum: g.characterNum,
        gameRank: g.gameRank,
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
    }),
  };
};

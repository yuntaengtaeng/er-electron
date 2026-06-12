import type {
  ApiResponse,
  MetaType,
  MetaDataHash,
  UserGame,
  UserInfo,
  UserStats,
  RecommendWeaponRoute,
  RecommendWeaponRouteDesc,
} from "@repo/er-type";

const BASE_URL = "https://open-api.bser.io";

export class ErApiClient {
  private readonly headers: HeadersInit;

  constructor(apiKey: string) {
    this.headers = { "x-api-key": apiKey };
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, { headers: this.headers });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${path}`);
    }

    const json: ApiResponse<T> = await res.json();

    if (json.code !== 200) {
      throw new Error(`API ${json.code}: ${json.message}`);
    }

    return json.data;
  }

  // ──────────── 유저 ────────────

  getUserByNickname(nickname: string) {
    return this.get<UserInfo>(`/v1/user/nickname?query=${encodeURIComponent(nickname)}`);
  }

  getUserGamesByUserNum(userNum: number) {
    return this.get<{ userGames: UserGame[] }>(`/v1/user/games/${userNum}`);
  }

  getUserGamesByUserId(userId: string) {
    return this.get<{ userGames: UserGame[] }>(`/v1/user/games/uid/${userId}`);
  }

  getUserStatsByUserNum(userNum: number, seasonId: number, matchingMode: number) {
    return this.get<{ userStats: UserStats[] }>(`/v2/user/stats/${userNum}/${seasonId}/${matchingMode}`);
  }

  getUserStatsByUserId(userId: string, seasonId: number, matchingMode: number) {
    return this.get<{ userStats: UserStats[] }>(`/v2/user/stats/uid/${userId}/${seasonId}/${matchingMode}`);
  }

  // ──────────── 게임 ────────────

  getGame(gameId: number) {
    return this.get<{ userGames: UserGame[] }>(`/v1/games/${gameId}`);
  }

  // ──────────── 랭크 ────────────

  getTopRankers(seasonId: number, matchingTeamMode: number) {
    return this.get<unknown>(`/v1/rank/top/${seasonId}/${matchingTeamMode}`);
  }

  getTopRankersByServer(seasonId: number, matchingTeamMode: number, serverCode: string) {
    return this.get<unknown>(`/v1/rank/top/${seasonId}/${matchingTeamMode}/${serverCode}`);
  }

  getRankByUserNum(userNum: number, seasonId: number, matchingTeamMode: number) {
    return this.get<unknown>(`/v1/rank/${userNum}/${seasonId}/${matchingTeamMode}`);
  }

  getRankByUserId(userId: string, seasonId: number, matchingTeamMode: number) {
    return this.get<unknown>(`/v1/rank/uid/${userId}/${seasonId}/${matchingTeamMode}`);
  }

  // ──────────── 유니온팀 ────────────

  getUnionTeamByUserNum(userNum: number, seasonId: number) {
    return this.get<unknown>(`/v1/unionTeam/${userNum}/${seasonId}`);
  }

  getUnionTeamByUserId(userId: string, seasonId: number) {
    return this.get<unknown>(`/v1/unionTeam/uid/${userId}/${seasonId}`);
  }

  // ──────────── 메타데이터 ────────────

  getMetaData(metaType: MetaType) {
    return this.get<unknown>(`/v2/data/${metaType}`);
  }

  getMetaDataHash() {
    return this.get<MetaDataHash>(`/v2/data/hash`);
  }

  getL10n(language: string) {
    return this.get<Record<string, string>>(`/v1/l10n/${language}`);
  }

  getFreeCharacters(matchingMode: number) {
    return this.get<unknown>(`/v1/freeCharacters/${matchingMode}`);
  }

  // ──────────── 무기 루트 ────────────

  getRecommendWeaponRoutes() {
    return this.get<{ result: RecommendWeaponRoute[] }>(`/v1/weaponRoutes/recommend`);
  }

  getRecommendWeaponRoute(routeId: number) {
    return this.get<{ result: RecommendWeaponRoute; desc: RecommendWeaponRouteDesc }>(
      `/v1/weaponRoutes/recommend/${routeId}`,
    );
  }
}

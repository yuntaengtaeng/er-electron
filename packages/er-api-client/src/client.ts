import type {
  ApiResponse,
  MetaType,
  MetaDataHash,
  UserGame,
  UserInfo,
  UserStats,
  TopRank,
  RecommendWeaponRoute,
  RecommendWeaponRouteDesc,
} from "@repo/er-type";

const BASE_URL = "https://open-api.bser.io";

export class ErApiClient {
  private readonly headers: HeadersInit;

  constructor(apiKey: string) {
    this.headers = { "x-api-key": apiKey };
  }

  private async get<T>(path: string, key: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, { headers: this.headers });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${path}`);
    }

    const json: ApiResponse<T> & Record<string, unknown> = await res.json();

    if (json.code !== 200) {
      throw new Error(`API ${json.code}: ${json.message}`);
    }

    return json[key] as T;
  }

  private async getWithCursor<T>(path: string, key: string): Promise<{ data: T; next?: number }> {
    const res = await fetch(`${BASE_URL}${path}`, { headers: this.headers });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${path}`);
    }

    const json: ApiResponse<T> & Record<string, unknown> = await res.json();

    if (json.code !== 200) {
      throw new Error(`API ${json.code}: ${json.message}`);
    }

    return {
      data: json[key] as T,
      next: typeof json['next'] === 'number' ? json['next'] : undefined,
    };
  }

  // ──────────── 유저 ────────────

  getUserByNickname(nickname: string) {
    return this.get<UserInfo>(`/v1/user/nickname?query=${encodeURIComponent(nickname)}`, 'user');
  }

  getUserGamesByUserNum(userNum: number, next?: number) {
    const query = next != null ? `?next=${next}` : '';
    return this.getWithCursor<UserGame[]>(`/v1/user/games/${userNum}${query}`, 'userGames');
  }

  getUserGamesByUserId(userId: string, next?: number) {
    const query = next != null ? `?next=${next}` : '';
    return this.getWithCursor<UserGame[]>(`/v1/user/games/uid/${userId}${query}`, 'userGames');
  }

  getUserStatsByUserNum(userNum: number, seasonId: number, matchingMode: number) {
    return this.get<UserStats[]>(`/v2/user/stats/${userNum}/${seasonId}/${matchingMode}`, 'userStats');
  }

  getUserStatsByUserId(userId: string, seasonId: number, matchingMode: number) {
    return this.get<UserStats[]>(`/v2/user/stats/uid/${userId}/${seasonId}/${matchingMode}`, 'userStats');
  }

  // ──────────── 게임 ────────────

  getGame(gameId: number) {
    return this.get<UserGame[]>(`/v1/games/${gameId}`, 'userGames');
  }

  // ──────────── 랭크 ────────────

  getTopRankers(seasonId: number, matchingTeamMode: number) {
    return this.get<TopRank[]>(`/v1/rank/top/${seasonId}/${matchingTeamMode}`, 'topRanks');
  }

  getTopRankersByServer(seasonId: number, matchingTeamMode: number, serverCode: number) {
    return this.get<TopRank[]>(`/v1/rank/top/${seasonId}/${matchingTeamMode}/${serverCode}`, 'topRanks');
  }

  getRankByUserNum(userNum: number, seasonId: number, matchingTeamMode: number) {
    return this.get<unknown>(`/v1/rank/${userNum}/${seasonId}/${matchingTeamMode}`, 'userRank');
  }

  getRankByUserId(userId: string, seasonId: number, matchingTeamMode: number) {
    return this.get<unknown>(`/v1/rank/uid/${userId}/${seasonId}/${matchingTeamMode}`, 'userRank');
  }

  // ──────────── 유니온팀 ────────────

  getUnionTeamByUserNum(userNum: number, seasonId: number) {
    return this.get<unknown>(`/v1/unionTeam/${userNum}/${seasonId}`, 'unionTeam');
  }

  getUnionTeamByUserId(userId: string, seasonId: number) {
    return this.get<unknown>(`/v1/unionTeam/uid/${userId}/${seasonId}`, 'unionTeam');
  }

  // ──────────── 메타데이터 ────────────

  getMetaData(metaType: MetaType) {
    return this.get<unknown>(`/v2/data/${metaType}`, 'data');
  }

  getMetaDataHash() {
    return this.get<MetaDataHash>(`/v2/data/hash`, 'data');
  }

  getL10n(language: string) {
    return this.get<Record<string, string>>(`/v1/l10n/${language}`, 'l10n');
  }

  getFreeCharacters(matchingMode: number) {
    return this.get<unknown>(`/v1/freeCharacters/${matchingMode}`, 'freeCharacters');
  }

  // ──────────── 무기 루트 ────────────

  getRecommendWeaponRoutes() {
    return this.get<RecommendWeaponRoute[]>(`/v1/weaponRoutes/recommend`, 'result');
  }

  getRecommendWeaponRoute(routeId: number) {
    return this.get<{ result: RecommendWeaponRoute; desc: RecommendWeaponRouteDesc }>(
      `/v1/weaponRoutes/recommend/${routeId}`, 'result'
    );
  }
}

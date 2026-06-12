// JSON 문자열로 감싸진 필드(weaponCodes, traitCodes, lateGameItemCodes, paths, remoteTransferItemCodes)는 사용 시 JSON.parse() 필요
export interface RecommendWeaponRoute {
  id: number;
  title: string;
  userNum: number;
  userNickname: string;
  characterCode: number;
  slotId: number;
  weaponType: number;
  weaponCodes: string;
  traitCodes: string;
  lateGameItemCodes: string;
  remoteTransferItemCodes: string;
  tacticalSkillGroupCode: number;
  paths: string;
  count: number;
  version: string;
  teamMode: number;
  languageCode: string;
  routeVersion: number;
  share: boolean;
  updateDtm: number;
  v2Like: number;
  v2WinRate: number;
  v2SeasonId: number;
  v2AccumulateLike: number;
  v2AccumulateWinRate: number;
  v2AccumulateSeasonId: number;
}

export interface RecommendWeaponRouteDesc {
  recommendWeaponRouteId: number;
  skillPath: string;
  desc: string;
}

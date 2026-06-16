export interface UserGame {
  // 기본 정보
  nickname: string;
  gameId: number;
  seasonId: number;
  matchingMode: number;
  matchingTeamMode: number;
  characterNum: number;
  skinCode: number;
  characterLevel: number;
  gameRank: number;
  serverName: string;
  versionSeason: number;
  versionMajor: number;
  versionMinor: number;
  language: string;
  accountLevel: number;
  mlbot: boolean;
  isMLBot: boolean;
  botLevel: number;

  // 전투 통계
  playerKill: number;
  playerAssistant: number;
  monsterKill: number;
  teamKill: number;
  totalFieldKill: number;
  teamDown: number;
  teamDownCanNotEliminate: number;
  teamDownCanEliminate: number;
  teamRepeatDown: number;
  teamRepeatDownCanNotEliminate: number;
  teamRepeatDownCanEliminate: number;
  playerDeaths: number;
  terminateCount: number;
  terminateCountCanNotEliminate: number;
  breakCount: number;
  clutchCount: number;
  teamElimination: number;
  killDetails: string;
  deathDetails: string;
  killsPhaseOne: number;
  killsPhaseTwo: number;
  killsPhaseThree: number;
  deathsPhaseOne: number;
  deathsPhaseTwo: number;
  deathsPhaseThree: number;
  totalDoubleKill: number;
  totalTripleKill: number;
  totalQuadraKill: number;
  totalExtraKill: number;
  unknownKill: number;
  ccTimeToPlayer: number;
  killGamma: boolean;
  totalTKPerMin: number[];
  scoredPoint: number[];

  // 무기 / 장비 / 숙련도
  bestWeapon: number;
  bestWeaponLevel: number;
  masteryLevel: Record<string, number>;
  equipment: Record<string, number>;
  equipmentGrade: Record<string, number>;
  startingItems: number[];
  equipFirstItemForLog: Record<string, number[]>;
  collectItemForLog: number[];

  // 스킬
  skillLevelInfo: Record<string, number>;
  skillOrderInfo: Record<string, number>;

  // MMR / 랭크
  mmrBefore: number;
  mmrAfter: number;
  mmrGain: number;
  mmrGainInGame: number;
  mmrLossEntryCost: number;
  mmrAvg: number;
  rankPoint: number;
  victory: number;
  gainedNormalMmrKFactor: number;
  premadeMatchingType: number;
  exceptPreMadeTeam: boolean;

  // 시간
  startDtm: string;
  duration: number;
  playTime: number;
  watchTime: number;
  totalTime: number;
  survivableTime: number;
  expireDtm: string;
  afkDtm: string;
  giveupDtm: string;

  // 데미지
  damageToPlayer: number;
  damageToPlayer_basic: number;
  damageToPlayer_skill: number;
  damageToPlayer_itemSkill: number;
  damageToPlayer_direct: number;
  damageToPlayer_uniqueSkill: number;
  damageToPlayer_trap: number;
  damageToPlayer_Shield: number;
  damageFromPlayer: number;
  damageFromPlayer_basic: number;
  damageFromPlayer_skill: number;
  damageFromPlayer_itemSkill: number;
  damageFromPlayer_direct: number;
  damageFromPlayer_uniqueSkill: number;
  damageFromPlayer_trap: number;
  damageFromPlayer_Shield: number;
  damageToMonster: number;
  damageToMonster_basic: number;
  damageToMonster_skill: number;
  damageToMonster_itemSkill: number;
  damageToMonster_direct: number;
  damageToMonster_uniqueSkill: number;
  damageToMonster_trap: number;
  damageToMonster_Shield: number;
  damageFromMonster: number;
  damageOffsetedByShield_Player: number;
  damageOffsetedByShield_Monster: number;
  damageToGuideRobot: number;

  // 회복 / 보호막
  healAmount: number;
  teamRecover: number;
  protectAbsorb: number;
  usedNormalHealPack: number;
  usedReinforcedHealPack: number;
  usedNormalShieldPack: number;
  usedReinforceShieldPack: number;

  // 사망 정보
  killer: string;
  killDetail: string;
  killerCharacter: string;
  killerWeapon: string;
  causeOfDeath: string;
  placeOfDeath: string;
  killer2: string;
  killer3: string;
  giveUp: number;
  escapeState: number;
  isInnocentGiveUp: boolean;
  innocentGiveUp: boolean;
  IsLeavingBeforeCreditRevivalTerminate: boolean;
  isLeavingBeforeCreditRevivalTerminate: boolean;

  // 지형지물 / 이동
  placeOfStart: string;
  useHyperLoop: number;
  useSecurityConsole: number;
  addTelephotoCamera: number;
  removeTelephotoCamera: number;
  addSurveillanceCamera: number;
  removeSurveillanceCamera: number;
  fishingCount: number;
  useEmoticonCount: number;
  usedPairLoop: number;
  useReconDrone: number;
  useEmpDrone: number;
  useGuideRobot: number;
  guideRobotRadial: number;
  guideRobotFlagShip: number;
  guideRobotSignature: number;
  crGetByGuideRobot: number;

  // 매치 구성
  teamNumber: number;
  preMade: number;
  matchSize: number;
  botAdded: number;
  botRemain: number;
  routeIdOfStart: number;
  routeSlotId: number;
  safeAreas: number;
  restrictedAreaAccelerated: number;
  squadRumbleRank: number;
  reunitedCount: number;
  timeSpentInBriefingRoom: number;
  usingDefaultGameOption: boolean;

  // 설치물
  activeInstallation: Record<string, number>;

  // 인퓨전 / 특성
  finalInfusion: number[];
  boughtInfusion: string;
  traitFirstCore: number;
  traitFirstSub: number[];
  traitSecondSub: number[];
  tacticalSkillGroup: number;
  tacticalSkillLevel: number;
  tacticalSkillUseCount: number;

  // VF 크레딧 (코발트 프로토콜)
  totalVFCredits: number[];
  usedVFCredits: number[];
  sumUsedVFCredits: number;
  totalGainVFCredit: number;
  activelyGainedCredits: number;
  creditSource: Record<string, number>;
  totalTurbineTakeOver: number;
  creditRevivalCount: number;
  creditRevivedOthersCount: number;
  kioskFromMaterialUseVFCredit: number;
  kioskFromEscapeKeyUseVFCredit: number;
  kioskFromRevivalUseVFCredit: number;
  remoteDroneUseVFCreditMySelf: number;
  remoteDroneUseVFCreditAlly: number;
  tacticalSkillUpgradeUseVFCredit: number;
  infusionStoreUseVFCredit: number;
  kioskExchangeCredit: number;

  // 제작
  craftUncommon: number;
  craftRare: number;
  craftEpic: number;
  craftLegend: number;
  craftMythic: number;
  campFireCraftUncommon: number;
  campFireCraftRare: number;
  campFireCraftEpic: number;
  campFireCraftLegendary: number;
  foodCraftCount: number[];

  // 어댑티브 포스 / 스탯
  adaptiveForce: number;
  adaptiveForceAttack: number;
  adaptiveForceAmplify: number;
  skillAmp: number;
  maxHp: number;
  maxSp: number;
  attackPower: number;
  defense: number;
  attackSpeed: number;
  moveSpeed: number;
  outOfCombatMoveSpeed: number;
  attackRange: number;
  sightRange: number;
  criticalStrikeChance: number;
  criticalStrikeDamage: number;
  coolDownReduction: number;
  lifeSteal: number;
  normalLifeSteal: number;
  skillLifeSteal: number;
  amplifierToMonster: number;
  trapDamage: number;
  hpRegen: number;
  spRegen: number;
  gainExp: number;
  baseExp: number;
  bonusExp: number;
  bonusCoin: number;

  // 기타
  killMonsters: Record<string, number>;
  itemTransferredConsole: number[];
  itemTransferredDrone: number[];
  useGadget: Record<string, number>;
  getBoriReward: Record<string, number>;
  treeOfLifeSpawn: number[];
  viewContribution: number;
  resurrectionKitUsageCount: number;
  resurrectionKitToCredit: number;
  enterDimensionRift: number;
  enterDimensionEmpoweredRift: number;
  winFromDimensionRift: number;
  winFromDimensionEmpoweredRift: number;
  enterTurbulentRift: number;
  eventMissionResult: Record<string, unknown>;
  cobaltRandomPickRemoveCharacter: number;
  mainWeather: number;
  subWeather: number;
  battleZone1AreaCode: number;
  battleZone1BattleMark: number;
  battleZone1Winner: number;
  battleZone1BattleMarkCount: number;
  battleZonePlayerKill: number;
  battleZoneDeaths: number;
  teamBattleZoneDown: number;
  gimmickEvidenceLockerCount: string;
  gimmickEvidenceLockerItem: string;
  gimmickAppleDropped: number;
  gimmickDrumUseCount: number;
  gimmickDrumAttackCount: number;
  gimmickDrumDroppedHitCount: number;
  gimmickHospitalDiscountRate: number;
  gimmickGrandfatherClockUseCount: number;
  milliTournamentKillScore: number;
  tournamentRankScore: number;
  getBuffCubeRed: number;
  getBuffCubePurple: number;
  getBuffCubeGreen: number;
  getBuffCubeGold: number;
  getBuffCubeSkyBlue: number;
  sumGetBuffCube: number;
}

export interface CharacterStat {
  characterCode: number;
  totalGames: number;
  usages: number;
  maxKillings: number;
  top3: number;
  wins: number;
  mostUsedSkinCode: number;
  latestUsedSkinCode: number;
  top3Rate: number;
  averageRank: number;
}

export interface UserStats {
  seasonId: number;
  matchingMode: number;
  matchingTeamMode: number;
  mmr: number;
  rank: number;
  rankSize: number;
  rankPercent: number;
  totalGames: number;
  totalWins: number;
  totalTeamKills: number;
  totalDeaths: number;
  escapeCount: number;
  averageRank: number;
  averageKills: number;
  averageAssistants: number;
  averageHunts: number;
  top1: number;
  top2: number;
  top3: number;
  top5: number;
  top7: number;
  characterStats: CharacterStat[];
}

export interface UserInfo {
  userNum?: number;
  userId: string;
  nickname: string;
}

export interface TopRank {
  rank: number;
  nickname: string;
  mmr: number;
  userEmblems: unknown[];
}

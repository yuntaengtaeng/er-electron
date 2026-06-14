import charactersData from "../constants/ko-json/characters.json";
import itemsData from "../constants/ko-json/items.json";
import masteriesData from "../constants/ko-json/masteries.json";
import areasData from "../constants/ko-json/areas.json";
import tiersData from "../constants/ko-json/tiers.json";
import monstersData from "../constants/ko-json/monsters.json";
import traitSkillGroupsData from "../constants/ko-json/traitSkillGroups.json";
import tacticalSkillsData from "../constants/ko-json/tacticalSkills.json";

const characterById = new Map(charactersData.characters.map((c) => [c.id, c]));
const characterByKey = new Map(
  charactersData.characters.map((c) => [c.key, c]),
);
const itemById = new Map(itemsData.items.map((i) => [i.id, i]));
const masteryByKey = new Map(masteriesData.masteries.map((m) => [m.key, m]));
const masteryById = new Map(masteriesData.masteries.map((m) => [m.id, m]));
const areaByKey = new Map(areasData.areas.map((a) => [a.key, a]));
const tierById = new Map(tiersData.tiers.map((t) => [t.id, t]));
const monsterByKey = new Map(monstersData.monsters.map((m) => [m.key, m]));
const traitById = new Map(
  traitSkillGroupsData.traitSkills.map((t) => [t.id, t]),
);
const tacticalSkillById = new Map(
  tacticalSkillsData.tacticalSkills.map((s) => [s.id, s]),
);

export const getCharacterById = (id: number) => characterById.get(id) ?? null;
export const getCharacterByKey = (key: string) =>
  characterByKey.get(key) ?? null;
export const getItemById = (id: number) => itemById.get(id) ?? null;
export const getMasteryByKey = (key: string) => masteryByKey.get(key) ?? null;
export const getMasteryById = (id: number) => masteryById.get(id) ?? null;
export const getAreaByKey = (key: string) => areaByKey.get(key) ?? null;
export const getTierById = (id: number) => tierById.get(id) ?? null;

// MMR → tier 매핑 (내림차순 정렬 — 첫 번째로 minMmr 이하가 되는 항목이 해당 티어)
const TIER_MMR_THRESHOLDS = [
  { minMmr: 11000, tierId: 8 }, // 이터니티
  { minMmr: 9000, tierId: 7 }, // 데미갓
  { minMmr: 7500, tierId: 66 }, // 미스릴
  { minMmr: 6000, tierId: 63 }, // 메테오라이트
  { minMmr: 4500, tierId: 6 }, // 다이아몬드
  { minMmr: 3500, tierId: 5 }, // 플래티넘
  { minMmr: 2600, tierId: 4 }, // 골드
  { minMmr: 1700, tierId: 3 }, // 실버
  { minMmr: 900, tierId: 2 }, // 브론즈
  { minMmr: 1, tierId: 1 }, // 아이언
  { minMmr: 0, tierId: 0 }, // 언랭크
];

export function getTierByMmr(mmr: number) {
  for (const t of TIER_MMR_THRESHOLDS) {
    if (mmr >= t.minMmr) return tierById.get(t.tierId) ?? null;
  }
  return tierById.get(0) ?? null;
}
export const getMonsterByKey = (key: string) => monsterByKey.get(key) ?? null;
export const getTraitById = (id: number) => traitById.get(id) ?? null;
export const getTacticalSkillById = (id: number) =>
  tacticalSkillById.get(id) ?? null;

export function normalizeImageUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

// CDN version derived from items data — auto-tracks JSON updates
const cdnVersionMatch =
  itemsData.items[0]?.imageUrl.match(/game-assets\/([^/]+)/);
const cdnVersion = cdnVersionMatch?.[1] ?? "11.4.0";

export function getMasteryIconUrl(weaponTypeKey: string): string {
  return `https://cdn.dak.gg/assets/er/game-assets/${cdnVersion}/Ico_Ability_${weaponTypeKey}.png`;
}

// 키오스크 에픽 재료 가격 (크레딧)
export const MATERIAL_PRICES: Record<number, number> = {
  401208: 200, // 생명의 나무
  401209: 200, // 운석
  401301: 200, // 문스톤 (레거시)
  401304: 250, // 미스릴
  401401: 500, // VF 혈액 샘플
  401402: 200, // 진화의 돌 (레거시)
  401403: 350, // 포스 코어
};

export const getWeaponTypeFromEquipment = (equipment: Record<string, number>): string => {
  const weaponId = equipment["0"];
  if (!weaponId || weaponId <= 0) return "Unknown";
  const item = getItemById(weaponId);
  return (item as { weaponType?: string } | null)?.weaponType ?? "Unknown";
};

export const calcItemCredits = (equipment: Record<string, number>): number =>
  Object.values(equipment)
    .filter((id) => id > 0)
    .reduce((sum, id) => {
      const item = getItemById(id);
      const mat2 = (item as { makeMaterial2?: number } | null)?.makeMaterial2;
      return sum + (mat2 !== undefined ? (MATERIAL_PRICES[mat2] ?? 0) : 0);
    }, 0);

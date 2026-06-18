import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserGame } from "@repo/er-type";
import { MatchingMode } from "@repo/er-type";
import { writeStatus } from "./supabase";
import { createClient } from "./api";

const CURRENT_SEASON_ID = 39;
const SERVER_CODE = 10; // Asia server
const MATCHING_TEAM_MODE = 3;
const TOP_N = 500;
const BATCH_SIZE = 100;

type GameTeamRow = {
  game_id: number;
  team_rank: number;
  version_major: number;
  start_dtm: string;
  character_nums: number[];
  team_kills: number;
  team_assists: number;
  team_mmr_gain: number;
  is_premade: boolean;
  members: {
    character_num: number;
    player_kill: number;
    player_assistant: number;
    mmr_gain: number;
  }[];
};

export const collect = async (supabase: SupabaseClient, apiKey: string) => {
  const api = createClient(apiKey);
  const startedAt = new Date().toISOString();

  await writeStatus(supabase, {
    status: "collecting",
    started_at: startedAt,
    progress_current: 0,
    progress_total: 0,
  });

  console.log("[crawler] 랭커 목록 조회 중...");
  const allRankers = await api.getTopRankersByServer(
    CURRENT_SEASON_ID,
    MATCHING_TEAM_MODE,
    SERVER_CODE,
  );
  const rankers = allRankers.slice(0, TOP_N);
  console.log(`[crawler] 상위 ${rankers.length}명 수집 시작`);

  await writeStatus(supabase, {
    status: "collecting",
    started_at: startedAt,
    progress_current: 0,
    progress_total: rankers.length,
  });

  await pruneOldVersions(supabase);

  const rankerRows = rankers.map((r) => ({
    nickname: r.nickname,
    mmr: r.mmr,
    rank: r.rank,
    collected_at: startedAt,
  }));
  await upsertBatch(supabase, "rankers", rankerRows, "nickname");

  const gameBuffer: ReturnType<typeof gameToRow>[] = [];
  const matchupBuffer: ReturnType<typeof parseKillMatchups>[number][] = [];
  const collectedGameIds = new Set<number>();

  const flushBuffer = async () => {
    if (gameBuffer.length > 0) {
      await upsertBatch(supabase, "games", [...gameBuffer], "game_id,user_id");
      gameBuffer.length = 0;
    }
    if (matchupBuffer.length > 0) {
      await upsertBatch(
        supabase,
        "kill_matchups",
        [...matchupBuffer],
        "game_id,killer_char_num,killed_char_num",
      );
      matchupBuffer.length = 0;
    }
  };

  const rankFilter = (games: UserGame[]) =>
    games.filter(
      (g) =>
        g.matchingMode === MatchingMode.Rank &&
        g.matchingTeamMode === MATCHING_TEAM_MODE &&
        g.seasonId === CURRENT_SEASON_ID,
    );

  for (let i = 0; i < rankers.length; i++) {
    const ranker = rankers[i]!;

    const userInfo = await api.getUserByNickname(ranker.nickname);
    const userId = userInfo.userId;

    const page1 = await api.getUserGamesByUserId(userId);
    const collected = rankFilter(page1.data);

    if (collected.length < 10 && page1.next != null) {
      const page2 = await api.getUserGamesByUserId(userId, page1.next);
      collected.push(...rankFilter(page2.data));
    }

    for (const g of collected) {
      collectedGameIds.add(g.gameId);
      gameBuffer.push(gameToRow(g, userId));
      matchupBuffer.push(...parseKillMatchups(g));
    }

    if (gameBuffer.length >= BATCH_SIZE) await flushBuffer();

    const done = i + 1;
    if (done % 10 === 0 || done === rankers.length) {
      await writeStatus(supabase, {
        status: "collecting",
        started_at: startedAt,
        progress_current: done,
        progress_total: rankers.length,
      });
    }
    console.log(
      `[crawler] ${done}/${rankers.length} ${ranker.nickname} (게임 ${collected.length}판)`,
    );
  }

  await flushBuffer();

  console.log(
    `[crawler] 랭커 게임 수집 완료 — 고유 game_id ${collectedGameIds.size}개, 팀 조합 분석 시작`,
  );
  await collectGameTeams(supabase, api, collectedGameIds, startedAt);

  await writeStatus(supabase, {
    status: "idle",
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    progress_current: rankers.length,
    progress_total: rankers.length,
  });
  console.log("[crawler] 수집 완료");
};

const collectGameTeams = async (
  supabase: SupabaseClient,
  api: ReturnType<typeof createClient>,
  collectedGameIds: Set<number>,
  startedAt: string,
) => {
  if (collectedGameIds.size === 0) return;

  const existingIds = await fetchExistingGameTeamIds(supabase);
  const toFetch = [...collectedGameIds].filter((id) => !existingIds.has(id));
  console.log(
    `[crawler] game_teams 신규 ${toFetch.length}판 (스킵 ${collectedGameIds.size - toFetch.length}판)`,
  );

  const teamBuffer: GameTeamRow[] = [];

  for (let i = 0; i < toFetch.length; i++) {
    const gameId = toFetch[i]!;

    try {
      const all = await api.getGame(gameId);
      teamBuffer.push(...parseGameTeams(all));
    } catch (err) {
      console.log(
        `[crawler] getGame 실패 game_id=${gameId}:`,
        err instanceof Error ? err.message : err,
      );
    }

    if (teamBuffer.length >= BATCH_SIZE) {
      await upsertBatch(
        supabase,
        "game_teams",
        teamBuffer,
        "game_id,team_rank",
      );
      teamBuffer.length = 0;
    }

    const done = i + 1;
    if (done % 50 === 0 || done === toFetch.length) {
      console.log(`[crawler] game_teams ${done}/${toFetch.length}`);
    }
  }

  if (teamBuffer.length > 0) {
    await upsertBatch(supabase, "game_teams", teamBuffer, "game_id,team_rank");
  }

  await writeStatus(supabase, {
    status: "collecting",
    started_at: startedAt,
    progress_current: toFetch.length,
    progress_total: toFetch.length,
  });
};

const fetchExistingGameTeamIds = async (
  supabase: SupabaseClient,
): Promise<Set<number>> => {
  const { data, error } = await supabase.from("game_teams").select("game_id");
  if (error) throw new Error(`[game_teams] 조회 실패: ${error.message}`);
  return new Set((data ?? []).map((r) => r.game_id as number));
};

const parseGameTeams = (all: UserGame[]): GameTeamRow[] => {
  const ranked = all.filter(
    (p) =>
      p.matchingMode === MatchingMode.Rank &&
      p.matchingTeamMode === MATCHING_TEAM_MODE,
  );

  const byTeam = new Map<number, UserGame[]>();
  for (const p of ranked) {
    const list = byTeam.get(p.teamNumber) ?? [];
    list.push(p);
    byTeam.set(p.teamNumber, list);
  }

  const rows: GameTeamRow[] = [];
  for (const members of byTeam.values()) {
    if (members.length === 0) continue;
    const first = members[0]!;
    rows.push({
      game_id: first.gameId,
      team_rank: first.gameRank,
      version_major: first.versionMajor,
      start_dtm: first.startDtm,
      character_nums: members.map((m) => m.characterNum).sort((a, b) => a - b),
      team_kills: members.reduce((s, m) => s + m.playerKill, 0),
      team_assists: members.reduce((s, m) => s + m.playerAssistant, 0),
      team_mmr_gain: members.reduce((s, m) => s + m.mmrGain, 0),
      is_premade: first.preMade > 0,
      members: members.map((m) => ({
        character_num: m.characterNum,
        player_kill: m.playerKill,
        player_assistant: m.playerAssistant,
        mmr_gain: m.mmrGain,
      })),
    });
  }

  return rows;
};

const upsertBatch = async (
  supabase: SupabaseClient,
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
) => {
  if (rows.length === 0) return;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict, ignoreDuplicates: true });
    if (error) throw new Error(`[${table}] upsert 실패: ${error.message}`);
  }
};

const pruneOldVersions = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("games")
    .select("version_major")
    .order("version_major", { ascending: false });

  if (error || !data) return;

  const uniqueVersions = [
    ...new Set(data.map((r) => r.version_major as number)),
  ];
  if (uniqueVersions.length <= 2) return;

  const toDelete = uniqueVersions.slice(2);
  for (const ver of toDelete) {
    await supabase.from("game_teams").delete().eq("version_major", ver);

    const { data: gameIds } = await supabase
      .from("games")
      .select("game_id")
      .eq("version_major", ver);

    if (gameIds && gameIds.length > 0) {
      const ids = gameIds.map((r) => r.game_id as number);
      await supabase.from("kill_matchups").delete().in("game_id", ids);
    }

    await supabase.from("games").delete().eq("version_major", ver);
    console.log(`[crawler] v${ver} 데이터 삭제`);
  }
};

const parseKillMatchups = (g: UserGame) => {
  try {
    const details: Record<string, number> = g.killDetails
      ? JSON.parse(g.killDetails)
      : {};
    return Object.entries(details).map(([killedCharStr, count]) => ({
      game_id: g.gameId,
      killer_char_num: g.characterNum,
      killed_char_num: parseInt(killedCharStr, 10),
      count,
    }));
  } catch {
    return [];
  }
};

const gameToRow = (g: UserGame, userId: string) => ({
  game_id: g.gameId,
  user_id: userId,
  season_id: g.seasonId,
  version_major: g.versionMajor,
  version_minor: g.versionMinor,
  matching_team_mode: g.matchingTeamMode,
  character_num: g.characterNum,
  game_rank: g.gameRank,
  team_number: g.teamNumber,
  start_dtm: g.startDtm,
  play_time: g.playTime,
  player_kill: g.playerKill,
  player_assistant: g.playerAssistant,
  player_deaths: g.playerDeaths,
  team_kill: g.teamKill,
  terminate_count: g.terminateCount,
  kills_phase_one: g.killsPhaseOne,
  kills_phase_two: g.killsPhaseTwo,
  kills_phase_three: g.killsPhaseThree,
  cc_time_to_player: g.ccTimeToPlayer,
  total_double_kill: g.totalDoubleKill,
  total_triple_kill: g.totalTripleKill,
  total_quadra_kill: g.totalQuadraKill,
  damage_to_player: g.damageToPlayer,
  damage_from_player: g.damageFromPlayer,
  damage_offseted_by_shield: g.damageOffsetedByShield_Player,
  damage_to_monster: g.damageToMonster,
  heal_amount: g.healAmount,
  team_recover: g.teamRecover,
  protect_absorb: g.protectAbsorb,
  equipment: g.equipment,
  equip_first_item_for_log: g.equipFirstItemForLog,
  craft_uncommon: g.craftUncommon,
  craft_rare: g.craftRare,
  craft_epic: g.craftEpic,
  craft_legend: g.craftLegend,
  craft_mythic: g.craftMythic,
  trait_first_core: g.traitFirstCore,
  trait_first_sub: g.traitFirstSub,
  trait_second_sub: g.traitSecondSub,
  tactical_skill_group: g.tacticalSkillGroup,
  tactical_skill_level: g.tacticalSkillLevel,
  tactical_skill_use_count: g.tacticalSkillUseCount,
  final_infusion: g.finalInfusion,
  skill_order_info: g.skillOrderInfo,
  view_contribution: g.viewContribution,
  add_telephoto_camera: g.addTelephotoCamera,
  add_surveillance_camera: g.addSurveillanceCamera,
  use_recon_drone: g.useReconDrone,
  use_emp_drone: g.useEmpDrone,
  kill_monsters: g.killMonsters,
  item_transferred_drone: g.itemTransferredDrone,
  item_transferred_console: g.itemTransferredConsole,
  place_of_start: g.placeOfStart,
  place_of_death: g.placeOfDeath,
  killer_character: g.killerCharacter,
  killer_weapon: g.killerWeapon,
  route_id_of_start: g.routeIdOfStart,
  use_hyper_loop: g.useHyperLoop,
  total_gain_vf_credit: g.totalGainVFCredit,
  sum_used_vf_credits: g.sumUsedVFCredits,
  credit_source: g.creditSource,
  adaptive_force: g.adaptiveForce,
  adaptive_force_attack: g.adaptiveForceAttack,
  adaptive_force_amplify: g.adaptiveForceAmplify,
  max_hp: g.maxHp,
  attack_power: g.attackPower,
  defense: g.defense,
  cool_down_reduction: g.coolDownReduction,
  get_buff_cube_red: g.getBuffCubeRed,
  get_buff_cube_purple: g.getBuffCubePurple,
  get_buff_cube_green: g.getBuffCubeGreen,
  get_buff_cube_gold: g.getBuffCubeGold,
  enter_dimension_rift: g.enterDimensionRift,
  win_from_dimension_rift: g.winFromDimensionRift,
  battle_zone_player_kill: g.battleZonePlayerKill,
  main_weather: g.mainWeather,
  sub_weather: g.subWeather,
});

import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserGame } from '@repo/er-type';
import { MatchingMode, MatchingTeamMode } from '@repo/er-type';
import { writeStatus } from './supabase';
import { createClient } from './api';

const CURRENT_SEASON_ID = 39;
const SERVER_CODE = 'AS';
const BATCH_SIZE = 100;

export const collect = async (supabase: SupabaseClient, apiKey: string) => {
  const api = createClient(apiKey);
  const startedAt = new Date().toISOString();

  await writeStatus(supabase, { status: 'collecting', started_at: startedAt, progress_current: 0, progress_total: 0 });

  console.log('[crawler] 랭커 목록 조회 중...');
  const rankers = await api.getTopRankersByServer(CURRENT_SEASON_ID, MatchingTeamMode.Solo, SERVER_CODE);
  console.log(`[crawler] 랭커 ${rankers.length}명`);

  await writeStatus(supabase, { status: 'collecting', started_at: startedAt, progress_current: 0, progress_total: rankers.length });

  await pruneOldVersions(supabase);

  const rankerRows = rankers.map((r) => ({
    user_num: r.userNum,
    nickname: r.nickname,
    mmr: r.mmr,
    rank: r.rank,
    collected_at: startedAt,
  }));
  await upsertBatch(supabase, 'rankers', rankerRows, 'user_num');

  const gameBuffer: ReturnType<typeof gameToRow>[] = [];
  const matchupBuffer: ReturnType<typeof parseKillMatchups>[number][] = [];

  const flushBuffer = async () => {
    if (gameBuffer.length > 0) {
      await upsertBatch(supabase, 'games', [...gameBuffer], 'game_id,user_num');
      gameBuffer.length = 0;
    }
    if (matchupBuffer.length > 0) {
      await upsertBatch(supabase, 'kill_matchups', [...matchupBuffer], 'game_id,killer_char_num,killed_char_num');
      matchupBuffer.length = 0;
    }
  };

  const soloRank = (games: UserGame[]) =>
    games.filter(
      (g) =>
        g.matchingMode === MatchingMode.Rank &&
        g.matchingTeamMode === MatchingTeamMode.Solo &&
        g.seasonId === CURRENT_SEASON_ID
    );

  for (let i = 0; i < rankers.length; i++) {
    const ranker = rankers[i]!;

    const page1 = await api.getUserGamesByUserNum(ranker.userNum);
    const collected = soloRank(page1.data);

    if (collected.length < 10 && page1.next != null) {
      const page2 = await api.getUserGamesByUserNum(ranker.userNum, page1.next);
      collected.push(...soloRank(page2.data));
    }

    for (const g of collected) {
      gameBuffer.push(gameToRow(g, ranker.userNum));
      matchupBuffer.push(...parseKillMatchups(g));
    }

    if (gameBuffer.length >= BATCH_SIZE) await flushBuffer();

    const done = i + 1;
    if (done % 10 === 0 || done === rankers.length) {
      await writeStatus(supabase, {
        status: 'collecting',
        started_at: startedAt,
        progress_current: done,
        progress_total: rankers.length,
      });
    }
    console.log(`[crawler] ${done}/${rankers.length} ${ranker.nickname} (게임 ${collected.length}판)`);
  }

  await flushBuffer();

  await writeStatus(supabase, {
    status: 'idle',
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    progress_current: rankers.length,
    progress_total: rankers.length,
  });
  console.log('[crawler] 수집 완료');
};

const upsertBatch = async (
  supabase: SupabaseClient,
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string
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
    .from('games')
    .select('version_major')
    .order('version_major', { ascending: false });

  if (error || !data) return;

  const uniqueVersions = [...new Set(data.map((r) => r.version_major as number))];
  if (uniqueVersions.length <= 2) return;

  const toDelete = uniqueVersions.slice(2);
  for (const ver of toDelete) {
    const { data: gameIds } = await supabase
      .from('games')
      .select('game_id')
      .eq('version_major', ver);

    if (gameIds && gameIds.length > 0) {
      const ids = gameIds.map((r) => r.game_id as number);
      await supabase.from('kill_matchups').delete().in('game_id', ids);
    }

    await supabase.from('games').delete().eq('version_major', ver);
    console.log(`[crawler] v${ver} 데이터 삭제`);
  }
};

const parseKillMatchups = (g: UserGame) => {
  try {
    const details: Record<string, number> = g.killDetails ? JSON.parse(g.killDetails) : {};
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

const gameToRow = (g: UserGame, userNum: number) => ({
  game_id:                   g.gameId,
  user_num:                  userNum,
  season_id:                 g.seasonId,
  version_major:             g.versionMajor,
  version_minor:             g.versionMinor,
  matching_team_mode:        g.matchingTeamMode,
  character_num:             g.characterNum,
  game_rank:                 g.gameRank,
  team_number:               g.teamNumber,
  start_dtm:                 g.startDtm,
  play_time:                 g.playTime,
  player_kill:               g.playerKill,
  player_assistant:          g.playerAssistant,
  player_deaths:             g.playerDeaths,
  team_kill:                 g.teamKill,
  terminate_count:           g.terminateCount,
  kills_phase_one:           g.killsPhaseOne,
  kills_phase_two:           g.killsPhaseTwo,
  kills_phase_three:         g.killsPhaseThree,
  cc_time_to_player:         g.ccTimeToPlayer,
  total_double_kill:         g.totalDoubleKill,
  total_triple_kill:         g.totalTripleKill,
  total_quadra_kill:         g.totalQuadraKill,
  damage_to_player:          g.damageToPlayer,
  damage_from_player:        g.damageFromPlayer,
  damage_offseted_by_shield: g.damageOffsetedByShield_Player,
  damage_to_monster:         g.damageToMonster,
  heal_amount:               g.healAmount,
  team_recover:              g.teamRecover,
  protect_absorb:            g.protectAbsorb,
  equipment:                 g.equipment,
  equip_first_item_for_log:  g.equipFirstItemForLog,
  craft_uncommon:            g.craftUncommon,
  craft_rare:                g.craftRare,
  craft_epic:                g.craftEpic,
  craft_legend:              g.craftLegend,
  craft_mythic:              g.craftMythic,
  trait_first_core:          g.traitFirstCore,
  trait_first_sub:           g.traitFirstSub,
  trait_second_sub:          g.traitSecondSub,
  tactical_skill_group:      g.tacticalSkillGroup,
  tactical_skill_level:      g.tacticalSkillLevel,
  tactical_skill_use_count:  g.tacticalSkillUseCount,
  final_infusion:            g.finalInfusion,
  skill_order_info:          g.skillOrderInfo,
  view_contribution:         g.viewContribution,
  add_telephoto_camera:      g.addTelephotoCamera,
  add_surveillance_camera:   g.addSurveillanceCamera,
  use_recon_drone:           g.useReconDrone,
  use_emp_drone:             g.useEmpDrone,
  kill_monsters:             g.killMonsters,
  item_transferred_drone:    g.itemTransferredDrone,
  item_transferred_console:  g.itemTransferredConsole,
  place_of_start:            g.placeOfStart,
  place_of_death:            g.placeOfDeath,
  killer_character:          g.killerCharacter,
  killer_weapon:             g.killerWeapon,
  route_id_of_start:         g.routeIdOfStart,
  use_hyper_loop:            g.useHyperLoop,
  total_gain_vf_credit:      g.totalGainVFCredit,
  sum_used_vf_credits:       g.sumUsedVFCredits,
  credit_source:             g.creditSource,
  adaptive_force:            g.adaptiveForce,
  adaptive_force_attack:     g.adaptiveForceAttack,
  adaptive_force_amplify:    g.adaptiveForceAmplify,
  max_hp:                    g.maxHp,
  attack_power:              g.attackPower,
  defense:                   g.defense,
  cool_down_reduction:       g.coolDownReduction,
  get_buff_cube_red:         g.getBuffCubeRed,
  get_buff_cube_purple:      g.getBuffCubePurple,
  get_buff_cube_green:       g.getBuffCubeGreen,
  get_buff_cube_gold:        g.getBuffCubeGold,
  enter_dimension_rift:      g.enterDimensionRift,
  win_from_dimension_rift:   g.winFromDimensionRift,
  battle_zone_player_kill:   g.battleZonePlayerKill,
  main_weather:              g.mainWeather,
  sub_weather:               g.subWeather,
});

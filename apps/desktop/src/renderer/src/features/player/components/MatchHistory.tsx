import { useState } from "react";
import type { UserGame } from "@repo/er-type";
import styled from "styled-components";
import { Badge } from "@repo/ui";
import {
  formatDuration,
  formatDate,
  timeAgo,
} from "../../../shared/utils/format";
import {
  getCharacterById,
  getCharacterByKey,
  getItemById,
  getMasteryByKey,
  getMasteryIconUrl,
  getAreaByKey,
  getMonsterByKey,
  normalizeImageUrl,
} from "../../../shared/utils/meta";

// ─── constants ────────────────────────────────────────────────────────────────
const GRADE_COLOR: Record<string, string> = {
  Common: "#6b7280",
  Uncommon: "#4ade80",
  Rare: "#60a5fa",
  Epic: "#c084fc",
  Legend: "#fb923c",
  Myth: "#f43f5e",
};

function gradeColor(grade: string): string {
  return GRADE_COLOR[grade] ?? GRADE_COLOR.Common;
}

const TEAM_LABEL = ["", "솔로", "듀오", "스쿼드", "스쿼드"];

const MODE_LABEL: Record<number, string> = {
  3: "랭크",
  6: "스쿼드럼블",
  8: "코발트",
};

const CAUSE_LABEL: Record<string, string> = {
  Player: "플레이어",
  Zone: "안전구역",
  Execution: "처형",
  GiveUp: "자진 포기",
  Bot: "봇",
  Trap: "설치물",
  Monster: "몬스터",
  Fall: "낙사",
  Drowning: "익사",
};

function getCauseLabel(cause: string): string {
  return CAUSE_LABEL[cause] ?? cause;
}

const CREDIT_SOURCE_LABEL: Record<string, string> = {
  Monster: "동물",
  Kill: "플킬",
  Box: "상자",
  Start: "기본",
  Survive: "생존",
  Win: "승리",
  ObjectCapture: "오브젝트",
  Drone: "드론",
  InGame: "인게임",
  PlayerKill: "플킬",
  MonsterKill: "동물",
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function getWeaponType(
  item: ReturnType<typeof getItemById>,
): string | undefined {
  if (!item) return undefined;
  return (item as Record<string, unknown>).weaponType as string | undefined;
}

function parseKillEntries(
  raw: string,
): Array<{ charId: number; count: number }> {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return Object.entries(parsed as Record<string, number>)
        .map(([key, count]) => ({
          charId: Number(key),
          count: count as number,
        }))
        .filter((e) => e.charId > 0 && e.count > 0);
    }
    if (Array.isArray(parsed)) {
      return (parsed as Array<Record<string, unknown>>)
        .map((e) => ({
          charId: Number(e.characterNum ?? e.charNum ?? 0),
          count: Number(e.count ?? 1),
        }))
        .filter((e) => e.charId > 0);
    }
  } catch {
    /**/
  }
  return [];
}

// ─── styled ───────────────────────────────────────────────────────────────────
const Label = styled.p`
  ${({ theme }) => theme.typography.styles.smallBold}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing[4]};
  text-transform: ${({ theme }) => theme.typography.textTransform.uppercase};
  letter-spacing: 0.6px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const placementBorderColor = (
  placement: number,
  theme: {
    colors: {
      brand: { green: string };
      semantic: { warning: string; negative: string };
    };
  },
) => {
  if (placement === 1) return theme.colors.brand.green;
  if (placement <= 3) return theme.colors.semantic.warning;
  return theme.colors.semantic.negative;
};

const ItemWrapper = styled.div<{ $placement: number }>`
  border-radius: ${({ theme }) => theme.radius.comfortable};
  border-left: 3px solid
    ${({ theme, $placement }) => placementBorderColor($placement, theme)};
  background-color: ${({ theme, $placement }) =>
    `${placementBorderColor($placement, theme)}10`};
  overflow: hidden;
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: 80px 108px 1fr 180px 80px 36px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[3]};
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated}20;
  }
`;

const RankSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const RankNumber = styled.span<{ $placement: number }>`
  ${({ theme }) => theme.typography.styles.featureHeading}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.title};
  color: ${({ theme, $placement }) => placementBorderColor($placement, theme)};
  line-height: 1;
`;

const ModeRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const ModeChip = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.radius.standard};
  padding: 1px 5px;
`;

const CharSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  min-width: 0;
`;

const CharImgWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const CharImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.standard};
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: block;
`;

const CharImgFallback = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.standard};
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LevelBadge = styled.span`
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: ${({ theme }) => theme.colors.background.base};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: 4px;
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0 3px;
  line-height: 14px;
`;

const CharInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const CharName = styled.span`
  ${({ theme }) => theme.typography.styles.captionBold}
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WeaponRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WeaponIcon = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
  opacity: 0.8;
`;

const WeaponText = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const KillRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  ${({ theme }) => theme.typography.styles.caption}
`;

const KillLabel = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const KillNum = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const KillSep = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 0 1px;
`;

const DamageText = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MmrText = styled.span<{ $positive: boolean }>`
  ${({ theme }) => theme.typography.styles.micro}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ $positive, theme }) =>
    $positive ? theme.colors.brand.green : theme.colors.semantic.negative};
`;

const ItemsSection = styled.div`
  display: flex;
  gap: 3px;
  align-items: center;
`;

const ItemSlot = styled.div<{ $gradeColor: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.standard};
  border: 1.5px solid ${({ $gradeColor }) => $gradeColor};
  background: ${({ $gradeColor }) => $gradeColor}20;
  overflow: hidden;
  flex-shrink: 0;
`;

const ItemIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EmptyItemSlot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.standard};
  border: 1.5px solid ${({ theme }) => theme.colors.border.subtle};
  background: ${({ theme }) => theme.colors.background.elevated}40;
  flex-shrink: 0;
`;

const TimeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const TimeAgoText = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DurationText = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const ToggleButton = styled.button<{ $expanded: boolean }>`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
  cursor: pointer;
`;

// Detail panel
const DetailPanel = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const SectionTitle = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const SectionDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.subtle};
`;

const StatGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[5]};
`;

const StatCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 48px;
`;

const StatLabel = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`;

const StatValue = styled.span<{ $accent?: boolean }>`
  ${({ theme }) => theme.typography.styles.captionBold}
  color: ${({ theme, $accent }) =>
    $accent ? theme.colors.brand.green : theme.colors.text.primary};
`;

const SectionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
`;

const BestWeaponCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const BestWeaponImg = styled.img`
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const BestWeaponName = styled.span`
  ${({ theme }) => theme.typography.styles.small}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BestWeaponLevel = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.brand.green};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const MmrDetailText = styled.span`
  ${({ theme }) => theme.typography.styles.small}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MmrAccent = styled.span<{ $positive: boolean }>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.brand.green : theme.colors.semantic.negative};
`;

const GameInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`;

const GameInfoItem = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const GameInfoDot = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

// ─── kill / death styled ──────────────────────────────────────────────────────
const KillerCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2.5]};
`;

const KillerPortrait = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radius.standard};
  object-fit: cover;
  border: 1.5px solid ${({ theme }) => theme.colors.semantic.negative}60;
  flex-shrink: 0;
`;

const KillerPortraitFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radius.standard};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1.5px solid ${({ theme }) => theme.colors.semantic.negative}60;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.typography.styles.captionBold}
  color: ${({ theme }) => theme.colors.semantic.negative};
  flex-shrink: 0;
`;

const KillerInfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const KillerCharName = styled.span`
  ${({ theme }) => theme.typography.styles.captionBold}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const KillerWeaponRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const KillerWeaponIcon = styled.img`
  width: 14px;
  height: 14px;
  opacity: 0.75;
  flex-shrink: 0;
`;

const KillerDetailText = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const KillerNickname = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const AssistRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const AssistLabel = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AssistChip = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.standard};
  padding: 1px 6px;
`;

// ─── kill entries ─────────────────────────────────────────────────────────────
const KillCharGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const KillCharChip = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.standard};
  padding: 3px 8px 3px 3px;
`;

const KillCharPortrait = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 3px;
  object-fit: cover;
  flex-shrink: 0;
`;

const KillCharPortraitFallback = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  flex-shrink: 0;
`;

const KillCharNameText = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const KillCharCountBadge = styled.span`
  ${({ theme }) => theme.typography.styles.micro}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.brand.green};
`;

// ─── MatchHistoryItem ─────────────────────────────────────────────────────────
function MatchHistoryItem({ game }: { game: UserGame }) {
  const [expanded, setExpanded] = useState(false);

  const myChar = getCharacterById(game.characterNum);
  const bestWeaponItem = getItemById(game.bestWeapon);
  const weaponType = getWeaponType(bestWeaponItem);
  const masteryIconUrl = weaponType ? getMasteryIconUrl(weaponType) : null;
  const masteryMeta = weaponType ? getMasteryByKey(weaponType) : null;

  const equipSlots = Object.entries(game.equipment)
    .filter(([, id]) => id > 0)
    .sort(([a], [b]) => Number(a) - Number(b))
    .slice(0, 5);

  const modeLabel = MODE_LABEL[game.matchingMode] ?? "일반";
  const isRanked = game.matchingMode === 3 || game.matchingMode === 6;
  const isSolo = game.matchingTeamMode === 1;
  const teamLabel = TEAM_LABEL[game.matchingTeamMode] ?? "";

  const isDead = !!game.killer;
  const killerChar = game.killerCharacter
    ? getCharacterByKey(game.killerCharacter)
    : null;
  const killerWeaponMeta = game.killerWeapon
    ? getMasteryByKey(game.killerWeapon)
    : null;
  const killerWeaponIconUrl = game.killerWeapon
    ? getMasteryIconUrl(game.killerWeapon)
    : null;
  const deathArea = game.placeOfDeath ? getAreaByKey(game.placeOfDeath) : null;

  const mmrSign = game.mmrGain >= 0 ? "+" : "";

  const killEntries = parseKillEntries(game.killDetails);

  const monsterEntries = Object.entries(game.killMonsters ?? {}).filter(
    ([, count]) => count > 0,
  );
  const creditEntries = Object.entries(game.creditSource ?? {})
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <ItemWrapper $placement={game.gameRank}>
      <SummaryRow onClick={() => setExpanded((v) => !v)}>
        {/* Rank */}
        <RankSection>
          <RankNumber $placement={game.gameRank}>{game.gameRank}위</RankNumber>
          {game.gameRank === 1 && <Badge variant="positive">WIN</Badge>}
          <ModeRow>
            <ModeChip>{modeLabel}</ModeChip>
            <ModeChip>{teamLabel}</ModeChip>
          </ModeRow>
        </RankSection>

        {/* Character */}
        <CharSection>
          <CharImgWrapper>
            {myChar ? (
              <CharImg src={normalizeImageUrl(myChar.imageUrl)} alt="" />
            ) : (
              <CharImgFallback>#{game.characterNum}</CharImgFallback>
            )}
            <LevelBadge>{game.characterLevel}</LevelBadge>
          </CharImgWrapper>
          <CharInfo>
            <CharName>{myChar?.name ?? `#${game.characterNum}`}</CharName>
            {masteryIconUrl && (
              <WeaponRow>
                <WeaponIcon src={masteryIconUrl} alt="" />
                {masteryMeta && <WeaponText>{masteryMeta.name}</WeaponText>}
              </WeaponRow>
            )}
          </CharInfo>
        </CharSection>

        {/* Stats */}
        <StatsSection>
          <KillRow>
            {!isSolo && (
              <>
                <KillLabel>TK</KillLabel>
                <KillNum>{game.teamKill}</KillNum>
                <KillSep>/</KillSep>
              </>
            )}
            <KillLabel>K</KillLabel>
            <KillNum>{game.playerKill}</KillNum>
            <KillSep>/</KillSep>
            <KillLabel>A</KillLabel>
            <KillNum>{game.playerAssistant}</KillNum>
          </KillRow>
          <DamageText>딜량 {game.damageToPlayer.toLocaleString()}</DamageText>
          {isRanked && (
            <MmrText $positive={game.mmrGain >= 0}>
              MMR {mmrSign}
              {game.mmrGain}
            </MmrText>
          )}
        </StatsSection>

        {/* Equipment */}
        <ItemsSection>
          {equipSlots.map(([slot, itemId]) => {
            const item = getItemById(itemId);
            const gc = gradeColor(
              (item as Record<string, unknown>)?.grade as string,
            );
            return (
              <ItemSlot key={slot} $gradeColor={gc}>
                {item && <ItemIcon src={item.imageUrl} alt="" />}
              </ItemSlot>
            );
          })}
          {Array.from({ length: Math.max(0, 5 - equipSlots.length) }).map(
            (_, i) => (
              <EmptyItemSlot key={`e${i}`} />
            ),
          )}
        </ItemsSection>

        {/* Time */}
        <TimeSection>
          <TimeAgoText>{timeAgo(game.startDtm)}</TimeAgoText>
          <DurationText>{formatDuration(game.playTime)}</DurationText>
        </TimeSection>

        {/* Toggle */}
        <ToggleButton $expanded={expanded}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 5L7 9.5L11.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToggleButton>
      </SummaryRow>

      {expanded && (
        <DetailPanel>
          {/* ── 전투 ── */}
          <SectionRow>
            <SectionTitle>전투</SectionTitle>
            <StatGrid>
              <StatCell>
                <StatLabel>1페 킬</StatLabel>
                <StatValue>{game.killsPhaseOne}</StatValue>
              </StatCell>
              <StatCell>
                <StatLabel>2페 킬</StatLabel>
                <StatValue>{game.killsPhaseTwo}</StatValue>
              </StatCell>
              <StatCell>
                <StatLabel>3페 킬</StatLabel>
                <StatValue>{game.killsPhaseThree}</StatValue>
              </StatCell>
              {game.totalDoubleKill > 0 && (
                <StatCell>
                  <StatLabel>더블킬</StatLabel>
                  <StatValue $accent>{game.totalDoubleKill}</StatValue>
                </StatCell>
              )}
              {game.totalTripleKill > 0 && (
                <StatCell>
                  <StatLabel>트리플킬</StatLabel>
                  <StatValue $accent>{game.totalTripleKill}</StatValue>
                </StatCell>
              )}
              {game.totalQuadraKill > 0 && (
                <StatCell>
                  <StatLabel>쿼드라킬</StatLabel>
                  <StatValue $accent>{game.totalQuadraKill}</StatValue>
                </StatCell>
              )}
              {game.totalExtraKill > 0 && (
                <StatCell>
                  <StatLabel>펜타킬+</StatLabel>
                  <StatValue $accent>{game.totalExtraKill}</StatValue>
                </StatCell>
              )}
            </StatGrid>
          </SectionRow>

          <SectionDivider />

          {/* ── 피해 / 생존 ── */}
          <SectionRow>
            <SectionTitle>피해 / 생존</SectionTitle>
            <StatGrid>
              <StatCell>
                <StatLabel>가한 피해</StatLabel>
                <StatValue>{game.damageToPlayer.toLocaleString()}</StatValue>
              </StatCell>
              <StatCell>
                <StatLabel>받은 피해</StatLabel>
                <StatValue>{game.damageFromPlayer.toLocaleString()}</StatValue>
              </StatCell>
              <StatCell>
                <StatLabel>힐량</StatLabel>
                <StatValue>{game.healAmount.toLocaleString()}</StatValue>
              </StatCell>
              {!isSolo && game.teamRecover > 0 && (
                <StatCell>
                  <StatLabel>팀 힐</StatLabel>
                  <StatValue>{game.teamRecover.toLocaleString()}</StatValue>
                </StatCell>
              )}
              {game.ccTimeToPlayer > 0 && (
                <StatCell>
                  <StatLabel>CC 시간</StatLabel>
                  <StatValue>{game.ccTimeToPlayer.toFixed(1)}s</StatValue>
                </StatCell>
              )}
            </StatGrid>
          </SectionRow>

          <SectionDivider />

          {/* ── 파밍 / 제작 ── */}
          <SectionRow>
            <SectionTitle>파밍 / 제작</SectionTitle>
            <StatGrid>
              {monsterEntries.length > 0 ? (
                monsterEntries.map(([key, count]) => {
                  const monster = getMonsterByKey(key);
                  return (
                    <StatCell key={key}>
                      <StatLabel>{monster?.name ?? key}</StatLabel>
                      <StatValue>{count}</StatValue>
                    </StatCell>
                  );
                })
              ) : (
                <StatCell>
                  <StatLabel>동물 처치</StatLabel>
                  <StatValue>{game.monsterKill}</StatValue>
                </StatCell>
              )}
              {game.craftRare > 0 && (
                <StatCell>
                  <StatLabel>희귀 제작</StatLabel>
                  <StatValue>{game.craftRare}</StatValue>
                </StatCell>
              )}
              {game.craftEpic > 0 && (
                <StatCell>
                  <StatLabel>영웅 제작</StatLabel>
                  <StatValue>{game.craftEpic}</StatValue>
                </StatCell>
              )}
              {game.craftLegend > 0 && (
                <StatCell>
                  <StatLabel>전설 제작</StatLabel>
                  <StatValue>{game.craftLegend}</StatValue>
                </StatCell>
              )}
              {game.craftMythic > 0 && (
                <StatCell>
                  <StatLabel>신화 제작</StatLabel>
                  <StatValue>{game.craftMythic}</StatValue>
                </StatCell>
              )}
            </StatGrid>
          </SectionRow>

          {/* ── 크레딧 수입원 ── */}
          {creditEntries.length > 0 && (
            <>
              <SectionDivider />
              <SectionRow>
                <SectionTitle>크레딧 수입원</SectionTitle>
                <StatGrid>
                  {creditEntries.map(([key, amount]) => (
                    <StatCell key={key}>
                      <StatLabel>{CREDIT_SOURCE_LABEL[key] ?? key}</StatLabel>
                      <StatValue>{amount.toLocaleString()}</StatValue>
                    </StatCell>
                  ))}
                </StatGrid>
              </SectionRow>
            </>
          )}

          <SectionDivider />

          {/* ── 빌드 / MMR ── */}
          <DetailRow>
            {bestWeaponItem && (
              <BestWeaponCell>
                <BestWeaponImg src={bestWeaponItem.imageUrl} alt="" />
                <BestWeaponName>{bestWeaponItem.name}</BestWeaponName>
                {game.bestWeaponLevel > 0 && (
                  <BestWeaponLevel>+{game.bestWeaponLevel}</BestWeaponLevel>
                )}
              </BestWeaponCell>
            )}
            {isRanked && (
              <MmrDetailText>
                MMR {game.mmrBefore} → {game.mmrAfter}{" "}
                <MmrAccent $positive={game.mmrGain >= 0}>
                  ({mmrSign}
                  {game.mmrGain})
                </MmrAccent>
              </MmrDetailText>
            )}
          </DetailRow>

          <SectionDivider />

          {/* ── 게임 정보 ── */}
          <GameInfoRow>
            <GameInfoItem>#{game.gameId}</GameInfoItem>
            <GameInfoDot>·</GameInfoDot>
            <GameInfoItem>{formatDate(game.startDtm)}</GameInfoItem>
            <GameInfoDot>·</GameInfoDot>
            <GameInfoItem>{game.serverName}</GameInfoItem>
            <GameInfoDot>·</GameInfoDot>
            <GameInfoItem>
              v{game.versionMajor}.{game.versionMinor}
            </GameInfoItem>
          </GameInfoRow>

          {/* ── 처치 정보 ── */}
          {(isDead || game.playerKill > 0) && (
            <>
              <SectionDivider />

              {/* 나를 처치한 플레이어 */}
              {isDead && (
                <SectionRow>
                  <SectionTitle>나를 처치한 플레이어</SectionTitle>
                  <KillerCard>
                    {killerChar ? (
                      <KillerPortrait
                        src={normalizeImageUrl(killerChar.imageUrl)}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.visibility =
                            "hidden";
                        }}
                      />
                    ) : (
                      <KillerPortraitFallback>†</KillerPortraitFallback>
                    )}
                    <KillerInfoBlock>
                      <KillerCharName>
                        {killerChar?.name ?? game.killerCharacter}
                      </KillerCharName>
                      <KillerWeaponRow>
                        {killerWeaponIconUrl && (
                          <KillerWeaponIcon
                            src={killerWeaponIconUrl}
                            alt=""
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                        <KillerDetailText>
                          {killerWeaponMeta?.name}
                          {deathArea && ` · ${deathArea.name}`}
                          {game.causeOfDeath &&
                            game.causeOfDeath !== "Player" &&
                            ` · ${getCauseLabel(game.causeOfDeath)}`}
                        </KillerDetailText>
                      </KillerWeaponRow>
                      {game.killer && (
                        <KillerNickname>{game.killer}</KillerNickname>
                      )}
                    </KillerInfoBlock>
                  </KillerCard>
                  {(game.killer2 || game.killer3) && (
                    <AssistRow>
                      <AssistLabel>어시스트</AssistLabel>
                      {game.killer2 && <AssistChip>{game.killer2}</AssistChip>}
                      {game.killer3 && <AssistChip>{game.killer3}</AssistChip>}
                    </AssistRow>
                  )}
                </SectionRow>
              )}

              {/* 내가 처치한 플레이어 */}
              {game.playerKill > 0 && (
                <SectionRow>
                  <SectionTitle>
                    내가 처치한 플레이어 ({game.playerKill}명)
                  </SectionTitle>
                  {killEntries.length > 0 ? (
                    <KillCharGrid>
                      {killEntries.map(({ charId, count }) => {
                        const char = getCharacterById(charId);
                        return (
                          <KillCharChip key={charId}>
                            {char ? (
                              <KillCharPortrait
                                src={normalizeImageUrl(char.imageUrl)}
                                alt=""
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <KillCharPortraitFallback />
                            )}
                            <KillCharNameText>
                              {char?.name ?? `#${charId}`}
                            </KillCharNameText>
                            {count > 1 && (
                              <KillCharCountBadge>×{count}</KillCharCountBadge>
                            )}
                          </KillCharChip>
                        );
                      })}
                    </KillCharGrid>
                  ) : (
                    <KillerDetailText>
                      {game.playerKill}명 처치 (상세 정보 없음)
                    </KillerDetailText>
                  )}
                </SectionRow>
              )}
            </>
          )}
        </DetailPanel>
      )}
    </ItemWrapper>
  );
}

// ─── MatchHistory ─────────────────────────────────────────────────────────────
interface Props {
  games: UserGame[];
}

export function MatchHistory({ games }: Props) {
  if (games.length === 0) return null;

  return (
    <>
      <Label>최근 전적</Label>
      <List>
        {games.map((game, i) => (
          <MatchHistoryItem key={game.gameId ?? i} game={game} />
        ))}
      </List>
    </>
  );
}

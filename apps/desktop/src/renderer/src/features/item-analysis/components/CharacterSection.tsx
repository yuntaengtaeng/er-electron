import styled, { css } from "styled-components";
import { Text } from "@repo/ui";
import {
  getCharacterById,
  getItemById,
  getMasteryByKey,
  normalizeImageUrl,
} from "../../../shared/utils/meta";
import type { CharacterItemAnalysis, WeaponTypeAnalysis } from "@repo/service";

const SLOT_LABELS: Record<string, string> = {
  "0": "무기",
  "1": "갑옷",
  "2": "투구",
  "3": "장갑",
  "4": "신발",
};
const SLOT_ORDER = ["0", "1", "2", "3", "4"];

// ─── styled ───────────────────────────────────────────────────────────────────

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const CharAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.background.elevated};
`;

const CharAvatarPlaceholder = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`;

const TotalCount = styled.span`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-left: auto;
`;

const WeaponSection = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }
`;

const WeaponHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const WeaponIcon = styled.img`
  width: 20px;
  height: 20px;
  opacity: 0.8;
`;

const WeaponCount = styled.span`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-left: auto;
`;

const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const SlotColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const SlotLabel = styled.div`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
  padding-bottom: ${({ theme }) => theme.spacing[1]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const ItemIcon = styled.img`
  width: 22px;
  height: 22px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  object-fit: cover;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.background.elevated};
`;

const ItemIconPlaceholder = styled.div`
  width: 22px;
  height: 22px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemPct = styled.div`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[5]};
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatLabel = styled.span`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatValue = styled.span`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.primary};
`;

// ─── sub-component ────────────────────────────────────────────────────────────

const WeaponTypeSection = ({ data }: { data: WeaponTypeAnalysis }) => {
  const mastery = getMasteryByKey(data.weaponType);
  const iconUrl = mastery?.iconUrl ? normalizeImageUrl(mastery.iconUrl) : undefined;

  return (
    <WeaponSection>
      <WeaponHeader>
        {iconUrl && <WeaponIcon src={iconUrl} alt={mastery?.name} />}
        <Text variant="captionBold">{mastery?.name ?? data.weaponType}</Text>
        <WeaponCount>{data.gamesAnalyzed}판</WeaponCount>
      </WeaponHeader>

      <SlotGrid>
        {SLOT_ORDER.map((slot) => {
          const items = data.slotItems[slot] ?? [];
          return (
            <SlotColumn key={slot}>
              <SlotLabel>{SLOT_LABELS[slot] ?? slot}</SlotLabel>
              {items.length === 0 ? (
                <ItemRow>
                  <ItemIconPlaceholder />
                </ItemRow>
              ) : (
                items.map(({ itemId, count }) => {
                  const item = getItemById(itemId);
                  const imgUrl = item?.imageUrl ? normalizeImageUrl(item.imageUrl) : null;
                  const pct = Math.round((count / data.gamesAnalyzed) * 100);
                  return (
                    <ItemRow key={itemId}>
                      {imgUrl ? (
                        <ItemIcon src={imgUrl} alt={item?.name} />
                      ) : (
                        <ItemIconPlaceholder />
                      )}
                      <ItemInfo>
                        <ItemName>{item?.name ?? `#${itemId}`}</ItemName>
                        <ItemPct>{pct}%</ItemPct>
                      </ItemInfo>
                    </ItemRow>
                  );
                })
              )}
            </SlotColumn>
          );
        })}
      </SlotGrid>

      <StatsRow>
        <StatItem>
          <StatLabel>평균 아이템 크레딧</StatLabel>
          <StatValue>{Math.round(data.avgItemCredits).toLocaleString()}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>평균 딜량</StatLabel>
          <StatValue>{Math.round(data.avgDamage).toLocaleString()}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>딜 효율</StatLabel>
          <StatValue>{data.damageEfficiency.toFixed(2)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>탱킹 효율</StatLabel>
          <StatValue>{data.tankEfficiency.toFixed(2)}</StatValue>
        </StatItem>
      </StatsRow>
    </WeaponSection>
  );
};

// ─── main component ───────────────────────────────────────────────────────────

interface Props {
  data: CharacterItemAnalysis;
}

export const CharacterSection = ({ data }: Props) => {
  const char = getCharacterById(data.characterNum);
  const charImgUrl = char?.imageUrl ? normalizeImageUrl(char.imageUrl) : null;

  return (
    <Card>
      <CardHeader>
        {charImgUrl ? (
          <CharAvatar src={charImgUrl} alt={char?.name} />
        ) : (
          <CharAvatarPlaceholder />
        )}
        <Text variant="bodyBold">{char?.name ?? `#${data.characterNum}`}</Text>
        <TotalCount>총 {data.gamesAnalyzed}판</TotalCount>
      </CardHeader>

      {data.weaponTypes.map((wt) => (
        <WeaponTypeSection key={wt.weaponType} data={wt} />
      ))}
    </Card>
  );
};

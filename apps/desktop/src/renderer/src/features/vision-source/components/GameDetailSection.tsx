import styled from "styled-components";
import { Text } from "@repo/ui";
import type { GameDetail } from "@repo/service";
import { getCharacterById, getItemById, normalizeImageUrl } from "../../../shared/utils/meta";

const GRADE_INDEX: Record<string, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legend: 5,
  Mythic: 6,
};

const gradeBgUrl = (grade: string) => {
  const idx = GRADE_INDEX[grade] ?? 1;
  return `https://cdn.dak.gg/er/images/item/ico-itemgradebg-${String(idx).padStart(2, "0")}.svg`;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const SectionTitle = styled.div``;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

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
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`;

const CharacterImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  object-fit: cover;
  flex-shrink: 0;
`;

const CharacterPlaceholder = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  background-color: ${({ theme }) => theme.colors.background.base};
  flex-shrink: 0;
`;

const HeaderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  flex: 1;
  min-width: 0;
`;

const Dot = styled.span`
  color: ${({ theme }) => theme.colors.border.subtle};
`;

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[5]};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

const ItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ItemRowLabel = styled.div`
  flex-shrink: 0;
  width: 60px;
  padding-top: 6px;
`;

const ItemList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const ItemIconWrapper = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`;

const ItemBg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const ItemImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px;
  box-sizing: border-box;
`;

const ItemIcon = ({ itemId }: { itemId: number }) => {
  const item = getItemById(itemId);
  if (!item) return null;
  const grade = (item as { grade?: string }).grade ?? "Common";
  return (
    <ItemIconWrapper>
      <ItemBg src={gradeBgUrl(grade)} alt="" />
      <ItemImg src={normalizeImageUrl(item.imageUrl)} alt={item.name} title={item.name} />
    </ItemIconWrapper>
  );
};

interface Props {
  games: GameDetail[];
}

export const GameDetailSection = ({ games }: Props) => (
  <Wrapper>
    <SectionTitle>
      <Text variant="bodyBold">게임별 전적 상세</Text>
    </SectionTitle>
    <CardList>
      {games.map((game, i) => {
      const character = getCharacterById(game.characterNum);
      return (
        <Card key={i}>
          <CardHeader>
            {character ? (
              <CharacterImg
                src={normalizeImageUrl(character.imageUrl)}
                alt={character.name}
                title={character.name}
              />
            ) : (
              <CharacterPlaceholder />
            )}
            <HeaderMeta>
              <Text variant="bodyBold">{character?.name ?? `#${game.characterNum}`}</Text>
              <Dot>·</Dot>
              <Text variant="body">{game.gameRank}등</Text>
              <Dot>·</Dot>
              <Text variant="body">{game.kills} / {game.deaths} / {game.assists}</Text>
              <Dot>·</Dot>
              <Text variant="body">시야 {game.viewContribution.toLocaleString()}</Text>
            </HeaderMeta>
          </CardHeader>

          <CardBody>
            <StatRow>
              <StatItem>
                <Text variant="caption" color="secondary">박쥐</Text>
                <Text variant="bodyBold">{game.batKills}마리</Text>
              </StatItem>
              <StatItem>
                <Text variant="caption" color="secondary">변이 박쥐</Text>
                <Text variant="bodyBold">{game.mutantBatKills}마리</Text>
              </StatItem>
              <StatItem>
                <Text variant="caption" color="secondary">망원 카메라</Text>
                <Text variant="bodyBold">{game.telephotoCount}개</Text>
              </StatItem>
              <StatItem>
                <Text variant="caption" color="secondary">정찰 드론</Text>
                <Text variant="bodyBold">{game.reconDroneCount}개</Text>
              </StatItem>
              <StatItem>
                <Text variant="caption" color="secondary">EMP 드론</Text>
                <Text variant="bodyBold">{game.empDroneCount}개</Text>
              </StatItem>
            </StatRow>

            {(game.itemTransferredDrone.length > 0 || game.itemTransferredConsole.length > 0) && (
              <Divider />
            )}

            {game.itemTransferredDrone.length > 0 && (
              <ItemRow>
                <ItemRowLabel>
                  <Text variant="caption" color="secondary">드론 주문</Text>
                </ItemRowLabel>
                <ItemList>
                  {game.itemTransferredDrone.map((id, j) => (
                    <ItemIcon key={j} itemId={id} />
                  ))}
                </ItemList>
              </ItemRow>
            )}

            {game.itemTransferredConsole.length > 0 && (
              <ItemRow>
                <ItemRowLabel>
                  <Text variant="caption" color="secondary">콘솔 주문</Text>
                </ItemRowLabel>
                <ItemList>
                  {game.itemTransferredConsole.map((id, j) => (
                    <ItemIcon key={j} itemId={id} />
                  ))}
                </ItemList>
              </ItemRow>
            )}
          </CardBody>
        </Card>
      );
      })}
    </CardList>
  </Wrapper>
);

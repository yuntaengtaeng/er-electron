import styled, { css } from "styled-components";
import {
  getCharacterById,
  normalizeImageUrl,
} from "../../../shared/utils/meta";
import type { CharacterGameStats } from "../hooks/usePlayerData";

// ─── styled ───────────────────────────────────────────────────────────────────
const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const SectionLabel = styled.p`
  ${({ theme }) => css(theme.typography.styles.smallBold)}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing[3]};
  text-transform: ${({ theme }) => theme.typography.textTransform.uppercase};
  letter-spacing: 0.6px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead``;
const Tbody = styled.tbody``;

const Th = styled.th<{ $align?: "left" | "right" | "center" }>`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: ${({ $align }) => $align ?? "right"};
  padding: 0 ${({ theme }) => theme.spacing[3]}
    ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  white-space: nowrap;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};

  &:first-child {
    text-align: left;
    padding-left: 0;
  }
`;

const Tr = styled.tr`
  &:hover td {
    background: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const Td = styled.td<{ $align?: "left" | "right" | "center" }>`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: ${({ $align }) => $align ?? "right"};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.background.elevated};
  vertical-align: middle;
  white-space: nowrap;

  &:first-child {
    padding-left: 0;
  }
`;

const CharCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const CharImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.circle};
  border: 1.5px solid ${({ theme }) => theme.colors.border.subtle};
  object-fit: cover;
  flex-shrink: 0;
`;

const CharImgFallback = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1.5px solid ${({ theme }) => theme.colors.border.subtle};
  flex-shrink: 0;
`;

const CharName = styled.div`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const GamesCount = styled.div`
  ${({ theme }) => css(theme.typography.styles.micro)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const WinRateText = styled.span`
  color: ${({ theme }) => theme.colors.brand.green};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const Top3Text = styled.span`
  color: ${({ theme }) => theme.colors.semantic.announcement};
`;

// ─── component ────────────────────────────────────────────────────────────────
interface Props {
  characterStats: CharacterGameStats[];
}

export function TopCharacters({ characterStats }: Props) {
  if (characterStats.length === 0) return null;

  return (
    <Section>
      <SectionLabel>많이 쓴 실험체</SectionLabel>
      <Table>
        <Thead>
          <tr>
            <Th $align="left">실험체</Th>
            <Th>승률</Th>
            <Th>TOP 3%</Th>
            <Th>평균 TK</Th>
            <Th>평균 킬</Th>
            <Th>평균 딜량</Th>
          </tr>
        </Thead>
        <Tbody>
          {characterStats.map((cs) => {
            const meta = getCharacterById(cs.characterCode);
            const winRate =
              cs.totalGames > 0
                ? ((cs.wins / cs.totalGames) * 100).toFixed(1)
                : "0.0";
            const top3Rate =
              cs.totalGames > 0
                ? ((cs.top3 / cs.totalGames) * 100).toFixed(1)
                : "0.0";

            return (
              <Tr key={cs.characterCode}>
                <Td $align="left">
                  <CharCell>
                    {meta ? (
                      <CharImg
                        src={normalizeImageUrl(meta.imageUrl)}
                        alt={meta.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <CharImgFallback />
                    )}
                    <div>
                      <CharName>
                        {meta?.name ?? `#${cs.characterCode}`}
                      </CharName>
                      <GamesCount>{cs.totalGames}판</GamesCount>
                    </div>
                  </CharCell>
                </Td>
                <Td>
                  <WinRateText>{winRate}%</WinRateText>
                </Td>
                <Td>
                  <Top3Text>{top3Rate}%</Top3Text>
                </Td>
                <Td>{cs.avgTKRecent.toFixed(2)}</Td>
                <Td>{cs.avgKillsRecent.toFixed(2)}</Td>
                <Td>
                  {cs.recentGameCount > 0
                    ? cs.avgDamageRecent.toLocaleString()
                    : "-"}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Section>
  );
}


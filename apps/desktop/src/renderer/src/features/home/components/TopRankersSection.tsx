import type { TopRank } from "@repo/er-type";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { Avatar, Badge, Card, Text } from "@repo/ui";

const RANK_MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32", "#607D8B", "#607D8B"];

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const RankerCard = styled(Card)`
  text-align: center;
  cursor: pointer;
`;

const CardInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Medal = styled.span<{ $color: string }>`
  ${({ theme }) => css(theme.typography.styles.sectionTitle)}
  color: ${({ $color }) => $color};
`;

interface Props {
  rankers: TopRank[];
}

export function TopRankersSection({ rankers }: Props) {
  const navigate = useNavigate();

  return (
    <section>
      <Header>
        <Text variant="h2">상위 랭커</Text>
        <Badge variant="positive">솔로 랭크</Badge>
      </Header>
      <Grid>
        {rankers.map((r) => (
          <RankerCard
            key={r.rank}
            onClick={() => navigate(`/player/${encodeURIComponent(r.nickname)}`)}
          >
            <CardInner>
              <Medal $color={RANK_MEDAL_COLORS[r.rank - 1] ?? "#607D8B"}>#{r.rank}</Medal>
              <Avatar size="lg" name={r.nickname} />
              <Text variant="caption" as="span">{r.nickname}</Text>
              <Text variant="small" color="secondary">{r.mmr.toLocaleString()} RP</Text>
            </CardInner>
          </RankerCard>
        ))}
      </Grid>
    </section>
  );
}


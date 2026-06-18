import styled from 'styled-components'
import { Text } from '@repo/ui'
import type { KillVsRow } from '@repo/service'
import { getCharacterById, normalizeImageUrl } from '../../../shared/utils/meta'

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`

const SectionTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  overflow: hidden;
`

const CardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  &:last-child {
    border-bottom: none;
  }
`

const Rank = styled.span`
  width: 20px;
  text-align: center;
`

const CharIcon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
`

const NameCell = styled.div`
  flex: 1;
  min-width: 0;
`

const CountCell = styled.div`
  text-align: right;
`

const KillList = ({
  title,
  rows,
}: {
  title: string
  rows: KillVsRow[]
}) => (
  <Card>
    <CardHeader>
      <Text variant="bodyBold">{title}</Text>
    </CardHeader>
    {rows.length === 0 && (
      <Row>
        <Text variant="body" color="secondary">데이터가 없습니다.</Text>
      </Row>
    )}
    {rows.map((row, index) => {
      const char = getCharacterById(row.characterNum)
      return (
        <Row key={row.characterNum}>
          <Rank>
            <Text variant="caption" color="secondary">{index + 1}</Text>
          </Rank>
          {char && (
            <CharIcon src={normalizeImageUrl(char.imageUrl)} alt={char.name} />
          )}
          <NameCell>
            <Text variant="bodyBold">{char?.name ?? `#${row.characterNum}`}</Text>
          </NameCell>
          <CountCell>
            <Text variant="bodyBold">{row.count}</Text>
            <Text variant="caption" color="secondary">킬</Text>
          </CountCell>
        </Row>
      )
    })}
  </Card>
)

type Props = {
  killedByMe: KillVsRow[]
  killedMe: KillVsRow[]
}

export const KillMatchupSection = ({ killedByMe, killedMe }: Props) => (
  <Section>
    <SectionTitle><Text variant="h3">교전 상대</Text></SectionTitle>
    <Grid>
      <KillList title="내가 많이 처치한 실험체 TOP 5" rows={killedByMe} />
      <KillList title="나를 많이 처치한 실험체 TOP 5" rows={killedMe} />
    </Grid>
  </Section>
)

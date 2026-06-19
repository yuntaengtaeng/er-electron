import styled from 'styled-components'
import { Text } from '@repo/ui'
import type { TeamComboDetail } from '@repo/service'
import { getCharacterById, normalizeImageUrl } from '../../../shared/utils/meta'

const Panel = styled.div`
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`

const SectionTitle = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing[1]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`

// 순위 분포
const RankRow = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr 52px 36px;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
`

const BarTrack = styled.div`
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.background.surface};
  overflow: hidden;
`

const BarFill = styled.div<{ $width: number; $rank: number }>`
  height: 100%;
  border-radius: 3px;
  width: ${({ $width }) => $width}%;
  background-color: ${({ $rank, theme }) =>
    $rank === 1
      ? theme.colors.brand.green
      : $rank <= 3
        ? theme.colors.text.secondary
        : theme.colors.border.subtle};
`

// 순위별 RP
const MmrGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing[2]};
`

const MmrChip = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.radius.subtle};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[0.5]};
`

// 캐릭터별 기여
const CharRow = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr repeat(3, 80px);
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
`

const CharImg = styled.img`
  display: block;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.subtle};
  object-fit: cover;
`

const StatGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[0.5]};
`

type Props = {
  detail: TeamComboDetail
}

export const TeamComboDetailPanel = ({ detail }: Props) => {
  const maxCount = Math.max(...detail.rankDistribution.map((b) => b.count), 1)

  return (
    <Panel>
      {/* 순위 분포 */}
      <Section>
        <SectionTitle>
          <Text variant="captionBold" color="secondary">순위 분포</Text>
        </SectionTitle>
        {detail.rankDistribution.map((bucket) => (
          <RankRow key={bucket.rank}>
            <Text variant="caption" color="secondary">{bucket.rank}등</Text>
            <BarTrack>
              <BarFill $width={(bucket.count / maxCount) * 100} $rank={bucket.rank} />
            </BarTrack>
            <Text variant="captionBold">{bucket.rate.toFixed(1)}%</Text>
            <Text variant="caption" color="secondary">{bucket.count}회</Text>
          </RankRow>
        ))}
      </Section>

      {/* 순위별 평균 RP */}
      <Section>
        <SectionTitle>
          <Text variant="captionBold" color="secondary">순위별 평균 RP</Text>
        </SectionTitle>
        <MmrGrid>
          {detail.mmrByRank.map(({ rank, avg }) => (
            <MmrChip key={rank}>
              <Text variant="caption" color="secondary">{rank}등</Text>
              <Text variant="captionBold">
                {avg >= 0 ? '+' : ''}{avg.toFixed(0)} RP
              </Text>
            </MmrChip>
          ))}
        </MmrGrid>
      </Section>

      {/* 캐릭터별 기여 */}
      <Section>
        <SectionTitle>
          <Text variant="captionBold" color="secondary">캐릭터별 기여</Text>
        </SectionTitle>
        {detail.perCharacter.map((contrib) => {
          const char = getCharacterById(contrib.character_num)
          return (
            <CharRow key={contrib.character_num}>
              {char ? (
                <CharImg src={normalizeImageUrl(char.imageUrl)} alt={char.name} />
              ) : (
                <div />
              )}
              <Text variant="captionBold">{char?.name ?? `#${contrib.character_num}`}</Text>
              <StatGroup>
                <Text variant="caption" color="secondary">킬</Text>
                <Text variant="captionBold">{contrib.avgKills.toFixed(1)}</Text>
              </StatGroup>
              <StatGroup>
                <Text variant="caption" color="secondary">어시</Text>
                <Text variant="captionBold">{contrib.avgAssists.toFixed(1)}</Text>
              </StatGroup>
              <StatGroup>
                <Text variant="caption" color="secondary">RP</Text>
                <Text variant="captionBold">
                  {contrib.avgMmrGain >= 0 ? '+' : ''}{contrib.avgMmrGain.toFixed(0)}
                </Text>
              </StatGroup>
            </CharRow>
          )
        })}
      </Section>
    </Panel>
  )
}

import styled from 'styled-components'
import { Text } from '@repo/ui'
import type { WeaponTypeGroup } from '@repo/service'
import { WeaponTypeGroupSection } from './WeaponTypeGroupSection'

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`

const SectionTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`

type Props = {
  group: WeaponTypeGroup
}

export const WeaponBuildSection = ({ group }: Props) => (
  <Section>
    <SectionTitle>
      <Text variant="h3">빌드</Text>
    </SectionTitle>
    <WeaponTypeGroupSection group={group} showHeader={false} />
  </Section>
)

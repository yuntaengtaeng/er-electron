import styled from 'styled-components'
import { Text } from '@repo/ui'
import { AppHeader } from '../../../shared/components/AppHeader'
import { TeamComboContent } from './TeamComboContent'

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.base};
`

const PageContent = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[10]}
    ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[20]};
`

const SectionTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`

export default function TeamComboPage() {
  return (
    <PageWrapper>
      <AppHeader />

      <PageContent>
        <SectionTitle>
          <Text variant="h2">조합 승률 보기</Text>
          <Text variant="caption" color="secondary">
            랭커가 참여한 판을 기준으로 수집 · 판당 1~8등 팀 조합 분석
          </Text>
        </SectionTitle>

        <TeamComboContent />
      </PageContent>
    </PageWrapper>
  )
}

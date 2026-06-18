import { useState } from 'react'
import styled from 'styled-components'
import { Text } from '@repo/ui'
import { AppHeader } from '../../../shared/components/AppHeader'
import { CharacterAnalysisContent } from './CharacterAnalysisContent'

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.base};
`

const PageContent = styled.main`
  max-width: 900px;
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

export default function CharacterAnalysisPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  return (
    <PageWrapper>
      <AppHeader />

      <PageContent>
        <SectionTitle>
          <Text variant="h2">실험체 분석</Text>
          <Text variant="caption" color="secondary">
            수집된 랭커 트리오 랭크 게임 기준 · 실험체별 지표 및 빌드 경향
          </Text>
        </SectionTitle>

        <CharacterAnalysisContent
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </PageContent>
    </PageWrapper>
  )
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { Button, Text } from "@repo/ui";
import { useClubMembers } from "../hooks/useClubMembers";
import { ClubRankingSection } from "./ClubRankingSection";

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.base};
`;

const NavBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing[8]};
  height: 60px;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const Logo = styled.span`
  ${({ theme }) => css(theme.typography.styles.featureHeading)}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.title};
  color: ${({ theme }) => theme.colors.brand.green};
  cursor: pointer;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing[20]} ${({ theme }) => theme.spacing[8]}
    ${({ theme }) => theme.spacing[16]};
`;

const HeroTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const HeroSubtitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[10]};
`;

const SearchRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  max-width: 460px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.radius.medium};
  border: 2px solid ${({ theme }) => theme.colors.background.elevated};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => css(theme.typography.styles.body)}
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brand.green};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SearchButton = styled.button`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.radius.medium};
  border: none;
  background-color: ${({ theme }) => theme.colors.brand.green};
  color: ${({ theme }) => theme.colors.text.onGreen};
  ${({ theme }) => css(theme.typography.styles.bodyBold)}
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.88;
  }
`;

const FeatureGrid = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[10]};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[5]};
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brand.greenBorder};
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const FeatureCardTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const RankSection = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[20]};
`;

export default function HomePage() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const clubMembers = useClubMembers();

  const doSearch = () => {
    const trimmed = value.trim();
    if (trimmed) navigate(`/player/${encodeURIComponent(trimmed)}`);
  };

  return (
    <PageWrapper>
      <NavBar>
        <Logo onClick={() => navigate("/")}>ER STATS</Logo>
        <Button variant="outlined" onClick={() => navigate("/ui-guide")}>
          UI 가이드
        </Button>
      </NavBar>

      <HeroSection>
        <HeroTitle>
          <Text variant="h1">이터널 리턴 전적 검색</Text>
        </HeroTitle>
        <HeroSubtitle>
          <Text variant="body" color="secondary">실험체의 전적과 통계를 확인하세요</Text>
        </HeroSubtitle>
        <SearchRow>
          <SearchInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="닉네임을 입력하세요..."
          />
          <SearchButton onClick={doSearch}>검색</SearchButton>
        </SearchRow>
      </HeroSection>

      <FeatureGrid>
        <FeatureCard onClick={() => navigate("/compare")}>
          <FeatureCardTitle>
            <Text variant="bodyBold">비교하기</Text>
          </FeatureCardTitle>
          <Text variant="caption" color="secondary">
            최근 랭크 전적으로 플레이어 간 능력치 비교
          </Text>
        </FeatureCard>
        <FeatureCard onClick={() => navigate("/item-analysis")}>
          <FeatureCardTitle>
            <Text variant="bodyBold">아이템 분석</Text>
          </FeatureCardTitle>
          <Text variant="caption" color="secondary">
            실험체별 선호 장비와 딜 효율 분석
          </Text>
        </FeatureCard>
      </FeatureGrid>

      {clubMembers.length > 0 && (
        <RankSection>
          <ClubRankingSection members={clubMembers} />
        </RankSection>
      )}
    </PageWrapper>
  );
}


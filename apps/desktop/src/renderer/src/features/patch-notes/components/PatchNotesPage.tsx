import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { AppHeader } from "../../../shared/components/AppHeader";

const rawFiles = import.meta.glob("../assets/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const sortBySemver = (a: string, b: string) => {
  const parse = (v: string) => v.split(".").map(Number);
  const [ma, mia, pa] = parse(a);
  const [mb, mib, pb] = parse(b);
  if (ma !== mb) return mb - ma;
  if (mia !== mib) return mib - mia;
  return pb - pa;
};

const versions = Object.keys(rawFiles)
  .map((path) => path.replace("../assets/", "").replace(".md", ""))
  .sort(sortBySemver);

const getFirstLine = (content: string) =>
  content
    .split("\n")
    .find((l) => l.startsWith("## "))
    ?.replace("## ", "") ?? "";

export const PatchNotesPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <AppHeader />
      <Content>
        <Title>패치노트</Title>
        <List>
          {versions.map((version) => {
            const content = rawFiles[`../assets/${version}.md`] ?? "";
            const firstSection = getFirstLine(content);
            const isCurrent = version === APP_VERSION;
            return (
              <Item
                key={version}
                onClick={() => navigate(`/patch-notes/${version}`)}
              >
                <ItemLeft>
                  <VersionRow>
                    <VersionText>v{version}</VersionText>
                    {isCurrent && <CurrentBadge>현재</CurrentBadge>}
                  </VersionRow>
                  {firstSection && (
                    <SectionPreview>{firstSection}</SectionPreview>
                  )}
                </ItemLeft>
                <Arrow>›</Arrow>
              </Item>
            );
          })}
        </List>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.base};
`;

const Content = styled.main`
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]};
`;

const Title = styled.h1`
  ${({ theme }) => css(theme.typography.styles.sectionTitle)}
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[5]};
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brand.greenBorder};
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const ItemLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const VersionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const VersionText = styled.span`
  ${({ theme }) => css(theme.typography.styles.bodyBold)}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CurrentBadge = styled.span`
  ${({ theme }) => css(theme.typography.styles.small)}
  color: ${({ theme }) => theme.colors.text.onGreen};
  background-color: ${({ theme }) => theme.colors.brand.green};
  padding: 1px ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.radius.subtle};
`;

const SectionPreview = styled.span`
  ${({ theme }) => css(theme.typography.styles.caption)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Arrow = styled.span`
  ${({ theme }) => css(theme.typography.styles.featureHeading)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

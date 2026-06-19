import React from "react";
import { useParams } from "react-router-dom";
import styled, { css } from "styled-components";
import { AppHeader } from "../../../shared/components/AppHeader";

const rawFiles = import.meta.glob("../assets/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const parseInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const renderMarkdown = (md: string): React.ReactNode[] => {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <List key={nodes.length}>
        {listItems.map((item, i) => (
          <ListItem key={i}>{parseInline(item)}</ListItem>
        ))}
      </List>
    );
    listItems = [];
  };

  for (const line of lines) {
    if (line.startsWith("### ")) {
      flushList();
      nodes.push(<H3 key={nodes.length}>{line.slice(4)}</H3>);
    } else if (line.startsWith("## ")) {
      flushList();
      nodes.push(<H2 key={nodes.length}>{line.slice(3)}</H2>);
    } else if (line.startsWith("# ")) {
      flushList();
      nodes.push(<H1 key={nodes.length}>{line.slice(2)}</H1>);
    } else if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
    } else if (line.trim() !== "") {
      flushList();
      nodes.push(
        <Paragraph key={nodes.length}>{parseInline(line)}</Paragraph>
      );
    } else {
      flushList();
    }
  }
  flushList();
  return nodes;
};

export const PatchNotesDetailPage = () => {
  const { version } = useParams<{ version: string }>();
  const content = version
    ? (rawFiles[`../assets/${version}.md`] ?? "")
    : "";

  return (
    <Container>
      <AppHeader />
      <Content>
        {content ? (
          renderMarkdown(content)
        ) : (
          <Empty>버전 {version}의 패치노트를 찾을 수 없습니다.</Empty>
        )}
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
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]};
`;

const H1 = styled.h1`
  ${({ theme }) => css(theme.typography.styles.sectionTitle)}
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const H2 = styled.h2`
  ${({ theme }) => css(theme.typography.styles.featureHeading)}
  color: ${({ theme }) => theme.colors.brand.green};
  margin-top: ${({ theme }) => theme.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const H3 = styled.h3`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing[5]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ListItem = styled.li`
  ${({ theme }) => css(theme.typography.styles.body)}
  color: ${({ theme }) => theme.colors.text.secondary};
  padding-left: ${({ theme }) => theme.spacing[4]};
  position: relative;

  &::before {
    content: "–";
    position: absolute;
    left: 0;
    color: ${({ theme }) => theme.colors.brand.green};
  }
`;

const Paragraph = styled.p`
  ${({ theme }) => css(theme.typography.styles.body)}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing[2]} 0;
`;

const Empty = styled.p`
  ${({ theme }) => css(theme.typography.styles.body)}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

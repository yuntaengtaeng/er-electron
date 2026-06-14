import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";

interface AppHeaderProps {
  right?: React.ReactNode;
}

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing[6]};
  height: 60px;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const HeaderLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  ${({ theme }) => css(theme.typography.styles.body)}
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Logo = styled.span`
  ${({ theme }) => css(theme.typography.styles.featureHeading)}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.title};
  color: ${({ theme }) => theme.colors.brand.green};
  cursor: pointer;
`;

export const AppHeader = ({ right }: AppHeaderProps) => {
  const navigate = useNavigate();
  return (
    <Header>
      <HeaderLeft>
        <BackButton onClick={() => navigate(-1)}>← 뒤로</BackButton>
      </HeaderLeft>
      <Logo onClick={() => navigate("/")}>ER STATS</Logo>
      <HeaderRight>{right}</HeaderRight>
    </Header>
  );
};

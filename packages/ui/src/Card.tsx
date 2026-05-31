import React from "react";
import styled, { css } from "styled-components";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

const StyledCard = styled.div<{ $clickable: boolean; $padded: boolean }>`
  background-color: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.radius.standard};
  overflow: hidden;
  padding: ${({ theme, $padded }) => ($padded ? theme.spacing[4] : "0")};

  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
      transition: background-color 0.2s ease;
      &:hover {
        background-color: ${({ theme }) => theme.colors.background.cardAlt};
      }
    `}
`;

export default function Card({ children, onClick, padded = true, ...rest }: CardProps) {
  return (
    <StyledCard $clickable={!!onClick} $padded={padded} onClick={onClick} {...rest}>
      {children}
    </StyledCard>
  );
}

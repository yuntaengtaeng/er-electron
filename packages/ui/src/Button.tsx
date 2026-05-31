import React from "react";
import styled, { css } from "styled-components";

type ButtonVariant = "pill" | "pillDark" | "pillLight" | "outlined" | "circular";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
}

const variantStyles = {
  pill: css`
    background-color: ${({ theme }) => theme.colors.background.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
    border-radius: ${({ theme }) => theme.radius.fullPill};
    border: none;
  `,
  pillDark: css`
    background-color: ${({ theme }) => theme.colors.background.surface};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 0px ${({ theme }) => theme.spacing[12]};
    border-radius: ${({ theme }) => theme.radius.pill};
    border: none;
  `,
  pillLight: css`
    background-color: ${({ theme }) => theme.colors.surface.light};
    color: ${({ theme }) => theme.colors.background.surface};
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
    border-radius: ${({ theme }) => theme.radius.pill};
    border: none;
  `,
  outlined: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[4]}`};
    border-radius: ${({ theme }) => theme.radius.fullPill};
  `,
  circular: css`
    background-color: ${({ theme }) => theme.colors.background.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.radius.circle};
    border: none;
  `,
};

const StyledButton = styled.button<{ $variant: ButtonVariant }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.ui};
  font-size: ${({ theme }) => theme.typography.fontSize.caption};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.buttonWide};
  text-transform: uppercase;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) => variantStyles[$variant]}
`;

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = "pill",
}: ButtonProps) {
  return (
    <StyledButton $variant={variant} onClick={onClick} disabled={disabled}>
      {children}
    </StyledButton>
  );
}

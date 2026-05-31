import React from "react";
import styled, { css } from "styled-components";

type BadgeVariant = "default" | "positive" | "negative" | "warning" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, ReturnType<typeof css>> = {
  default: css`
    background-color: ${({ theme }) => theme.colors.background.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
  `,
  positive: css`
    background-color: ${({ theme }) => theme.colors.brand.green};
    color: ${({ theme }) => theme.colors.text.onGreen};
  `,
  negative: css`
    background-color: ${({ theme }) => theme.colors.semantic.negative};
    color: ${({ theme }) => theme.colors.text.primary};
  `,
  warning: css`
    background-color: ${({ theme }) => theme.colors.semantic.warning};
    color: ${({ theme }) => theme.colors.background.base};
  `,
  info: css`
    background-color: ${({ theme }) => theme.colors.semantic.announcement};
    color: ${({ theme }) => theme.colors.text.primary};
  `,
};

const StyledBadge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[0.5]} ${theme.spacing[2]}`};
  border-radius: ${({ theme }) => theme.radius.minimal};
  font-size: ${({ theme }) => theme.typography.fontSize.badge};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.ui};
  line-height: 1.33;
  text-transform: capitalize;
  ${({ $variant }) => variantStyles[$variant]}
`;

export default function Badge({ variant = "default", children }: BadgeProps) {
  return <StyledBadge $variant={variant}>{children}</StyledBadge>;
}

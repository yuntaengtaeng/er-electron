import React from "react";
import styled, { css } from "styled-components";

type TextVariant = "h1" | "h2" | "h3" | "body" | "caption" | "small";
type TextColor = "primary" | "secondary" | "tertiary" | "brand";

interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: React.ReactNode;
  as?: React.ElementType;
}

const variantStyles: Record<TextVariant, ReturnType<typeof css>> = {
  h1: css`
    font-size: ${({ theme }) => theme.typography.fontSize.section};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    font-family: ${({ theme }) => theme.typography.fontFamily.title};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  `,
  h2: css`
    font-size: ${({ theme }) => theme.typography.fontSize.feature};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    font-family: ${({ theme }) => theme.typography.fontFamily.ui};
    line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  `,
  h3: css`
    font-size: ${({ theme }) => theme.typography.fontSize.body};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    font-family: ${({ theme }) => theme.typography.fontFamily.ui};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  `,
  body: css`
    font-size: ${({ theme }) => theme.typography.fontSize.body};
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
    font-family: ${({ theme }) => theme.typography.fontFamily.ui};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  `,
  caption: css`
    font-size: ${({ theme }) => theme.typography.fontSize.caption};
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
    font-family: ${({ theme }) => theme.typography.fontFamily.ui};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  `,
  small: css`
    font-size: ${({ theme }) => theme.typography.fontSize.small};
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
    font-family: ${({ theme }) => theme.typography.fontFamily.ui};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  `,
};

const colorStyles: Record<TextColor, ReturnType<typeof css>> = {
  primary: css`
    color: ${({ theme }) => theme.colors.text.primary};
  `,
  secondary: css`
    color: ${({ theme }) => theme.colors.text.secondary};
  `,
  tertiary: css`
    color: ${({ theme }) => theme.colors.text.tertiary};
  `,
  brand: css`
    color: ${({ theme }) => theme.colors.brand.green};
  `,
};

const StyledText = styled.span<{ $variant: TextVariant; $color: TextColor }>`
  margin: 0;
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $color }) => colorStyles[$color]}
`;

const defaultTagMap: Record<TextVariant, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  caption: "span",
  small: "span",
};

export default function Text({
  variant = "body",
  color = "primary",
  children,
  as,
}: TextProps) {
  return (
    <StyledText
      as={as ?? defaultTagMap[variant]}
      $variant={variant}
      $color={color}
    >
      {children}
    </StyledText>
  );
}

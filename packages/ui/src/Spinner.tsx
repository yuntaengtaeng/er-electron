import styled, { keyframes } from "styled-components";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const sizeMap: Record<SpinnerSize, string> = {
  sm: "16px",
  md: "24px",
  lg: "40px",
};

const StyledSpinner = styled.span<{ $size: SpinnerSize }>`
  display: inline-block;
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
  border: 2px solid ${({ theme }) => theme.colors.border.subtle};
  border-top-color: ${({ theme }) => theme.colors.brand.green};
  border-radius: ${({ theme }) => theme.radius.circle};
  animation: ${spin} 0.7s linear infinite;
  flex-shrink: 0;
`;

export default function Spinner({ size = "md" }: SpinnerProps) {
  return <StyledSpinner $size={size} role="status" aria-label="loading" />;
}

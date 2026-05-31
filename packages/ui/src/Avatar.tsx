import React from "react";
import styled from "styled-components";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
}

const sizeMap: Record<AvatarSize, string> = {
  sm: "32px",
  md: "48px",
  lg: "64px",
};

const fontSizeMap: Record<AvatarSize, string> = {
  sm: "12px",
  md: "16px",
  lg: "24px",
};

const AvatarWrapper = styled.div<{ $size: AvatarSize }>`
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
  border-radius: ${({ theme }) => theme.radius.circle};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: ${({ $size }) => fontSizeMap[$size]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.ui};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  user-select: none;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Avatar({ src, name, size = "md" }: AvatarProps) {
  return (
    <AvatarWrapper $size={size}>
      {src ? (
        <AvatarImage src={src} alt={name ?? "avatar"} />
      ) : (
        name && getInitials(name)
      )}
    </AvatarWrapper>
  );
}

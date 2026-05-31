import React from "react";
import styled from "styled-components";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

const Wrapper = styled.label<{ $disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const Track = styled.span<{ $checked: boolean }>`
  position: relative;
  width: 40px;
  height: 24px;
  background-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.brand.green : theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.radius.fullPill};
  border: 1px solid
    ${({ theme, $checked }) =>
      $checked ? theme.colors.brand.greenBorder : theme.colors.border.default};
  transition: background-color 0.2s ease, border-color 0.2s ease;
  flex-shrink: 0;
`;

const Thumb = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $checked }) => ($checked ? "18px" : "2px")};
  width: 18px;
  height: 18px;
  background-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.text.onGreen : theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.radius.circle};
  transition: left 0.2s ease, background-color 0.2s ease;
`;

const LabelText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.caption};
  font-family: ${({ theme }) => theme.typography.fontFamily.ui};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export default function Switch({
  checked,
  onChange,
  disabled = false,
  label,
}: SwitchProps) {
  return (
    <Wrapper $disabled={disabled}>
      <HiddenInput
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Track $checked={checked}>
        <Thumb $checked={checked} />
      </Track>
      {label && <LabelText>{label}</LabelText>}
    </Wrapper>
  );
}

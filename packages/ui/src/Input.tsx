import React from "react";
import styled from "styled-components";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.ui};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StyledInput = styled.input<{ $hasError: boolean }>`
  background-color: ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.negative : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radius.subtle};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  font-size: ${({ theme }) => theme.typography.fontSize.caption};
  font-family: ${({ theme }) => theme.typography.fontFamily.ui};
  width: 100%;
  box-sizing: border-box;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:focus {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.negative : theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  font-family: ${({ theme }) => theme.typography.fontFamily.ui};
  color: ${({ theme }) => theme.colors.semantic.negative};
`;

export default function Input({ label, error, id, ...rest }: InputProps) {
  return (
    <Wrapper>
      {label && <Label htmlFor={id}>{label}</Label>}
      <StyledInput id={id} $hasError={!!error} {...rest} />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}

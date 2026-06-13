import styled from "styled-components";
import { Spinner } from "@repo/ui";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[16]} 0;
`;

export function Loading() {
  return (
    <Wrapper>
      <Spinner size="lg" />
    </Wrapper>
  );
}

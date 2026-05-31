import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    background-color: ${({ theme }) => theme.colors.background.base};
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily.ui};
    font-size: ${({ theme }) => theme.typography.fontSize.body};
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
    line-height: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

import { breakpoints, mediaQuery } from "./breakpoints";
import { colors } from "./colors";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  radius,
  breakpoints,
  mediaQuery,
} as const;

export type Theme = typeof theme;

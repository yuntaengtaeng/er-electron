export const breakpoints = {
  mobileSmall: 425,
  mobile: 576,
  tablet: 768,
  tabletLarge: 896,
  desktopSmall: 1024,
  desktop: 1280,
  largeDesktop: 1281,
} as const;

/** CSS min-width media query strings */
export const mediaQuery = {
  mobileSmall: `(min-width: 425px)`,
  mobile: `(min-width: 576px)`,
  tablet: `(min-width: 768px)`,
  tabletLarge: `(min-width: 896px)`,
  desktopSmall: `(min-width: 1024px)`,
  desktop: `(min-width: 1280px)`,
  largeDesktop: `(min-width: 1281px)`,
} as const;

export type Breakpoints = typeof breakpoints;

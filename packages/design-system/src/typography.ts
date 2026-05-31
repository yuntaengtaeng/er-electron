const FONT_FALLBACK =
  "CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva, Helvetica Neue, helvetica, arial, Hiragino Sans, Hiragino Kaku Gothic ProN, Meiryo, MS Gothic";

export const typography = {
  fontFamily: {
    title: `SpotifyMixUITitle, ${FONT_FALLBACK}`,
    ui: `SpotifyMixUI, ${FONT_FALLBACK}`,
  },

  fontSize: {
    micro: "10px",
    badge: "10.5px",
    small: "12px",
    caption: "14px",
    body: "16px",
    feature: "18px",
    section: "24px",
  },

  fontWeight: {
    regular: 400,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.0,
    snug: 1.3,
    normal: "normal",
    relaxed: 1.5,
  },

  letterSpacing: {
    normal: "normal",
    button: "0.14px",
    buttonWide: "1.4px",
    buttonXWide: "2px",
  },

  textTransform: {
    uppercase: "uppercase" as const,
    capitalize: "capitalize" as const,
  },

  /** Pre-composed text styles matching DESIGN.MD hierarchy */
  styles: {
    sectionTitle: {
      fontFamily: `SpotifyMixUITitle, ${FONT_FALLBACK}`,
      fontSize: "24px",
      fontWeight: 700,
      lineHeight: "normal" as const,
      letterSpacing: "normal",
    },
    featureHeading: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "18px",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "normal",
    },
    bodyBold: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "16px",
      fontWeight: 700,
      lineHeight: "normal" as const,
      letterSpacing: "normal",
    },
    body: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "normal" as const,
      letterSpacing: "normal",
    },
    buttonUppercase: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "14px",
      fontWeight: 700,
      lineHeight: 1.0,
      letterSpacing: "1.4px",
      textTransform: "uppercase" as const,
    },
    button: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "14px",
      fontWeight: 700,
      lineHeight: "normal" as const,
      letterSpacing: "0.14px",
    },
    navBold: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "14px",
      fontWeight: 700,
      lineHeight: "normal" as const,
      letterSpacing: "normal",
    },
    nav: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "normal" as const,
      letterSpacing: "normal",
    },
    captionBold: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "14px",
      fontWeight: 700,
      lineHeight: 1.5,
      letterSpacing: "normal",
    },
    caption: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "normal" as const,
      letterSpacing: "normal",
    },
    smallBold: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "12px",
      fontWeight: 700,
      lineHeight: 1.5,
      letterSpacing: "normal",
    },
    small: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "normal" as const,
      letterSpacing: "normal",
    },
    badge: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "10.5px",
      fontWeight: 600,
      lineHeight: 1.33,
      letterSpacing: "normal",
      textTransform: "capitalize" as const,
    },
    micro: {
      fontFamily: `SpotifyMixUI, ${FONT_FALLBACK}`,
      fontSize: "10px",
      fontWeight: 400,
      lineHeight: "normal" as const,
      letterSpacing: "normal",
    },
  },
} as const;

export type Typography = typeof typography;

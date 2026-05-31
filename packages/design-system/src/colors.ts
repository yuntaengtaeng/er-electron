export const colors = {
  brand: {
    green: "#1ed760",
    greenBorder: "#1db954",
  },

  background: {
    base: "#121212",
    surface: "#181818",
    elevated: "#1f1f1f",
    card: "#252525",
    cardAlt: "#272727",
  },

  text: {
    primary: "#ffffff",
    secondary: "#b3b3b3",
    tertiary: "#cbcbcb",
    emphasis: "#fdfdfd",
    onGreen: "#000000",
  },

  semantic: {
    negative: "#f3727f",
    warning: "#ffa42b",
    announcement: "#539df5",
  },

  border: {
    subtle: "#4d4d4d",
    default: "#7c7c7c",
    separator: "#b3b3b3",
  },

  surface: {
    light: "#eeeeee",
  },
} as const;

export type Colors = typeof colors;

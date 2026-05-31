export const shadows = {
  /** Dialogs, menus, overlays — "floating in darkness" */
  heavy: "rgba(0,0,0,0.5) 0px 8px 24px",
  /** Cards, dropdowns — subtle lift */
  medium: "rgba(0,0,0,0.3) 0px 8px 8px",
  /** Recessed input border-shadow combo */
  insetBorder:
    "rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset",
  none: "none",
} as const;

export type Shadows = typeof shadows;

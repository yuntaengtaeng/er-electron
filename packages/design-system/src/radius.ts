export const radius = {
  /** Badges, explicit tags */
  minimal: "2px",
  /** Inputs, small elements */
  subtle: "4px",
  /** Album art containers, cards */
  standard: "6px",
  /** Sections, dialogs */
  comfortable: "8px",
  /** Panels, overlay elements */
  medium: "10px",
  /** Large pill buttons */
  large: "100px",
  /** Primary buttons, search input */
  pill: "500px",
  /** Navigation pills, small buttons */
  fullPill: "9999px",
  /** Play buttons, avatars, icons */
  circle: "50%",
} as const;

export type Radius = typeof radius;

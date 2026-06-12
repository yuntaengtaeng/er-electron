import type { Theme } from "@repo/design-system";
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}

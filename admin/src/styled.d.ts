import "styled-components";
import type { AppTheme } from "@/lib/theme";

// Augment styled-components' DefaultTheme with our app theme shape so that
// `props.theme` is typed everywhere without repeating the theme type.
declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentional declaration merge
  export interface DefaultTheme extends AppTheme {}
}

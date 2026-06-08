import { colors, accent, occupantPalette } from './colors';
import { fontFamily, fontFamilyLoaded, fontSize, lineHeight, letterSpacing } from './typography';
import { spacing, radii, hitSlop } from './spacing';
import { shadows } from './shadows';

export const theme = {
  colors,
  accent,
  occupantPalette,
  font: { family: fontFamily, familyLoaded: fontFamilyLoaded, size: fontSize, lineHeight, letterSpacing },
  spacing,
  radii,
  shadows,
  hitSlop,
} as const;

export type Theme = typeof theme;

export { colors, accent, occupantPalette, fontFamily, fontFamilyLoaded, fontSize, lineHeight, letterSpacing, spacing, radii, shadows, hitSlop };

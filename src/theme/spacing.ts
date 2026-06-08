export const spacing = {
  xxs: 4,
  xs: 7,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  xxxl: 40,
} as const;

export const radii = {
  xs: 6,
  sm: 8,
  md: 11,
  lg: 14,
  xl: 16,
  xxl: 20,
  pill: 999,
} as const;

export const hitSlop = { top: 8, right: 8, bottom: 8, left: 8 };

export type Spacing = typeof spacing;
export type Radii = typeof radii;

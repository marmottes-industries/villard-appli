import { Platform } from 'react-native';

export const fontFamily = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) as string,
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) as string,
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
} as const;

export const fontFamilyLoaded = {
  serif: 'Spectral_500Medium',
  serifBold: 'Spectral_600SemiBold',
  sans: 'HankenGrotesk_500Medium',
  sansBold: 'HankenGrotesk_700Bold',
  mono: 'IBMPlexMono_500Medium',
} as const;

export const fontSize = {
  xs: 10.5,
  sm: 11.5,
  base: 13.5,
  md: 14.5,
  lg: 16,
  xl: 19,
  xxl: 22,
  display: 30,
  hero: 32,
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const letterSpacing = {
  eyebrow: 1.4,
  mono: 1.2,
  heading: -0.3,
} as const;

export type FontFamily = typeof fontFamily;

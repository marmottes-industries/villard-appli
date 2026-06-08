import { Text as RNText, type TextProps, type TextStyle, StyleSheet } from 'react-native';
import { colors, fontSize, fontFamily, letterSpacing } from '@/src/theme';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'mono' | 'eyebrow' | 'label';

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  weight?: TextStyle['fontWeight'];
};

const variants: Record<Variant, TextStyle> = {
  h1: { fontFamily: fontFamily.serif, fontSize: fontSize.display, fontWeight: '500', letterSpacing: letterSpacing.heading, color: colors.ink },
  h2: { fontFamily: fontFamily.serif, fontSize: fontSize.xxl, fontWeight: '500', color: colors.ink },
  h3: { fontFamily: fontFamily.serif, fontSize: fontSize.xl, fontWeight: '500', color: colors.ink },
  body: { fontFamily: fontFamily.sans, fontSize: fontSize.base, color: colors.ink },
  small: { fontFamily: fontFamily.sans, fontSize: fontSize.sm, color: colors.ink2 },
  mono: { fontFamily: fontFamily.mono, fontSize: fontSize.xs, color: colors.ink3 },
  eyebrow: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.eyebrow,
    textTransform: 'uppercase',
    color: colors.ink3,
    fontWeight: '500',
  },
  label: { fontFamily: fontFamily.sans, fontSize: fontSize.sm, fontWeight: '700', color: colors.ink2 },
};

export function Text({ variant = 'body', color, weight, style, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={StyleSheet.flatten([
        variants[variant],
        color ? { color } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ])}
    />
  );
}

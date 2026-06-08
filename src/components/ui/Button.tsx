import { Pressable, View, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { accent, colors, radii, shadows } from '@/src/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  title?: string;
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  title,
  variant = 'secondary',
  size = 'md',
  leftIcon,
  rightIcon,
  style,
  children,
  fullWidth,
  ...rest
}: Props) {
  const sizing = size === 'sm' ? { height: 32, paddingHorizontal: 11, borderRadius: radii.sm }
                                : { height: 38, paddingHorizontal: 15, borderRadius: radii.md };

  const variantStyle = VARIANT_STYLES[variant];
  const textColor = VARIANT_TEXT[variant];

  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.base,
        sizing,
        variantStyle,
        fullWidth && { alignSelf: 'stretch', justifyContent: 'center' },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
      {title ? <Text variant="body" weight="600" color={textColor} style={{ fontSize: size === 'sm' ? 12.5 : 13.5 }}>{title}</Text> : null}
      {children}
      {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
    </Pressable>
  );
}

const VARIANT_STYLES: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: accent.base,
    borderWidth: 0,
    ...shadows.sh1,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line2,
    ...shadows.sh1,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line2,
  },
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: accent.onAccent,
  secondary: colors.ink,
  ghost: colors.ink,
  outline: colors.ink,
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

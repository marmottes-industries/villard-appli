import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors, radii, shadows } from '@/src/theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  flat?: boolean;
};

export function Card({ children, style, flat = false }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radii.xl,
          borderWidth: 1,
          borderColor: colors.line,
          overflow: 'hidden',
        },
        flat ? null : shadows.sh1,
        style,
      ]}
    >
      {children}
    </View>
  );
}

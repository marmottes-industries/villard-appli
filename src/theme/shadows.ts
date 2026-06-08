import { Platform, type ViewStyle } from 'react-native';

const ios = (offsetY: number, radius: number, opacity: number): ViewStyle => ({
  shadowColor: '#1B271F',
  shadowOffset: { width: 0, height: offsetY },
  shadowRadius: radius,
  shadowOpacity: opacity,
});

const android = (elevation: number): ViewStyle => ({ elevation });

export const shadows = {
  none: {} as ViewStyle,
  sh1: Platform.select({ ios: ios(1, 2, 0.06), android: android(1), default: {} }) as ViewStyle,
  sh2: Platform.select({ ios: ios(4, 12, 0.08), android: android(3), default: {} }) as ViewStyle,
  sh3: Platform.select({ ios: ios(10, 28, 0.16), android: android(8), default: {} }) as ViewStyle,
} as const;

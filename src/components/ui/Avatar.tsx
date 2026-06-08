import { View } from 'react-native';
import { Text } from './Text';
import { fontFamily } from '@/src/theme';

type Props = {
  initials: string;
  color: string;
  size?: number;
};

export function Avatar({ initials, color, size = 32 }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#fff',
          fontFamily: fontFamily.sans,
          fontWeight: '700',
          fontSize: Math.round(size * 0.4),
          letterSpacing: -0.2,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

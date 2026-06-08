import { View, StyleSheet } from 'react-native';
import { colors, radii, fontSize } from '@/src/theme';
import { Text } from './Text';

type Tone = 'ok' | 'worn' | 'replace' | 'neutral';

const TONE: Record<Tone, { bg: string; fg: string; dot: string }> = {
  ok:      { bg: colors.okBg,      fg: '#3c573f', dot: colors.ok },
  worn:    { bg: colors.wornBg,    fg: '#855526', dot: colors.worn },
  replace: { bg: colors.replaceBg, fg: '#8c3a2e', dot: colors.replace },
  neutral: { bg: colors.card3,     fg: colors.ink2, dot: colors.ink3 },
};

type Props = {
  label: string;
  tone?: Tone;
  withDot?: boolean;
};

export function Tag({ label, tone = 'neutral', withDot = false }: Props) {
  const t = TONE[tone];
  return (
    <View style={[styles.base, { backgroundColor: t.bg }]}>
      {withDot ? <View style={[styles.dot, { backgroundColor: t.dot }]} /> : null}
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 23,
    paddingHorizontal: 9,
    borderRadius: radii.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 999 },
  text: { fontSize: fontSize.sm, fontWeight: '700' },
});

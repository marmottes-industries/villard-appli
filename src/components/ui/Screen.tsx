import { StyleSheet, View, ScrollView, type ViewStyle, type StyleProp } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { colors, spacing } from '@/src/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  edges?: ReadonlyArray<'top' | 'bottom' | 'left' | 'right'>;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  background?: string;
};

export function Screen({
  children,
  scroll = true,
  edges = ['top', 'left', 'right'],
  style,
  contentStyle,
  background = colors.paper,
}: Props) {
  const insets = useSafeAreaInsets();
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView edges={edges as ('top' | 'bottom' | 'left' | 'right')[]} style={[styles.safe, { backgroundColor: background }, style]}>
      <Container
        contentContainerStyle={scroll ? [styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxxl }, contentStyle] : undefined}
        style={!scroll ? [styles.flex, contentStyle] : undefined}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
});

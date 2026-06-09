import { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, type ViewStyle, type StyleProp } from 'react-native';
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
  onRefresh?: () => void | Promise<unknown>;
};

export function Screen({
  children,
  scroll = true,
  edges = ['top', 'left', 'right'],
  style,
  contentStyle,
  background = colors.paper,
  onRefresh,
}: Props) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const refreshControl =
    scroll && onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={colors.forest}
        colors={[colors.forest]}
      />
    ) : undefined;

  return (
    <SafeAreaView edges={edges as ('top' | 'bottom' | 'left' | 'right')[]} style={[styles.safe, { backgroundColor: background }, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxxl }, contentStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
});

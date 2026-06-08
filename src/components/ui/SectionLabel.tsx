import { View, StyleSheet, Pressable } from 'react-native';
import type { ReactNode } from 'react';
import { Text } from './Text';
import { accent, spacing } from '@/src/theme';

type Props = {
  children: ReactNode;
  action?: { label: string; onPress: () => void };
};

export function SectionLabel({ children, action }: Props) {
  return (
    <View style={styles.row}>
      <Text variant="eyebrow">{children}</Text>
      {action ? (
        <Pressable onPress={action.onPress}>
          <Text variant="small" weight="600" color={accent.base}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
    paddingHorizontal: 6,
  },
});

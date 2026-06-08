import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';

export default function InventaireScreen() {
  return (
    <Screen>
      <View style={styles.head}>
        <Text variant="eyebrow">Stock & matériel</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Inventaire</Text>
      </View>
      <View style={styles.body}>
        <Card>
          <View style={{ padding: spacing.lg }}>
            <Text variant="small" color={colors.ink3}>Items inventaire (à brancher).</Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  body: { paddingHorizontal: spacing.lg },
});

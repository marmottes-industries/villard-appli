import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Text, Card, Button } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing } from '@/src/theme';

export default function SejourDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <View style={styles.head}>
        <Button
          variant="ghost"
          onPress={() => router.back()}
          leftIcon={<Icon name="chevL" color={colors.ink} size={18} />}
          title="Retour"
          style={{ paddingHorizontal: 0 }}
        />
        <Text variant="eyebrow" style={{ marginTop: spacing.sm }}>Séjour</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Détail #{id}</Text>
      </View>
      <View style={styles.body}>
        <Card>
          <View style={{ padding: spacing.lg }}>
            <Text variant="small" color={colors.ink3}>Détails du séjour (à brancher).</Text>
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

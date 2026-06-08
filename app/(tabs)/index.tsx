import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, SectionLabel } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';
import { useAuth } from '@/src/stores/auth';

export default function AccueilScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Screen>
      <View style={styles.head}>
        <Text variant="eyebrow">Les Mélèzes · Villard-de-Lans</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Bonjour {user?.username ?? ''} 👋</Text>
      </View>

      <View style={styles.body}>
        <Card style={{ padding: spacing.lg, backgroundColor: colors.forest }}>
          <Text variant="eyebrow" color="#A9C9A0">État de l'appartement</Text>
          <Text variant="h3" color="#fff" style={{ marginTop: spacing.xs }}>Libre aujourd'hui</Text>
          <Text variant="small" color="#B9CDB2" style={{ marginTop: spacing.xxs }}>
            Aucune réservation en cours.
          </Text>
        </Card>

        <SectionLabel action={{ label: 'Tout voir', onPress: () => router.push('/(tabs)/planning') }}>
          Prochains séjours
        </SectionLabel>
        <Card>
          <View style={{ padding: spacing.lg }}>
            <Text variant="small" color={colors.ink3}>Pas encore de séjour à afficher.</Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  body: { paddingHorizontal: spacing.lg, gap: spacing.xs },
});

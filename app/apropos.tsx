import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { useAuth } from '@/src/stores/auth';
import { colors, spacing } from '@/src/theme';

export default function AProposScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  async function onLogout() {
    await logout();
    router.replace('/login');
  }

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
        <Text variant="eyebrow" style={{ marginTop: spacing.sm }}>À propos</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Les Mélèzes</Text>
      </View>
      <View style={styles.body}>
        <Card style={{ padding: spacing.lg, backgroundColor: colors.forestDeep }}>
          <Text variant="eyebrow" color="#A9C0A2">Auto-hébergé</Text>
          <Text variant="h3" color="#fff" style={{ marginTop: spacing.xs }}>API · Symfony / API Platform</Text>
          <Text variant="small" color="#A9C0A2" style={{ marginTop: spacing.xs }}>
            Connecté en tant que {user?.username ?? '—'}.
          </Text>
        </Card>

        <Button
          title="Se déconnecter"
          variant="outline"
          onPress={onLogout}
          leftIcon={<Icon name="logout" size={16} color={colors.ink} />}
          fullWidth
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  body: { paddingHorizontal: spacing.lg, gap: spacing.sm },
});

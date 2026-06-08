import { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button } from '@/src/components/ui';
import { useAuth } from '@/src/stores/auth';
import { colors, radii, spacing } from '@/src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!username || !password) return;
    setSubmitting(true);
    try {
      await login({ username, password });
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Connexion impossible', err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll={false} background={colors.forestDeep}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.brand}>
          <Text variant="eyebrow" color="#93Ad8d">Les Mélèzes</Text>
          <Text variant="h1" color="#fff" style={{ marginTop: spacing.xs }}>Bonjour 👋</Text>
          <Text variant="small" color="#A9C0A2" style={{ marginTop: spacing.xs }}>
            Connectez-vous pour gérer l'appartement.
          </Text>
        </View>

        <View style={styles.form}>
          <Text variant="label" color="#DDE7D6">Identifiant</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            placeholder="prenom"
            placeholderTextColor={colors.ink4}
          />
          <Text variant="label" color="#DDE7D6" style={{ marginTop: spacing.lg }}>Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.ink4}
          />
          <Button
            title={submitting ? '…' : 'Se connecter'}
            variant="primary"
            onPress={onSubmit}
            disabled={submitting}
            fullWidth
            style={{ marginTop: spacing.xl, height: 50, borderRadius: radii.lg }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xxl },
  brand: { gap: spacing.xxs },
  form: { gap: spacing.xs },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    marginTop: spacing.xs,
  },
});

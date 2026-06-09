import { Modal, View, StyleSheet, Linking, Pressable } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { colors, radii, spacing, shadows } from '@/src/theme';

type Props = {
  visible: boolean;
  forced: boolean;
  currentVersion: string | null;
  latestVersion: string | null;
  storeUrl: string | null;
  onDismiss: () => void;
};

export function UpdateModal({ visible, forced, currentVersion, latestVersion, storeUrl, onDismiss }: Props) {
  const handleUpdate = () => {
    if (storeUrl) Linking.openURL(storeUrl).catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={forced ? undefined : onDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text variant="eyebrow" style={{ marginBottom: spacing.xs }}>
            Mise à jour {forced ? 'requise' : 'disponible'}
          </Text>
          <Text variant="h3" style={{ marginBottom: spacing.sm }}>
            {forced ? 'Cette version n’est plus supportée' : 'Une nouvelle version est disponible'}
          </Text>
          <Text variant="body" color={colors.ink2} style={{ marginBottom: spacing.md }}>
            {forced
              ? 'Pour continuer à utiliser l’application, merci de la mettre à jour.'
              : 'Vous pouvez continuer à utiliser l’application, mais nous vous recommandons de la mettre à jour pour profiter des dernières améliorations.'}
          </Text>
          {currentVersion && latestVersion ? (
            <Text variant="small" style={{ marginBottom: spacing.lg }}>
              Version actuelle : {currentVersion}   ·   Dernière : {latestVersion}
            </Text>
          ) : null}

          <Button
            title="Mettre à jour"
            variant="primary"
            fullWidth
            onPress={handleUpdate}
            disabled={!storeUrl}
          />
          {!forced ? (
            <Pressable onPress={onDismiss} style={styles.later} hitSlop={8}>
              <Text variant="small" color={colors.ink3}>Plus tard</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sh1,
  },
  later: {
    marginTop: spacing.md,
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});

import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Avatar, Text } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, occupantPalette, radii, shadows, spacing } from '@/src/theme';
import { useAuth } from '@/src/stores/auth';
import { idFromIri } from '@/src/api/users';

function initials(name: string): string {
  return (
    name
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

export function UserPill() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { short, color } = useMemo(() => {
    if (!user) return { short: '?', color: colors.ink3 };
    const id = idFromIri(user['@id']) ?? 0;
    const palette = occupantPalette[id % occupantPalette.length];
    return { short: initials(user.username), color: palette.color };
  }, [user]);

  if (!user) return null;

  async function handleLogout() {
    setOpen(false);
    await logout();
  }

  function handleAbout() {
    setOpen(false);
    router.push('/apropos');
  }

  const top = insets.top + spacing.sm;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        style={({ pressed }) => [
          styles.pill,
          { top, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Avatar initials={short} color={color} size={32} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.menu, { top: top + 40 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Avatar initials={short} color={color} size={36} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="eyebrow" color={colors.ink3}>Connecté</Text>
                <Text variant="body" weight="700" numberOfLines={1}>
                  {user.username}
                </Text>
              </View>
            </View>
            <View style={styles.sep} />
            <Pressable
              onPress={handleAbout}
              style={({ pressed }) => [styles.action, pressed && { backgroundColor: colors.card3 }]}
            >
              <Icon name="info" size={18} color={colors.ink} />
              <Text variant="body" weight="600">
                À propos
              </Text>
            </Pressable>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [styles.action, pressed && { backgroundColor: colors.card3 }]}
            >
              <Icon name="logout" size={18} color={colors.replace} />
              <Text variant="body" weight="600" color={colors.replace}>
                Se déconnecter
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    right: spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    zIndex: 50,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    right: spacing.lg,
    minWidth: 220,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.xs,
    ...shadows.sh3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sep: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xxs,
  },
});

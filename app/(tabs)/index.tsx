import { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, SectionLabel, Avatar } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';
import { useAuth } from '@/src/stores/auth';
import { useOccupations } from '@/src/stores/occupations';
import { useUsers } from '@/src/stores/users';
import { resolveUser } from '@/src/lib/occupants';
import { MONTHS_ABBR, fmtRange, nights, parseISO, todayMidday } from '@/src/lib/dates';
import type { Occupation } from '@/src/api/occupations';

export default function AccueilScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const occupations = useOccupations();
  const users = useUsers();

  const TODAY = todayMidday();

  const current = useMemo<Occupation | null>(() => {
    for (const o of occupations.items) {
      if (parseISO(o.startDate) <= TODAY && parseISO(o.endDate) >= TODAY) return o;
    }
    return null;
  }, [occupations.items, TODAY]);

  const upcoming = useMemo<Occupation[]>(() => {
    return [...occupations.items]
      .filter((o) => parseISO(o.startDate) > TODAY)
      .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
      .slice(0, 3);
  }, [occupations.items, TODAY]);

  const loading = occupations.state === 'loading' && occupations.items.length === 0;
  const errored = occupations.state === 'error';

  const currentUser = current ? resolveUser(users.items, current.occupant) : null;

  return (
    <Screen>
      <View style={styles.head}>
        <Text variant="eyebrow">Les Marmottes · Villard-de-Lans</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Bonjour {user?.username ?? ''} 👋</Text>
      </View>

      <View style={styles.body}>
        <Card style={{ padding: spacing.lg, backgroundColor: colors.forest }}>
          <Text variant="eyebrow" color="#A9C9A0">État de l'appartement</Text>
          {loading ? (
            <ActivityIndicator color="#fff" style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }} />
          ) : current && currentUser ? (
            <>
              <Text variant="h3" color="#fff" style={{ marginTop: spacing.xs }}>
                Occupé par {currentUser.username}
              </Text>
              <Text variant="small" color="#B9CDB2" style={{ marginTop: spacing.xxs }}>
                Jusqu'au {parseISO(current.endDate).getDate()} {MONTHS_ABBR[parseISO(current.endDate).getMonth()]}
                {current.notes ? ` · ${current.notes}` : ''}
              </Text>
            </>
          ) : (
            <>
              <Text variant="h3" color="#fff" style={{ marginTop: spacing.xs }}>Libre aujourd'hui</Text>
              <Text variant="small" color="#B9CDB2" style={{ marginTop: spacing.xxs }}>
                Aucune réservation en cours.
              </Text>
            </>
          )}
        </Card>

        <SectionLabel action={{ label: 'Tout voir', onPress: () => router.push('/(tabs)/planning') }}>
          Prochains séjours
        </SectionLabel>

        {loading ? (
          <Card>
            <View style={styles.center}>
              <ActivityIndicator color={colors.forest} />
            </View>
          </Card>
        ) : errored ? (
          <Card>
            <View style={styles.center}>
              <Text variant="small" color={colors.replace}>
                {occupations.errorMessage ?? 'Une erreur est survenue.'}
              </Text>
            </View>
          </Card>
        ) : upcoming.length === 0 ? (
          <Card>
            <View style={styles.center}>
              <Text variant="small" color={colors.ink3}>Pas encore de séjour à afficher.</Text>
            </View>
          </Card>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {upcoming.map((o) => {
              const u = resolveUser(users.items, o.occupant);
              const n = nights(o.startDate, o.endDate);
              return (
                <Card key={o.id}>
                  <View style={styles.row}>
                    <Avatar initials={u.short} color={u.color} size={34} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="body" weight="700" numberOfLines={1}>{u.username}</Text>
                      <Text variant="small" color={colors.ink3} numberOfLines={1}>
                        {fmtRange(o.startDate, o.endDate)} · {n} nuit{n > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  body: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  center: { padding: spacing.xl, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
});

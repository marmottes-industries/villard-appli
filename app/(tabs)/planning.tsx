import { useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Screen, Text, Card, Avatar, Tag, Button } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import { useOccupations } from '@/src/stores/occupations';
import { useUsers } from '@/src/stores/users';
import { useAuth } from '@/src/stores/auth';
import { resolveUser } from '@/src/lib/occupants';
import {
  MONTHS,
  MONTHS_ABBR,
  addDays,
  fmtISO,
  fmtRange,
  nights,
  parseISO,
  todayMidday,
} from '@/src/lib/dates';
import type { Occupation } from '@/src/api/occupations';
import { OccupationForm, type FormInitial } from '@/src/components/planning/OccupationForm';

type Group = { key: string; label: string; items: Occupation[] };

export default function PlanningScreen() {
  const occupations = useOccupations();
  const users = useUsers();
  const { user } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<FormInitial | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isAdmin = useMemo(() => user?.roles?.includes('ROLE_ADMIN') ?? false, [user]);

  const currentUserIri = useMemo<string | null>(() => {
    if (!user?.uuid) return null;
    return users.items.find((u) => u.uuid === user.uuid)?.iri ?? null;
  }, [user, users.items]);

  const groups = useMemo<Group[]>(() => {
    const sorted = [...occupations.items].sort(
      (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
    );
    const map = new Map<string, Group>();
    for (const o of sorted) {
      const d = parseISO(o.startDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
          items: [],
        });
      }
      map.get(key)!.items.push(o);
    }
    return Array.from(map.values());
  }, [occupations.items]);

  function canEdit(o: Occupation): boolean {
    if (isAdmin) return true;
    return o.occupant === currentUserIri;
  }

  function openCreate() {
    const start = todayMidday();
    setFormInitial({
      mode: 'create',
      startDate: fmtISO(start),
      endDate: fmtISO(addDays(start, 1)),
      occupantIri: currentUserIri ?? users.items[0]?.iri ?? '',
    });
    setActionError(null);
    setFormOpen(true);
  }

  function openEdit(occupation: Occupation) {
    setFormInitial({ mode: 'edit', occupation });
    setActionError(null);
    setFormOpen(true);
  }

  function close() {
    setFormOpen(false);
    setFormInitial(null);
    setActionError(null);
  }

  async function handleSubmit(payload: {
    id: number | null;
    startDate: string;
    endDate: string;
    notes: string;
    occupant: string;
  }) {
    setSubmitting(true);
    setActionError(null);
    try {
      if (payload.id === null) {
        await occupations.create({
          startDate: payload.startDate,
          endDate: payload.endDate,
          notes: payload.notes || undefined,
          occupant: payload.occupant,
        });
      } else {
        await occupations.update(payload.id, {
          startDate: payload.startDate,
          endDate: payload.endDate,
          notes: payload.notes || undefined,
          occupant: payload.occupant,
        });
      }
      close();
    } catch (err) {
      setActionError(formatActionError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: number) {
    setSubmitting(true);
    setActionError(null);
    try {
      await occupations.remove(id);
      close();
    } catch (err) {
      setActionError(formatActionError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const editingOccupation = formInitial?.mode === 'edit' ? formInitial.occupation : null;
  const canDeleteOpen = editingOccupation ? canEdit(editingOccupation) : false;

  const handleRefresh = async () => {
    await Promise.all([occupations.fetchAll(), users.fetchAll()]);
  };

  return (
    <Screen onRefresh={handleRefresh}>
      <View style={styles.head}>
        <View style={styles.headRow}>
          <View style={{ flex: 1 }}>
            <Text variant="eyebrow">Planning d&apos;occupation</Text>
            <Text variant="h1" style={{ marginTop: spacing.xxs }}>Séjours</Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            onPress={openCreate}
            leftIcon={<Icon name="plus" size={15} color="#fff" />}
            title="Réserver"
          />
        </View>
      </View>

      <View style={styles.body}>
        {occupations.state === 'loading' && occupations.items.length === 0 ? (
          <Card>
            <View style={styles.center}>
              <ActivityIndicator color={colors.forest} />
              <Text variant="small" color={colors.ink3} style={{ marginTop: spacing.sm }}>
                Chargement…
              </Text>
            </View>
          </Card>
        ) : occupations.state === 'error' ? (
          <Card>
            <View style={styles.center}>
              <Text variant="small" color={colors.replace}>
                {occupations.errorMessage ?? 'Une erreur est survenue.'}
              </Text>
              <Pressable onPress={occupations.fetchAll} hitSlop={8} style={styles.retry}>
                <Text variant="small" weight="600" color={colors.forest}>Réessayer</Text>
              </Pressable>
            </View>
          </Card>
        ) : groups.length === 0 ? (
          <Card>
            <View style={styles.center}>
              <Text variant="small" color={colors.ink3}>Aucun séjour à afficher.</Text>
            </View>
          </Card>
        ) : (
          groups.map((g) => (
            <View key={g.key} style={styles.group}>
              <Text variant="eyebrow" style={styles.groupLabel}>{g.label}</Text>
              <View style={{ gap: spacing.sm }}>
                {g.items.map((o) => (
                  <OccupationRow
                    key={o.id}
                    occupation={o}
                    users={users.items}
                    editable={canEdit(o)}
                    onPress={() => canEdit(o) && openEdit(o)}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      <OccupationForm
        open={formOpen}
        initial={formInitial}
        occupants={users.items}
        currentUserIri={currentUserIri}
        canChangeOccupant={isAdmin}
        canDelete={canDeleteOpen}
        submitting={submitting}
        errorMessage={actionError}
        onClose={close}
        onSubmit={handleSubmit}
        onRemove={handleRemove}
      />
    </Screen>
  );
}

const TODAY = todayMidday();

function status(o: Occupation): 'past' | 'current' | 'upcoming' {
  const s = parseISO(o.startDate);
  const e = parseISO(o.endDate);
  if (e < TODAY) return 'past';
  if (s <= TODAY && e >= TODAY) return 'current';
  return 'upcoming';
}

function OccupationRow({
  occupation,
  users,
  editable,
  onPress,
}: {
  occupation: Occupation;
  users: ReturnType<typeof useUsers>['items'];
  editable: boolean;
  onPress: () => void;
}) {
  const u = resolveUser(users, occupation.occupant);
  const st = status(occupation);
  const start = parseISO(occupation.startDate);
  const n = nights(occupation.startDate, occupation.endDate);

  return (
    <Pressable onPress={onPress} disabled={!editable} style={({ pressed }) => pressed && editable ? { opacity: 0.85 } : null}>
      <Card flat={st === 'past'}>
        <View style={[styles.row, st === 'past' ? styles.rowPast : null]}>
          <View style={styles.dateBox}>
            <Text variant="h3" style={{ lineHeight: 22 }}>{start.getDate()}</Text>
            <Text variant="mono" color={colors.ink3}>
              {MONTHS_ABBR[start.getMonth()]}
            </Text>
          </View>
          <View style={[styles.bar, { backgroundColor: u.color }]} />
          <Avatar initials={u.short} color={u.color} size={34} />
          <View style={styles.main}>
            <View style={styles.nameRow}>
              <Text variant="body" weight="700" numberOfLines={1}>
                {u.username}
              </Text>
              {st === 'current' ? <Tag tone="ok" label="En cours" withDot /> : null}
            </View>
            {occupation.notes ? (
              <Text variant="small" color={colors.ink3} numberOfLines={1}>
                {occupation.notes}
              </Text>
            ) : null}
          </View>
          <View style={styles.meta}>
            <Text variant="mono" color={colors.ink2}>
              {fmtRange(occupation.startDate, occupation.endDate)}
            </Text>
            <Text variant="small" color={colors.ink3}>
              {n} nuit{n > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function formatActionError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.response?.status === 403) return 'Action non autorisée.';
    if (err.response?.status === 422) return 'Données invalides — vérifie les dates.';
    if (err.code === 'ERR_NETWORK') return 'Impossible de joindre le serveur.';
  }
  return 'Une erreur est survenue.';
}

const styles = StyleSheet.create({
  head: { paddingLeft: spacing.xl, paddingRight: spacing.xl + 44, paddingTop: spacing.md, paddingBottom: spacing.md },
  headRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  body: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  center: { padding: spacing.xxl, alignItems: 'center' },
  retry: { marginTop: spacing.md },
  group: { gap: spacing.sm },
  groupLabel: { paddingHorizontal: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  rowPast: { opacity: 0.55 },
  dateBox: { width: 38, alignItems: 'center' },
  bar: { width: 3, alignSelf: 'stretch', borderRadius: radii.xs },
  main: { flex: 1, minWidth: 0, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  meta: { alignItems: 'flex-end', gap: 2 },
});

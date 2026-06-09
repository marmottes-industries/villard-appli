import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { AxiosError } from 'axios';
import { Screen, Text, Card, Button } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import { useWork } from '@/src/stores/work';
import { useUsers } from '@/src/stores/users';
import { useAuth } from '@/src/stores/auth';
import { resolveUser } from '@/src/lib/occupants';
import { WorkCard } from '@/src/components/work/WorkCard';
import { WorkModal, type ModalInitial, type WorkSavePayload } from '@/src/components/work/WorkModal';
import { PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from '@/src/lib/workMeta';
import type { Work, WorkStatus } from '@/src/api/work';

type StatusFilter = WorkStatus | 'all' | 'open';

const costFmt = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export default function TravauxScreen() {
  const works = useWork();
  const users = useUsers();
  const { user } = useAuth();

  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;
  const currentUserIri = useMemo(() => {
    if (!user?.uuid) return null;
    return users.items.find((u) => u.uuid === user.uuid)?.iri ?? null;
  }, [users.items, user?.uuid]);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<ModalInitial | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initial =
    works.state === 'loading' || users.state === 'loading'
      ? 'loading'
      : works.state === 'error' || users.state === 'error'
        ? 'error'
        : 'ready';

  function canEdit(w: Work): boolean {
    if (isAdmin) return true;
    return currentUserIri !== null && w.author === currentUserIri;
  }

  const sorted = useMemo<Work[]>(() => {
    return [...works.items].sort((a, b) => {
      const sa = STATUS_ORDER.indexOf(a.status);
      const sb = STATUS_ORDER.indexOf(b.status);
      if (sa !== sb) return sa - sb;
      const pa = a.priority ? PRIORITY_ORDER[a.priority] : 3;
      const pb = b.priority ? PRIORITY_ORDER[b.priority] : 3;
      if (pa !== pb) return pa - pb;
      const da = new Date(a.scheduledFor ?? a.createdAt).getTime();
      const db = new Date(b.scheduledFor ?? b.createdAt).getTime();
      return da - db;
    });
  }, [works.items]);

  const filtered = useMemo<Work[]>(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((w) => {
      if (statusFilter === 'open') {
        if (w.status === 'done' || w.status === 'cancelled') return false;
      } else if (statusFilter !== 'all' && w.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return `${w.title} ${w.description ?? ''}`.toLowerCase().includes(q);
    });
  }, [sorted, query, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<WorkStatus, number> = {
      suggested: 0, planned: 0, in_progress: 0, done: 0, cancelled: 0,
    };
    for (const w of works.items) map[w.status]++;
    return map;
  }, [works.items]);

  const openCount = counts.suggested + counts.planned + counts.in_progress;

  const doneWorks = useMemo(() => works.items.filter((w) => w.status === 'done'), [works.items]);

  function completionYear(w: Work): number | null {
    const ref = w.completedAt ?? w.scheduledFor ?? w.createdAt;
    if (!ref) return null;
    const d = new Date(ref);
    return Number.isNaN(d.getTime()) ? null : d.getFullYear();
  }

  const availableYears = useMemo<number[]>(() => {
    const set = new Set<number>();
    for (const w of doneWorks) {
      const y = completionYear(w);
      if (y !== null) set.add(y);
    }
    return [...set].sort((a, b) => b - a);
  }, [doneWorks]);

  const doneInYear = useMemo(() => {
    return doneWorks.filter((w) => {
      if (yearFilter === 'all') return true;
      return completionYear(w) === yearFilter;
    });
  }, [doneWorks, yearFilter]);

  const totalActualCost = useMemo(
    () => doneInYear.reduce((sum, w) => sum + (w.actualCost ?? 0), 0),
    [doneInYear],
  );
  const countWithCost = useMemo(
    () => doneInYear.filter((w) => w.actualCost !== null && w.actualCost !== undefined).length,
    [doneInYear],
  );

  function openNew() {
    setModalInitial({ mode: 'create' });
    setActionError(null);
    setModalOpen(true);
  }
  function openEdit(w: Work) {
    setModalInitial({ mode: 'edit', work: w });
    setActionError(null);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setModalInitial(null);
    setActionError(null);
  }

  async function onSubmit(payload: WorkSavePayload) {
    setActionError(null);
    setSubmitting(true);
    try {
      const body = {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        type: payload.type,
        priority: payload.priority,
        scheduledFor: payload.scheduledFor,
        estimatedCost: payload.estimatedCost,
        actualCost: payload.actualCost,
      };
      if (payload.id === null) await works.create(body);
      else await works.update(payload.id, body);
      closeModal();
    } catch (err) {
      setActionError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onRemove(id: number) {
    setActionError(null);
    setSubmitting(true);
    try {
      await works.remove(id);
      closeModal();
    } catch (err) {
      setActionError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function retry() {
    await Promise.all([works.fetchAll(), users.fetchAll()]);
  }

  const canDeleteCurrent =
    modalInitial?.mode === 'edit' ? canEdit(modalInitial.work) : false;

  return (
    <Screen onRefresh={retry}>
      <View style={styles.head}>
        <Text variant="eyebrow">Le chalet</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Travaux</Text>
        <Text variant="small" color={colors.ink3} style={{ marginTop: spacing.xxs }}>
          Bricolage et prestations à faire
        </Text>
      </View>

      <View style={styles.body}>
        {initial === 'loading' ? (
          <Card>
            <View style={styles.center}><ActivityIndicator color={colors.forest} /></View>
          </Card>
        ) : initial === 'error' ? (
          <Card>
            <View style={styles.center}>
              <Text variant="small" color={colors.replace}>
                {works.errorMessage ?? users.errorMessage ?? 'Erreur de chargement.'}
              </Text>
              <Button title="Réessayer" onPress={retry} style={{ marginTop: spacing.sm }} />
            </View>
          </Card>
        ) : (
          <>
            <View style={styles.searchRow}>
              <View style={styles.search}>
                <Icon name="search" size={15} color={colors.ink3} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Rechercher un travail…"
                  placeholderTextColor={colors.ink4}
                  style={styles.searchInput}
                />
              </View>
              <Button
                variant="primary"
                onPress={openNew}
                leftIcon={<Icon name="plus" size={15} color="#fff" />}
                title="Ajouter"
              />
            </View>

            {doneWorks.length > 0 ? (
              <Card style={styles.statsCard}>
                <View style={styles.statsRow}>
                  <View>
                    <Text variant="eyebrow">Coût réel cumulé</Text>
                    <Text variant="h2" style={{ marginTop: 2 }}>
                      {costFmt.format(totalActualCost)}
                    </Text>
                    <Text variant="small" color={colors.ink3}>
                      {countWithCost} / {doneInYear.length} travaux chiffrés
                    </Text>
                  </View>
                  {availableYears.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.yearRow}
                    >
                      <YearChip
                        label="Toutes"
                        on={yearFilter === 'all'}
                        onPress={() => setYearFilter('all')}
                      />
                      {availableYears.map((y) => (
                        <YearChip
                          key={y}
                          label={String(y)}
                          on={yearFilter === y}
                          onPress={() => setYearFilter(y)}
                        />
                      ))}
                    </ScrollView>
                  ) : null}
                </View>
              </Card>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              <FilterChip
                label="À faire"
                count={openCount}
                on={statusFilter === 'open'}
                onPress={() => setStatusFilter('open')}
              />
              <FilterChip
                label="Tous"
                count={works.items.length}
                on={statusFilter === 'all'}
                onPress={() => setStatusFilter('all')}
              />
              {STATUS_ORDER.map((s) => (
                <FilterChip
                  key={s}
                  label={STATUS_META[s].label}
                  count={counts[s]}
                  on={statusFilter === s}
                  onPress={() => setStatusFilter(s)}
                />
              ))}
            </ScrollView>

            {actionError ? (
              <View style={styles.errorBox}>
                <Icon name="alert" size={15} color="#8c3a2e" />
                <Text variant="small" weight="600" color="#8c3a2e">{actionError}</Text>
              </View>
            ) : null}

            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Icon name="tools" size={26} color={colors.ink3} />
                <Text variant="small" color={colors.ink3} style={{ marginTop: spacing.xs, textAlign: 'center' }}>
                  {query
                    ? `Aucun travail ne correspond à « ${query} ».`
                    : statusFilter !== 'open' && statusFilter !== 'all'
                      ? 'Aucun travail dans ce statut.'
                      : 'Aucun travail pour le moment. Ajoute le premier !'}
                </Text>
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {filtered.map((w) => (
                  <WorkCard
                    key={w.id}
                    work={w}
                    author={resolveUser(users.items, w.author)}
                    canEdit={canEdit(w)}
                    onEdit={openEdit}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <WorkModal
        open={modalOpen}
        initial={modalInitial}
        canDelete={canDeleteCurrent}
        submitting={submitting}
        errorMessage={actionError}
        onClose={closeModal}
        onSubmit={onSubmit}
        onRemove={onRemove}
      />
    </Screen>
  );
}

function FilterChip({ label, count, on, onPress }: { label: string; count: number; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}
    >
      <Text variant="small" weight="700" color={on ? '#fff' : colors.ink2} style={{ fontSize: 12.5 }}>
        {label}
      </Text>
      <View style={[styles.filterCount, on && { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
        <Text variant="small" weight="700" color={on ? '#fff' : colors.ink2} style={{ fontSize: 11 }}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function YearChip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.yearChip, on && { backgroundColor: colors.forest, borderColor: colors.forest }]}
    >
      <Text variant="small" weight="700" color={on ? '#fff' : colors.ink2} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function formatError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.response?.status === 403) return 'Action non autorisée.';
    if (err.response?.status === 422) return 'Données invalides.';
    if (err.code === 'ERR_NETWORK') return 'Impossible de joindre le serveur.';
  }
  return 'Une erreur est survenue.';
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  body: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  center: { padding: spacing.xl, alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  search: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, height: 38, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.card,
  },
  searchInput: { flex: 1, fontSize: 13.5, color: colors.ink, paddingVertical: 0 },
  statsCard: { marginBottom: spacing.xs },
  statsRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: spacing.sm,
    padding: spacing.md,
  },
  yearRow: { gap: 6, paddingVertical: 2 },
  yearChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line2,
    backgroundColor: colors.card,
  },
  filters: { gap: 6, paddingVertical: 2, paddingHorizontal: 2 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line2,
    backgroundColor: colors.card,
  },
  filterCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    padding: spacing.sm, borderRadius: radii.md, backgroundColor: colors.replaceBg,
  },
  empty: { padding: spacing.xxl, alignItems: 'center' },
});

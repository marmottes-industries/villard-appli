import { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { AxiosError } from 'axios';
import { Screen, Text, Card, Button, Tag } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import { useInventory } from '@/src/stores/inventory';
import { useCategories, type DisplayCategory } from '@/src/stores/categories';
import { useAuth } from '@/src/stores/auth';
import { InventoryItemModal, type ModalInitial } from '@/src/components/inventory/InventoryItemModal';
import type { InventoryItem, InvState } from '@/src/api/inventory';

type CatFilter = 'all' | string;
type StateFilter = InvState | 'all';

const STATE_FILTERS: [StateFilter, string][] = [
  ['all', 'Tout'],
  ['ok', 'Bon'],
  ['worn', 'Usé'],
  ['replace', 'À remplacer'],
];

const STATE_TAG: Record<InvState, { tone: 'ok' | 'worn' | 'replace'; label: string }> = {
  ok: { tone: 'ok', label: 'Bon état' },
  worn: { tone: 'worn', label: 'Usé' },
  replace: { tone: 'replace', label: 'À remplacer' },
};

export default function InventaireScreen() {
  const inventory = useInventory();
  const categories = useCategories();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;

  const [cat, setCat] = useState<CatFilter>('all');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<ModalInitial | null>(null);

  const initial =
    inventory.state === 'loading' || categories.state === 'loading'
      ? 'loading'
      : inventory.state === 'error' || categories.state === 'error'
        ? 'error'
        : 'ready';

  const counts = useMemo(() => ({
    total: inventory.items.reduce((s, i) => s + i.quantity, 0),
    refs: inventory.items.length,
    ok: inventory.items.filter((i) => i.state === 'ok').length,
    worn: inventory.items.filter((i) => i.state === 'worn').length,
    replace: inventory.items.filter((i) => i.state === 'replace').length,
  }), [inventory.items]);

  const filtered = useMemo<InventoryItem[]>(() => {
    const q = query.trim().toLowerCase();
    return inventory.items
      .filter((i) =>
        (cat === 'all' || i.category === cat) &&
        (stateFilter === 'all' || i.state === stateFilter) &&
        (q === '' || `${i.name} ${i.location ?? ''} ${i.note ?? ''}`.toLowerCase().includes(q))
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  }, [inventory.items, cat, stateFilter, query]);

  const visibleCategories = useMemo<DisplayCategory[]>(() => {
    const used = new Set(inventory.items.map((i) => i.category));
    if (cat !== 'all') used.add(cat);
    return categories.items.filter((c) => used.has(c['@id']));
  }, [inventory.items, categories.items, cat]);

  const categoriesShown = cat === 'all'
    ? visibleCategories
    : visibleCategories.filter((c) => c['@id'] === cat);

  function openNew() {
    setModalInitial({ mode: 'create', defaultCategory: cat !== 'all' ? cat : undefined });
    setModalOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setModalInitial({ mode: 'edit', item });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalInitial(null);
  }

  async function onSubmit(payload: {
    id: number | null;
    name: string;
    quantity: number;
    state: InvState;
    location: string | null;
    note: string | null;
    category: string;
  }) {
    setActionError(null);
    try {
      if (payload.id === null) {
        await inventory.create(payload);
      } else {
        await inventory.update(payload.id, payload);
      }
      closeModal();
    } catch (err) {
      setActionError(formatError(err));
    }
  }

  async function onRemove(id: number) {
    setActionError(null);
    try {
      await inventory.remove(id);
      closeModal();
    } catch (err) {
      setActionError(formatError(err));
    }
  }

  async function retry() {
    await Promise.all([inventory.fetchAll(), categories.fetchAll()]);
  }

  return (
    <Screen onRefresh={retry}>
      <View style={styles.head}>
        <Text variant="eyebrow">Suivi d&apos;inventaire</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Inventaire</Text>
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
                {inventory.errorMessage ?? categories.errorMessage ?? 'Erreur de chargement.'}
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
                  placeholder="Rechercher…"
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

            <View style={styles.summary}>
              <SumCard label="ARTICLES" value={counts.total} sub={`${counts.refs} réfs`} />
              <SumCard label="BON ÉTAT" value={counts.ok} tint={colors.ok} sub="" />
              <SumCard label="USÉ" value={counts.worn} tint={colors.worn} sub="" />
              <SumCard
                label="À REMPLACER"
                value={counts.replace}
                tint={colors.replace}
                sub={counts.replace > 0 ? 'action requise' : 'OK'}
              />
            </View>

            {actionError ? (
              <View style={styles.errorBox}>
                <Icon name="alert" size={15} color="#8c3a2e" />
                <Text variant="small" weight="600" color="#8c3a2e">{actionError}</Text>
              </View>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <Chip on={cat === 'all'} onPress={() => setCat('all')} label="Tout" />
              {visibleCategories.map((c) => (
                <Chip
                  key={c['@id']}
                  on={cat === c['@id']}
                  onPress={() => setCat(c['@id'])}
                  label={c.name}
                  iconName={c.icon}
                />
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.segRow}
            >
              {STATE_FILTERS.map(([v, label]) => (
                <Pressable
                  key={v}
                  onPress={() => setStateFilter(v)}
                  style={[styles.seg, stateFilter === v && styles.segOn]}
                >
                  <Text variant="small" weight="700" color={stateFilter === v ? '#fff' : colors.ink2}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {categoriesShown.map((c) => {
              const items = filtered.filter((i) => i.category === c['@id']);
              if (!items.length) return null;
              return (
                <View key={c['@id']} style={{ marginTop: spacing.md }}>
                  <View style={styles.catHead}>
                    <Icon name={c.icon} size={16} color={colors.forest} />
                    <Text variant="h3" style={{ fontSize: 16 }}>{c.name}</Text>
                    <Text variant="mono" color={colors.ink3} style={{ marginLeft: 'auto' }}>
                      {items.length} réf.
                    </Text>
                  </View>
                  <Card>
                    {items.map((it, idx) => (
                      <Pressable
                        key={it.id}
                        onPress={() => openEdit(it)}
                        style={[
                          styles.row,
                          idx < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.line },
                        ]}
                      >
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text variant="body" weight="600" numberOfLines={1}>{it.name}</Text>
                          {it.location ? (
                            <View style={styles.locRow}>
                              <Icon name="pin" size={11} color={colors.ink3} />
                              <Text variant="small" color={colors.ink3} numberOfLines={1}>
                                {it.location}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Tag
                          label={STATE_TAG[it.state].label}
                          tone={STATE_TAG[it.state].tone}
                          withDot
                        />
                        <Text variant="body" weight="700" color={colors.ink2} style={styles.qty}>
                          {it.quantity}
                        </Text>
                      </Pressable>
                    ))}
                  </Card>
                </View>
              );
            })}

            {!filtered.length ? (
              <View style={styles.empty}>
                <Icon name="search" size={24} color={colors.ink3} />
                <Text variant="small" color={colors.ink3} style={{ marginTop: spacing.xs }}>
                  Aucun article ne correspond.
                </Text>
              </View>
            ) : null}
          </>
        )}
      </View>

      <InventoryItemModal
        open={modalOpen}
        initial={modalInitial}
        categories={categories.items}
        canDelete={isAdmin && modalInitial?.mode === 'edit'}
        onClose={closeModal}
        onSubmit={onSubmit}
        onRemove={onRemove}
      />
    </Screen>
  );
}

function SumCard({ label, value, sub, tint }: { label: string; value: number; sub: string; tint?: string }) {
  return (
    <View style={styles.sumCard}>
      <Text variant="mono" color={tint ?? colors.ink3} style={{ fontSize: 9.5 }}>{label}</Text>
      <Text variant="h3" style={{ fontSize: 22, marginTop: 2 }}>{value}</Text>
      {sub ? <Text variant="small" color={colors.ink3} style={{ fontSize: 11 }}>{sub}</Text> : null}
    </View>
  );
}

function Chip({ on, onPress, label, iconName }: { on: boolean; onPress: () => void; label: string; iconName?: React.ComponentProps<typeof Icon>['name'] }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      {iconName ? <Icon name={iconName} size={13} color={on ? '#fff' : colors.ink2} /> : null}
      <Text variant="small" weight="700" color={on ? '#fff' : colors.ink2}>{label}</Text>
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
  body: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  center: { padding: spacing.xl, alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  search: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, height: 38, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.card,
  },
  searchInput: { flex: 1, fontSize: 13.5, color: colors.ink, paddingVertical: 0 },
  summary: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  sumCard: {
    flex: 1, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1,
    borderColor: colors.line, backgroundColor: colors.card2,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    padding: spacing.sm, borderRadius: radii.md, backgroundColor: colors.replaceBg,
    marginBottom: spacing.sm,
  },
  chipsRow: { gap: spacing.xs, paddingVertical: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, height: 30, borderRadius: radii.pill,
    borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.card,
  },
  chipOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  segRow: { gap: 0, paddingVertical: 4 },
  seg: {
    paddingHorizontal: spacing.md, height: 30, borderRadius: radii.sm,
    alignItems: 'center', justifyContent: 'center', marginRight: 6,
    borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.card,
  },
  segOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  catHead: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginBottom: spacing.xs, marginTop: spacing.sm, paddingHorizontal: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  qty: { minWidth: 26, textAlign: 'right' },
  empty: { padding: spacing.xl, alignItems: 'center' },
});

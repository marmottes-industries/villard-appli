import { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { AxiosError } from 'axios';
import { Screen, Text, Card, Button } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import { useShopping } from '@/src/stores/shopping';
import { useCategories, type DisplayCategory } from '@/src/stores/categories';
import { useAuth } from '@/src/stores/auth';
import { ShoppingItemModal, type ModalInitial } from '@/src/components/shopping/ShoppingItemModal';
import type { ShoppingItem } from '@/src/api/shopping';

type CatFilter = 'all' | string;
type PurchaseFilter = 'all' | 'todo' | 'done';

const PURCHASE_FILTERS: [PurchaseFilter, string][] = [
  ['todo', 'À acheter'],
  ['done', 'Achetés'],
  ['all', 'Tous'],
];

export default function CoursesScreen() {
  const shopping = useShopping();
  const categories = useCategories();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;

  const [cat, setCat] = useState<CatFilter>('all');
  const [purchase, setPurchase] = useState<PurchaseFilter>('todo');
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<ModalInitial | null>(null);

  const initial =
    shopping.state === 'loading' || categories.state === 'loading'
      ? 'loading'
      : shopping.state === 'error' || categories.state === 'error'
        ? 'error'
        : 'ready';

  const counts = useMemo(() => {
    const items = shopping.items;
    const todo = items.filter((i) => !i.purchased);
    const done = items.filter((i) => i.purchased);
    return {
      refs: items.length,
      todoRefs: todo.length,
      todoQty: todo.reduce((s, i) => s + i.quantity, 0),
      doneRefs: done.length,
    };
  }, [shopping.items]);

  const filtered = useMemo<ShoppingItem[]>(() => {
    const q = query.trim().toLowerCase();
    return shopping.items
      .filter((i) =>
        (cat === 'all' || i.category === cat) &&
        (purchase === 'all'
          || (purchase === 'todo' && !i.purchased)
          || (purchase === 'done' && i.purchased)) &&
        (q === '' || i.name.toLowerCase().includes(q))
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  }, [shopping.items, cat, purchase, query]);

  const visibleCategories = useMemo<DisplayCategory[]>(() => {
    const used = new Set(shopping.items.map((i) => i.category));
    if (cat !== 'all') used.add(cat);
    return categories.items.filter((c) => used.has(c['@id']));
  }, [shopping.items, categories.items, cat]);

  const categoriesShown = cat === 'all'
    ? visibleCategories
    : visibleCategories.filter((c) => c['@id'] === cat);

  const todoInView = filtered.filter((i) => !i.purchased);
  const doneInView = filtered.filter((i) => i.purchased);

  function openNew() {
    setModalInitial({ mode: 'create', defaultCategory: cat !== 'all' ? cat : undefined });
    setModalOpen(true);
  }
  function openEdit(item: ShoppingItem) {
    setModalInitial({ mode: 'edit', item });
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setModalInitial(null);
  }

  async function togglePurchased(it: ShoppingItem) {
    setActionError(null);
    try {
      await shopping.patch(it.id, { purchased: !it.purchased });
    } catch (err) {
      setActionError(formatError(err));
    }
  }

  async function onSubmit(payload: {
    id: number | null; name: string; quantity: number; purchased: boolean; category: string;
  }) {
    setActionError(null);
    try {
      if (payload.id === null) await shopping.create(payload);
      else await shopping.update(payload.id, payload);
      closeModal();
    } catch (err) {
      setActionError(formatError(err));
    }
  }

  async function onRemove(id: number) {
    setActionError(null);
    try {
      await shopping.remove(id);
      closeModal();
    } catch (err) {
      setActionError(formatError(err));
    }
  }

  async function markAll() {
    if (!todoInView.length) return;
    setActionError(null);
    setBulkBusy(true);
    const results = await Promise.allSettled(
      todoInView.map((i) => shopping.patch(i.id, { purchased: true })),
    );
    setBulkBusy(false);
    if (results.some((r) => r.status === 'rejected')) {
      setActionError('Certains articles n’ont pas pu être mis à jour.');
    }
  }

  async function clearDone() {
    if (!doneInView.length) return;
    setActionError(null);
    setBulkBusy(true);
    const results = await Promise.allSettled(doneInView.map((i) => shopping.remove(i.id)));
    setBulkBusy(false);
    if (results.some((r) => r.status === 'rejected')) {
      setActionError('Certains articles n’ont pas pu être supprimés.');
    }
  }

  async function retry() {
    await Promise.all([shopping.fetchAll(), categories.fetchAll()]);
  }

  return (
    <Screen onRefresh={retry}>
      <View style={styles.head}>
        <Text variant="eyebrow">Liste & ravitaillement</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Courses</Text>
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
                {shopping.errorMessage ?? categories.errorMessage ?? 'Erreur de chargement.'}
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
              <SumCard label="À ACHETER" value={counts.todoRefs} sub={`${counts.todoQty} articles`} tint={colors.replace} />
              <SumCard label="ACHETÉS" value={counts.doneRefs} sub="cochés" tint={colors.ok} />
              <SumCard label="RÉFÉRENCES" value={counts.refs} sub="au total" />
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
              {PURCHASE_FILTERS.map(([v, label]) => (
                <Pressable
                  key={v}
                  onPress={() => setPurchase(v)}
                  style={[styles.seg, purchase === v && styles.segOn]}
                >
                  <Text variant="small" weight="700" color={purchase === v ? '#fff' : colors.ink2}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {(todoInView.length || doneInView.length) ? (
              <View style={styles.bulk}>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={markAll}
                  disabled={bulkBusy || !todoInView.length}
                  leftIcon={<Icon name="check" size={13} color={colors.ink} />}
                  title={`Tout cocher (${todoInView.length})`}
                />
                {isAdmin ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={clearDone}
                    disabled={bulkBusy || !doneInView.length}
                    leftIcon={<Icon name="trash" size={13} color={colors.replace} />}
                    title={`Retirer (${doneInView.length})`}
                  />
                ) : null}
              </View>
            ) : null}

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
                      <View
                        key={it.id}
                        style={[
                          styles.row,
                          idx < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.line },
                        ]}
                      >
                        <Pressable onPress={() => togglePurchased(it)} hitSlop={6}>
                          <View style={[styles.checkbox, it.purchased && styles.checkboxOn]}>
                            {it.purchased ? <Icon name="check" size={14} color="#fff" /> : null}
                          </View>
                        </Pressable>
                        <Pressable
                          onPress={() => openEdit(it)}
                          style={{ flex: 1, minWidth: 0 }}
                          hitSlop={4}
                        >
                          <Text
                            variant="body"
                            weight="600"
                            numberOfLines={1}
                            style={it.purchased ? styles.struck : null}
                            color={it.purchased ? colors.ink3 : colors.ink}
                          >
                            {it.name}
                          </Text>
                        </Pressable>
                        <Text variant="body" weight="700" color={colors.ink2}>
                          ×{it.quantity}
                        </Text>
                      </View>
                    ))}
                  </Card>
                </View>
              );
            })}

            {!filtered.length ? (
              <View style={styles.empty}>
                <Icon name="cart" size={24} color={colors.ink3} />
                <Text variant="small" color={colors.ink3} style={{ marginTop: spacing.xs }}>
                  {purchase === 'todo'
                    ? 'Plus rien à acheter, bravo !'
                    : purchase === 'done'
                      ? 'Aucun article coché.'
                      : 'Aucun article ne correspond.'}
                </Text>
              </View>
            ) : null}
          </>
        )}
      </View>

      <ShoppingItemModal
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
      <Text variant="small" color={colors.ink3} style={{ fontSize: 11 }}>{sub}</Text>
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
  bulk: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  catHead: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginBottom: spacing.xs, marginTop: spacing.sm, paddingHorizontal: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: radii.xs, borderWidth: 1.5,
    borderColor: colors.line3, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.card,
  },
  checkboxOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  struck: { textDecorationLine: 'line-through' },
  empty: { padding: spacing.xl, alignItems: 'center' },
});

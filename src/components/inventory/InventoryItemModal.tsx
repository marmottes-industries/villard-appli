import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, Card, Button } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import type { DisplayCategory } from '@/src/stores/categories';
import type { InventoryItem, InvState } from '@/src/api/inventory';

export type ModalInitial =
  | { mode: 'create'; defaultCategory?: string }
  | { mode: 'edit'; item: InventoryItem };

const STATE_OPTS: { value: InvState; label: string; tone: 'ok' | 'worn' | 'replace' }[] = [
  { value: 'ok', label: 'Bon état', tone: 'ok' },
  { value: 'worn', label: 'Usé', tone: 'worn' },
  { value: 'replace', label: 'À remplacer', tone: 'replace' },
];

type Props = {
  open: boolean;
  initial: ModalInitial | null;
  categories: DisplayCategory[];
  canDelete: boolean;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    id: number | null;
    name: string;
    quantity: number;
    state: InvState;
    location: string | null;
    note: string | null;
    category: string;
  }) => void;
  onRemove?: (id: number) => void;
};

export function InventoryItemModal({
  open,
  initial,
  categories,
  canDelete,
  submitting,
  errorMessage,
  onClose,
  onSubmit,
  onRemove,
}: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [state, setState] = useState<InvState>('ok');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');

  const mode = initial?.mode ?? 'create';
  const editingId = initial?.mode === 'edit' ? initial.item.id : null;

  useEffect(() => {
    if (!open || !initial) return;
    if (initial.mode === 'create') {
      setName('');
      setQuantity('1');
      setState('ok');
      setLocation('');
      setNote('');
      setCategory(initial.defaultCategory ?? categories[0]?.['@id'] ?? '');
    } else {
      const it = initial.item;
      setName(it.name);
      setQuantity(String(it.quantity));
      setState(it.state);
      setLocation(it.location ?? '');
      setNote(it.note ?? '');
      setCategory(it.category);
    }
  }, [open, initial, categories]);

  const localError = useMemo<string | null>(() => {
    if (!name.trim()) return 'Le nom est requis.';
    const q = Number(quantity);
    if (!Number.isFinite(q) || q < 0) return 'Quantité invalide.';
    if (!category) return 'Sélectionne une catégorie.';
    return null;
  }, [name, quantity, category]);

  function submit() {
    if (localError) return;
    onSubmit({
      id: editingId,
      name: name.trim(),
      quantity: Number(quantity),
      state,
      location: location.trim() || null,
      note: note.trim() || null,
      category,
    });
  }

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.headerBtn}>
            <Icon name="x" size={20} color={colors.ink2} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text variant="eyebrow">Inventaire</Text>
            <Text variant="h3" style={{ marginTop: 2 }}>
              {mode === 'create' ? 'Nouvel article' : "Modifier l'article"}
            </Text>
          </View>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="eyebrow" style={styles.sectionLabel}>Nom</Text>
          <Card>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Drap housse, casserole…"
              placeholderTextColor={colors.ink4}
              style={styles.input}
            />
          </Card>

          <Text variant="eyebrow" style={styles.sectionLabel}>Catégorie</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {categories.map((c) => {
              const on = c['@id'] === category;
              return (
                <Pressable
                  key={c['@id']}
                  onPress={() => setCategory(c['@id'])}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Icon name={c.icon} size={14} color={on ? '#fff' : colors.ink2} />
                  <Text variant="small" weight="600" color={on ? '#fff' : colors.ink2}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text variant="eyebrow" style={styles.sectionLabel}>Quantité</Text>
          <Card>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => setQuantity((q) => String(Math.max(0, Number(q) - 1)))}
                style={styles.qtyBtn}
                hitSlop={6}
              >
                <Icon name="minus" size={16} color={colors.ink2} />
              </Pressable>
              <TextInput
                value={quantity}
                onChangeText={(v) => setQuantity(v.replace(/[^\d]/g, ''))}
                keyboardType="number-pad"
                style={styles.qtyInput}
              />
              <Pressable
                onPress={() => setQuantity((q) => String((Number(q) || 0) + 1))}
                style={styles.qtyBtn}
                hitSlop={6}
              >
                <Icon name="plus" size={16} color={colors.ink2} />
              </Pressable>
            </View>
          </Card>

          <Text variant="eyebrow" style={styles.sectionLabel}>État</Text>
          <View style={styles.stateRow}>
            {STATE_OPTS.map((s) => {
              const on = s.value === state;
              const tone =
                s.tone === 'ok' ? colors.ok : s.tone === 'worn' ? colors.worn : colors.replace;
              const toneBg =
                s.tone === 'ok' ? colors.okBg : s.tone === 'worn' ? colors.wornBg : colors.replaceBg;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => setState(s.value)}
                  style={[
                    styles.stateOpt,
                    on && { borderColor: tone, backgroundColor: toneBg },
                  ]}
                >
                  <View style={[styles.stateDot, { backgroundColor: tone }]} />
                  <Text variant="small" weight="700" color={on ? tone : colors.ink2}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text variant="eyebrow" style={styles.sectionLabel}>Emplacement</Text>
          <Card>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Placard cuisine, salle de bain…"
              placeholderTextColor={colors.ink4}
              style={styles.input}
            />
          </Card>

          <Text variant="eyebrow" style={styles.sectionLabel}>Note</Text>
          <Card>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Précisions…"
              placeholderTextColor={colors.ink4}
              multiline
              style={[styles.input, { minHeight: 80 }]}
            />
          </Card>

          {(errorMessage || localError) ? (
            <View style={styles.errorBox}>
              <Icon name="alert" size={15} color="#8c3a2e" />
              <Text variant="small" weight="600" color="#8c3a2e" style={{ flex: 1 }}>
                {errorMessage ?? localError}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button
              variant="primary"
              fullWidth
              onPress={submit}
              disabled={!!localError || submitting}
              leftIcon={
                submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Icon name="check" size={17} color="#fff" />
                )
              }
              title={mode === 'create' ? 'Ajouter' : 'Enregistrer'}
            />
            {mode === 'edit' && canDelete && onRemove && editingId !== null ? (
              <Pressable
                onPress={() => onRemove(editingId)}
                disabled={submitting}
                style={styles.deleteBtn}
                hitSlop={6}
              >
                <Icon name="trash" size={16} color={colors.replace} />
                <Text variant="small" weight="700" color={colors.replace}>Supprimer cet article</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, alignItems: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.xs, paddingHorizontal: 6 },
  input: { padding: spacing.lg, fontSize: 14, color: colors.ink, textAlignVertical: 'top' },
  chipsRow: { gap: spacing.xs, paddingVertical: 4, paddingHorizontal: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line2,
    backgroundColor: colors.card,
  },
  chipOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  qtyRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm },
  qtyBtn: {
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.card,
  },
  qtyInput: {
    flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.ink,
    paddingVertical: spacing.xs,
  },
  stateRow: { flexDirection: 'row', gap: spacing.xs },
  stateOpt: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.xs,
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.card,
  },
  stateDot: { width: 8, height: 8, borderRadius: 999 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    padding: spacing.sm, borderRadius: radii.md,
    backgroundColor: colors.replaceBg, marginTop: spacing.md,
  },
  actions: { marginTop: spacing.xl, gap: spacing.md },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: spacing.sm,
  },
});

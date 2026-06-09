import { useEffect, useMemo, useState } from 'react';
import {
  Modal, View, ScrollView, StyleSheet, Pressable, TextInput,
  Platform, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { Text, Card, Button } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import type { DisplayCategory } from '@/src/stores/categories';
import type { ShoppingItem } from '@/src/api/shopping';

export type ModalInitial =
  | { mode: 'create'; defaultCategory?: string }
  | { mode: 'edit'; item: ShoppingItem };

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
    purchased: boolean;
    category: string;
  }) => void;
  onRemove?: (id: number) => void;
};

export function ShoppingItemModal({
  open, initial, categories, canDelete, submitting, errorMessage,
  onClose, onSubmit, onRemove,
}: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [purchased, setPurchased] = useState(false);
  const [category, setCategory] = useState('');

  const mode = initial?.mode ?? 'create';
  const editingId = initial?.mode === 'edit' ? initial.item.id : null;

  useEffect(() => {
    if (!open || !initial) return;
    if (initial.mode === 'create') {
      setName('');
      setQuantity('1');
      setPurchased(false);
      setCategory(initial.defaultCategory ?? categories[0]?.['@id'] ?? '');
    } else {
      const it = initial.item;
      setName(it.name);
      setQuantity(String(it.quantity));
      setPurchased(it.purchased);
      setCategory(it.category);
    }
  }, [open, initial, categories]);

  const localError = useMemo<string | null>(() => {
    if (!name.trim()) return 'Le nom est requis.';
    const q = Number(quantity);
    if (!Number.isFinite(q) || q < 1) return 'Quantité invalide.';
    if (!category) return 'Sélectionne une catégorie.';
    return null;
  }, [name, quantity, category]);

  function submit() {
    if (localError) return;
    onSubmit({
      id: editingId,
      name: name.trim(),
      quantity: Number(quantity),
      purchased,
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
            <Text variant="eyebrow">Courses</Text>
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
              placeholder="Pâtes, papier toilette…"
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
                onPress={() => setQuantity((q) => String(Math.max(1, Number(q) - 1)))}
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

          <Pressable onPress={() => setPurchased((v) => !v)} style={styles.checkRow}>
            <View style={[styles.checkbox, purchased && styles.checkboxOn]}>
              {purchased ? <Icon name="check" size={14} color="#fff" /> : null}
            </View>
            <Text variant="body" weight="600">Déjà acheté</Text>
          </Pressable>

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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, alignItems: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.xs, paddingHorizontal: 6 },
  input: { padding: spacing.lg, fontSize: 14, color: colors.ink },
  chipsRow: { gap: spacing.xs, paddingVertical: 4, paddingHorizontal: 2 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.md, height: 34, borderRadius: radii.pill,
    borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.card,
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
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.lg, padding: spacing.md, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.card,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: radii.xs, borderWidth: 1.5,
    borderColor: colors.line3, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.card,
  },
  checkboxOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    padding: spacing.sm, borderRadius: radii.md, backgroundColor: colors.replaceBg,
    marginTop: spacing.md,
  },
  actions: { marginTop: spacing.xl, gap: spacing.md },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: spacing.sm,
  },
});

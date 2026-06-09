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
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Text, Card, Button } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import { fmtISO, parseISO } from '@/src/lib/dates';
import type {
  Work,
  WorkPriority,
  WorkStatus,
  WorkType,
} from '@/src/api/work';
import {
  PRIORITY_META,
  PRIORITY_OPTIONS,
  STATUS_META,
  STATUS_OPTIONS,
  TYPE_META,
  TYPE_OPTIONS,
} from '@/src/lib/workMeta';

export type ModalInitial =
  | { mode: 'create' }
  | { mode: 'edit'; work: Work };

export type WorkSavePayload = {
  id: number | null;
  title: string;
  description: string | null;
  status: WorkStatus;
  type: WorkType | null;
  priority: WorkPriority | null;
  scheduledFor: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
};

type Props = {
  open: boolean;
  initial: ModalInitial | null;
  canDelete: boolean;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: WorkSavePayload) => void;
  onRemove?: (id: number) => void;
};

function normalizeCost(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed);
}

export function WorkModal({
  open,
  initial,
  canDelete,
  submitting,
  errorMessage,
  onClose,
  onSubmit,
  onRemove,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkStatus>('suggested');
  const [type, setType] = useState<WorkType | null>(null);
  const [priority, setPriority] = useState<WorkPriority | null>(null);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<string>('');
  const [actualCost, setActualCost] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);

  const mode = initial?.mode ?? 'create';
  const editingId = initial?.mode === 'edit' ? initial.work.id : null;

  useEffect(() => {
    if (!open || !initial) return;
    if (initial.mode === 'edit') {
      const w = initial.work;
      setTitle(w.title);
      setDescription(w.description ?? '');
      setStatus(w.status);
      setType(w.type);
      setPriority(w.priority);
      setScheduledFor(w.scheduledFor ? parseISO(w.scheduledFor) : null);
      setEstimatedCost(w.estimatedCost !== null && w.estimatedCost !== undefined ? String(w.estimatedCost) : '');
      setActualCost(w.actualCost !== null && w.actualCost !== undefined ? String(w.actualCost) : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('suggested');
      setType(null);
      setPriority(null);
      setScheduledFor(null);
      setEstimatedCost('');
      setActualCost('');
    }
    setShowPicker(false);
  }, [open, initial]);

  const localError = useMemo<string | null>(() => {
    if (!title.trim()) return 'Renseigne un titre.';
    return null;
  }, [title]);

  function pickDate(_: DateTimePickerEvent, d?: Date) {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (!d) return;
    setScheduledFor(d);
  }

  function submit() {
    if (localError) return;
    onSubmit({
      id: editingId,
      title: title.trim(),
      description: description.trim() || null,
      status,
      type,
      priority,
      scheduledFor: scheduledFor ? fmtISO(scheduledFor) : null,
      estimatedCost: normalizeCost(estimatedCost),
      actualCost: normalizeCost(actualCost),
    });
  }

  function remove() {
    if (editingId == null || !onRemove) return;
    onRemove(editingId);
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
            <Text variant="eyebrow">Travaux</Text>
            <Text variant="h3" style={{ marginTop: 2 }}>
              {mode === 'create' ? 'Nouveau travail' : 'Modifier le travail'}
            </Text>
          </View>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="eyebrow" style={styles.sectionLabel}>Titre</Text>
          <Card>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. Repeindre les volets…"
              placeholderTextColor={colors.ink4}
              maxLength={255}
              style={styles.input}
            />
          </Card>

          <Text variant="eyebrow" style={styles.sectionLabel}>Description</Text>
          <Card>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Détails, matériel, fournisseur envisagé…"
              placeholderTextColor={colors.ink4}
              multiline
              style={[styles.input, { minHeight: 110 }]}
            />
          </Card>

          <Text variant="eyebrow" style={styles.sectionLabel}>Statut</Text>
          <View style={styles.chipsRow}>
            {STATUS_OPTIONS.map((s) => {
              const meta = STATUS_META[s];
              const on = status === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[
                    styles.chip,
                    on && { backgroundColor: meta.bg, borderColor: meta.border },
                  ]}
                >
                  <Text
                    variant="small"
                    weight="700"
                    color={on ? meta.fg : colors.ink2}
                    style={{ fontSize: 12 }}
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.grid2}>
            <View style={{ flex: 1 }}>
              <Text variant="eyebrow" style={styles.sectionLabel}>Type</Text>
              <View style={styles.chipsRow}>
                {TYPE_OPTIONS.map((t) => {
                  const meta = TYPE_META[t];
                  const on = type === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setType(on ? null : t)}
                      style={[styles.chip, on && { backgroundColor: colors.sageBg, borderColor: colors.forest }]}
                    >
                      <Icon name={meta.icon} size={12} color={on ? colors.forest : colors.ink2} />
                      <Text
                        variant="small"
                        weight="700"
                        color={on ? colors.forest : colors.ink2}
                        style={{ fontSize: 12 }}
                      >
                        {meta.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="eyebrow" style={styles.sectionLabel}>Priorité</Text>
              <View style={styles.chipsRow}>
                {PRIORITY_OPTIONS.map((p) => {
                  const meta = PRIORITY_META[p];
                  const on = priority === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setPriority(on ? null : p)}
                      style={[styles.chip, on && { backgroundColor: meta.bg, borderColor: meta.fg }]}
                    >
                      <Text
                        variant="small"
                        weight="700"
                        color={on ? meta.fg : colors.ink2}
                        style={{ fontSize: 12 }}
                      >
                        {meta.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <Text variant="eyebrow" style={styles.sectionLabel}>Date prévue</Text>
          <Card>
            <Pressable
              onPress={() => setShowPicker((s) => !s)}
              style={styles.dateRow}
            >
              <Text variant="label">{scheduledFor ? 'Programmé' : 'Pas encore défini'}</Text>
              <View style={styles.dateValue}>
                <Text variant="body" weight={showPicker ? '700' : '500'} color={showPicker ? colors.forest : colors.ink}>
                  {scheduledFor
                    ? scheduledFor.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : 'Choisir une date'}
                </Text>
                <Icon name="calendar" size={17} color={colors.ink3} />
              </View>
            </Pressable>
            {Platform.OS === 'ios' && showPicker ? (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  mode="date"
                  display="inline"
                  value={scheduledFor ?? new Date()}
                  onChange={pickDate}
                  locale="fr-FR"
                  accentColor={colors.forest}
                />
              </View>
            ) : null}
            {scheduledFor ? (
              <Pressable
                onPress={() => { setScheduledFor(null); setShowPicker(false); }}
                style={styles.clearRow}
              >
                <Icon name="x" size={13} color={colors.ink3} />
                <Text variant="small" color={colors.ink3}>Effacer la date</Text>
              </Pressable>
            ) : null}
          </Card>
          {Platform.OS === 'android' && showPicker ? (
            <DateTimePicker
              mode="date"
              value={scheduledFor ?? new Date()}
              onChange={pickDate}
            />
          ) : null}

          <View style={styles.grid2}>
            <View style={{ flex: 1 }}>
              <Text variant="eyebrow" style={styles.sectionLabel}>Coût estimé (€)</Text>
              <Card>
                <TextInput
                  value={estimatedCost}
                  onChangeText={setEstimatedCost}
                  placeholder="0"
                  placeholderTextColor={colors.ink4}
                  inputMode="numeric"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </Card>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="eyebrow" style={styles.sectionLabel}>Coût réel (€)</Text>
              <Card>
                <TextInput
                  value={actualCost}
                  onChangeText={setActualCost}
                  placeholder="0"
                  placeholderTextColor={colors.ink4}
                  inputMode="numeric"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </Card>
            </View>
          </View>

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

            {mode === 'edit' && canDelete && onRemove ? (
              <Pressable
                onPress={remove}
                disabled={submitting}
                style={styles.deleteBtn}
                hitSlop={6}
              >
                <Icon name="trash" size={16} color={colors.replace} />
                <Text variant="small" weight="700" color={colors.replace}>Supprimer le travail</Text>
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
    backgroundColor: colors.paper,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, alignItems: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xxs },
  sectionLabel: { marginTop: spacing.md, marginBottom: spacing.xs, paddingHorizontal: 6 },
  input: {
    padding: spacing.lg,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line2,
    backgroundColor: colors.card,
  },
  grid2: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dateValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pickerWrap: { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.replaceBg,
    marginTop: spacing.md,
  },
  actions: { marginTop: spacing.xl, gap: spacing.md },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
});

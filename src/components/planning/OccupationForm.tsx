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
import { Text, Card, Button, Avatar } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import { fmtISO, parseISO, addDays } from '@/src/lib/dates';
import type { DisplayUser } from '@/src/lib/occupants';
import type { Occupation } from '@/src/api/occupations';

export type FormMode = 'create' | 'edit';

export type FormInitial =
  | { mode: 'create'; startDate: string; endDate: string; occupantIri: string }
  | { mode: 'edit'; occupation: Occupation };

type Props = {
  open: boolean;
  initial: FormInitial | null;
  occupants: DisplayUser[];
  currentUserIri: string | null;
  canChangeOccupant: boolean;
  canDelete: boolean;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    id: number | null;
    startDate: string;
    endDate: string;
    notes: string;
    occupant: string;
  }) => void;
  onRemove?: (id: number) => void;
};

export function OccupationForm({
  open,
  initial,
  occupants,
  currentUserIri,
  canChangeOccupant,
  canDelete,
  submitting,
  errorMessage,
  onClose,
  onSubmit,
  onRemove,
}: Props) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [occupantIri, setOccupantIri] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showPicker, setShowPicker] = useState<null | 'start' | 'end'>(null);

  const mode: FormMode = initial?.mode ?? 'create';
  const editingId = initial?.mode === 'edit' ? initial.occupation.id : null;

  useEffect(() => {
    if (!open || !initial) return;
    if (initial.mode === 'create') {
      setStartDate(parseISO(initial.startDate));
      setEndDate(parseISO(initial.endDate));
      setOccupantIri(initial.occupantIri || currentUserIri || occupants[0]?.iri || '');
      setNotes('');
    } else {
      setStartDate(parseISO(initial.occupation.startDate));
      setEndDate(parseISO(initial.occupation.endDate));
      setOccupantIri(initial.occupation.occupant);
      setNotes(initial.occupation.notes ?? '');
    }
    setShowPicker(null);
  }, [open, initial, currentUserIri, occupants]);

  const localError = useMemo<string | null>(() => {
    if (endDate.getTime() <= startDate.getTime()) {
      return "Le départ doit être après l'arrivée.";
    }
    if (!occupantIri) return 'Sélectionne un occupant.';
    return null;
  }, [startDate, endDate, occupantIri]);

  function pickStart(_: DateTimePickerEvent, d?: Date) {
    if (Platform.OS !== 'ios') setShowPicker(null);
    if (!d) return;
    setStartDate(d);
    if (d.getTime() >= endDate.getTime()) {
      setEndDate(addDays(d, 1));
    }
  }

  function pickEnd(_: DateTimePickerEvent, d?: Date) {
    if (Platform.OS !== 'ios') setShowPicker(null);
    if (!d) return;
    setEndDate(d);
  }

  function submit() {
    if (localError) return;
    onSubmit({
      id: editingId,
      startDate: fmtISO(startDate),
      endDate: fmtISO(endDate),
      notes: notes.trim(),
      occupant: occupantIri,
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
            <Text variant="eyebrow">Planning</Text>
            <Text variant="h3" style={{ marginTop: 2 }}>
              {mode === 'create' ? 'Nouveau séjour' : 'Modifier le séjour'}
            </Text>
          </View>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="eyebrow" style={styles.sectionLabel}>Qui occupe ?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.occupantsRow}
          >
            {occupants.map((o) => {
              const selected = o.iri === occupantIri;
              const disabled = !canChangeOccupant && o.iri !== currentUserIri && !selected;
              return (
                <Pressable
                  key={o.iri}
                  onPress={() => !disabled && setOccupantIri(o.iri)}
                  style={[
                    styles.occupantOpt,
                    selected && { borderColor: o.color, backgroundColor: o.bg },
                    disabled && { opacity: 0.4 },
                  ]}
                  disabled={disabled}
                >
                  <Avatar initials={o.short} color={o.color} size={42} />
                  <Text
                    variant="small"
                    weight="600"
                    color={selected ? o.color : colors.ink2}
                    numberOfLines={1}
                  >
                    {o.username}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text variant="eyebrow" style={styles.sectionLabel}>Dates</Text>
          <Card>
            <DateRow
              label="Arrivée"
              value={startDate}
              onPress={() => setShowPicker((s) => (s === 'start' ? null : 'start'))}
              active={showPicker === 'start'}
            />
            {Platform.OS === 'ios' && showPicker === 'start' ? (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  mode="date"
                  display="inline"
                  value={startDate}
                  onChange={pickStart}
                  locale="fr-FR"
                  accentColor={colors.forest}
                />
              </View>
            ) : null}
            <View style={styles.sep} />
            <DateRow
              label="Départ"
              value={endDate}
              onPress={() => setShowPicker((s) => (s === 'end' ? null : 'end'))}
              active={showPicker === 'end'}
            />
            {Platform.OS === 'ios' && showPicker === 'end' ? (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  mode="date"
                  display="inline"
                  value={endDate}
                  minimumDate={addDays(startDate, 1)}
                  onChange={pickEnd}
                  locale="fr-FR"
                  accentColor={colors.forest}
                />
              </View>
            ) : null}
          </Card>
          {Platform.OS === 'android' && showPicker === 'start' ? (
            <DateTimePicker mode="date" value={startDate} onChange={pickStart} />
          ) : null}
          {Platform.OS === 'android' && showPicker === 'end' ? (
            <DateTimePicker
              mode="date"
              value={endDate}
              minimumDate={addDays(startDate, 1)}
              onChange={pickEnd}
            />
          ) : null}

          <Text variant="eyebrow" style={styles.sectionLabel}>Note</Text>
          <Card>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Motif, infos pratiques…"
              placeholderTextColor={colors.ink4}
              multiline
              style={styles.input}
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
              title={mode === 'create' ? 'Réserver' : 'Enregistrer'}
            />

            {mode === 'edit' && canDelete && onRemove ? (
              <Pressable
                onPress={remove}
                disabled={submitting}
                style={styles.deleteBtn}
                hitSlop={6}
              >
                <Icon name="trash" size={16} color={colors.replace} />
                <Text variant="small" weight="700" color={colors.replace}>Supprimer ce séjour</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function DateRow({
  label,
  value,
  onPress,
  active,
}: {
  label: string;
  value: Date;
  onPress: () => void;
  active: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.dateRow}>
      <Text variant="label">{label}</Text>
      <View style={styles.dateValue}>
        <Text variant="body" weight={active ? '700' : '500'} color={active ? colors.forest : colors.ink}>
          {value.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
        <Icon name="calendar" size={17} color={colors.ink3} />
      </View>
    </Pressable>
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
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xs },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.xs, paddingHorizontal: 6 },
  occupantsRow: { gap: spacing.sm, paddingHorizontal: 2, paddingVertical: 4 },
  occupantOpt: {
    width: 88,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dateValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sep: { height: 1, backgroundColor: colors.line, marginHorizontal: spacing.lg },
  pickerWrap: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  input: {
    minHeight: 90,
    padding: spacing.lg,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
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

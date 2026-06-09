import { useEffect, useMemo, useState } from 'react';
import {
  Modal, View, ScrollView, StyleSheet, Pressable, TextInput,
  Platform, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { Text, Card, Button } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import type { Note } from '@/src/api/notes';

export type ModalInitial =
  | { mode: 'create' }
  | { mode: 'edit'; note: Note };

type Props = {
  open: boolean;
  initial: ModalInitial | null;
  canDelete: boolean;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: { id: number | null; title: string; content: string }) => void;
  onRemove?: (id: number) => void;
};

export function NoteModal({
  open, initial, canDelete, submitting, errorMessage,
  onClose, onSubmit, onRemove,
}: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const mode = initial?.mode ?? 'create';
  const editingId = initial?.mode === 'edit' ? initial.note.id : null;

  useEffect(() => {
    if (!open || !initial) return;
    if (initial.mode === 'create') {
      setTitle('');
      setContent('');
    } else {
      setTitle(initial.note.title);
      setContent(initial.note.content);
    }
  }, [open, initial]);

  const localError = useMemo<string | null>(() => {
    if (!title.trim()) return 'Le titre est requis.';
    if (!content.trim()) return 'Le contenu est requis.';
    return null;
  }, [title, content]);

  function submit() {
    if (localError) return;
    onSubmit({ id: editingId, title: title.trim(), content: content.trim() });
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
            <Text variant="eyebrow">Notes</Text>
            <Text variant="h3" style={{ marginTop: 2 }}>
              {mode === 'create' ? 'Nouvelle note' : 'Modifier la note'}
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
              placeholder="WiFi, codes, recommandations…"
              placeholderTextColor={colors.ink4}
              style={styles.input}
            />
          </Card>

          <Text variant="eyebrow" style={styles.sectionLabel}>Contenu</Text>
          <Card>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Détails de la note…"
              placeholderTextColor={colors.ink4}
              multiline
              style={[styles.input, { minHeight: 180 }]}
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
              title={mode === 'create' ? 'Publier' : 'Enregistrer'}
            />
            {mode === 'edit' && canDelete && onRemove && editingId !== null ? (
              <Pressable
                onPress={() => onRemove(editingId)}
                disabled={submitting}
                style={styles.deleteBtn}
                hitSlop={6}
              >
                <Icon name="trash" size={16} color={colors.replace} />
                <Text variant="small" weight="700" color={colors.replace}>Supprimer la note</Text>
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
  input: { padding: spacing.lg, fontSize: 14, color: colors.ink, textAlignVertical: 'top' },
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

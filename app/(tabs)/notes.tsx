import { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { AxiosError } from 'axios';
import { Screen, Text, Card, Button, Avatar } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import { useNotes } from '@/src/stores/notes';
import { useUsers } from '@/src/stores/users';
import { useAuth } from '@/src/stores/auth';
import { resolveUser } from '@/src/lib/occupants';
import { NoteModal, type ModalInitial } from '@/src/components/notes/NoteModal';
import type { Note } from '@/src/api/notes';

export default function NotesScreen() {
  const notes = useNotes();
  const users = useUsers();
  const { user } = useAuth();

  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;
  const currentUserIri = useMemo(() => {
    if (!user?.uuid) return null;
    return users.items.find((u) => u.uuid === user.uuid)?.iri ?? null;
  }, [users.items, user?.uuid]);

  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<ModalInitial | null>(null);

  const initial =
    notes.state === 'loading' || users.state === 'loading'
      ? 'loading'
      : notes.state === 'error' || users.state === 'error'
        ? 'error'
        : 'ready';

  const sorted = useMemo<Note[]>(() => {
    return [...notes.items].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return db - da;
    });
  }, [notes.items]);

  const filtered = useMemo<Note[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((n) => `${n.title} ${n.content}`.toLowerCase().includes(q));
  }, [sorted, query]);

  function canEdit(n: Note): boolean {
    if (isAdmin) return true;
    return currentUserIri !== null && n.author === currentUserIri;
  }

  function openNew() {
    setModalInitial({ mode: 'create' });
    setModalOpen(true);
  }
  function openEdit(n: Note) {
    setModalInitial({ mode: 'edit', note: n });
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setModalInitial(null);
  }

  async function onSubmit(payload: { id: number | null; title: string; content: string }) {
    setActionError(null);
    try {
      if (payload.id === null) await notes.create(payload);
      else await notes.update(payload.id, payload);
      closeModal();
    } catch (err) {
      setActionError(formatError(err));
    }
  }

  async function onRemove(id: number) {
    setActionError(null);
    try {
      await notes.remove(id);
      closeModal();
    } catch (err) {
      setActionError(formatError(err));
    }
  }

  async function retry() {
    await Promise.all([notes.fetchAll(), users.fetchAll()]);
  }

  const canDeleteCurrent =
    modalInitial?.mode === 'edit' ? canEdit(modalInitial.note) : false;

  return (
    <Screen onRefresh={retry}>
      <View style={styles.head}>
        <Text variant="eyebrow">Le chalet</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Notes</Text>
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
                {notes.errorMessage ?? users.errorMessage ?? 'Erreur de chargement.'}
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

            {actionError ? (
              <View style={styles.errorBox}>
                <Icon name="alert" size={15} color="#8c3a2e" />
                <Text variant="small" weight="600" color="#8c3a2e">{actionError}</Text>
              </View>
            ) : null}

            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Icon name="note" size={26} color={colors.ink3} />
                <Text variant="small" color={colors.ink3} style={{ marginTop: spacing.xs, textAlign: 'center' }}>
                  {query
                    ? `Aucune note ne correspond à « ${query} ».`
                    : 'Aucune note pour le moment. Ajoute la première !'}
                </Text>
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {filtered.map((n) => {
                  const author = resolveUser(users.items, n.author);
                  const editable = canEdit(n);
                  const date = new Date(n.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  });
                  return (
                    <Pressable
                      key={n.id}
                      onPress={() => editable && openEdit(n)}
                      disabled={!editable}
                    >
                      <Card>
                        <View style={styles.noteBody}>
                          <View style={styles.noteHead}>
                            <Avatar initials={author.short} color={author.color} size={28} />
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text variant="body" weight="700" numberOfLines={1}>{n.title}</Text>
                              <Text variant="small" color={colors.ink3} numberOfLines={1}>
                                {author.username} · {date}
                              </Text>
                            </View>
                            {editable ? (
                              <Icon name="edit" size={15} color={colors.ink3} />
                            ) : null}
                          </View>
                          <Text variant="small" color={colors.ink2} style={{ marginTop: spacing.xs }}>
                            {n.content}
                          </Text>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>

      <NoteModal
        open={modalOpen}
        initial={modalInitial}
        canDelete={canDeleteCurrent}
        onClose={closeModal}
        onSubmit={onSubmit}
        onRemove={onRemove}
      />
    </Screen>
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
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    padding: spacing.sm, borderRadius: radii.md, backgroundColor: colors.replaceBg,
    marginBottom: spacing.sm,
  },
  noteBody: { padding: spacing.md },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  empty: { padding: spacing.xxl, alignItems: 'center' },
});

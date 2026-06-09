import { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Card, Text, Avatar } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import type { Work } from '@/src/api/work';
import type { DisplayUser } from '@/src/lib/occupants';
import { STATUS_META, TYPE_META, PRIORITY_META } from '@/src/lib/workMeta';

type Props = {
  work: Work;
  author: DisplayUser;
  canEdit: boolean;
  onEdit: (work: Work) => void;
};

function formatDate(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCost(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return `${value} €`;
}

export function WorkCard({ work, author, canEdit, onEdit }: Props) {
  const status = STATUS_META[work.status];
  const type = work.type ? TYPE_META[work.type] : null;
  const priority = work.priority ? PRIORITY_META[work.priority] : null;

  const scheduledLabel = useMemo(() => formatDate(work.scheduledFor), [work.scheduledFor]);
  const completedLabel = useMemo(() => formatDate(work.completedAt), [work.completedAt]);
  const createdLabel = useMemo(() => formatDate(work.createdAt), [work.createdAt]);

  const estimated = formatCost(work.estimatedCost);
  const actual = formatCost(work.actualCost);
  const hasDetails = !!scheduledLabel || !!completedLabel || estimated !== null || actual !== null;

  const dimmed = work.status === 'done' || work.status === 'cancelled';

  return (
    <Pressable onPress={() => canEdit && onEdit(work)} disabled={!canEdit}>
      <Card style={[styles.card, { borderLeftWidth: 3, borderLeftColor: status.border }, dimmed && { opacity: 0.78 }]}>
        <View style={styles.inner}>
          <View style={styles.head}>
            <Avatar initials={author.short} color={author.color} size={32} />
            <View style={styles.meta}>
              <Text variant="body" weight="700" numberOfLines={2}>{work.title}</Text>
              <Text variant="small" color={colors.ink3} numberOfLines={1}>
                {author.username} · {createdLabel}
              </Text>
            </View>
            {canEdit ? (
              <Icon name="edit" size={15} color={colors.ink3} />
            ) : null}
          </View>

          {work.description ? (
            <Text variant="small" color={colors.ink2} style={styles.desc}>
              {work.description}
            </Text>
          ) : null}

          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: status.bg }]}>
              <View style={[styles.dot, { backgroundColor: status.fg }]} />
              <Text variant="small" weight="700" color={status.fg} style={styles.tagText}>
                {status.label}
              </Text>
            </View>
            {priority ? (
              <View style={[styles.tag, { backgroundColor: priority.bg }]}>
                <Text variant="small" weight="700" color={priority.fg} style={styles.tagText}>
                  Priorité {priority.label.toLowerCase()}
                </Text>
              </View>
            ) : null}
            {type ? (
              <View style={[styles.tag, { backgroundColor: colors.card3, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <Icon name={type.icon} size={11} color={colors.ink2} />
                <Text variant="small" weight="700" color={colors.ink2} style={styles.tagText}>
                  {type.label}
                </Text>
              </View>
            ) : null}
          </View>

          {hasDetails ? (
            <View style={styles.details}>
              {scheduledLabel ? (
                <Row icon="calendar" label="Prévu" value={scheduledLabel} />
              ) : null}
              {completedLabel ? (
                <Row icon="check" label="Terminé" value={completedLabel} />
              ) : null}
              {(estimated || actual) ? (
                <View style={styles.row}>
                  <Text variant="small" color={colors.ink3}>Coût</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                    {actual ? (
                      <Text variant="small" weight="700" color={colors.ink2}>{actual}</Text>
                    ) : estimated ? (
                      <Text variant="small" weight="700" color={colors.ink3}>~ {estimated}</Text>
                    ) : null}
                    {actual && estimated ? (
                      <Text variant="small" color={colors.ink3}>(est. {estimated})</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

function Row({ icon, label, value }: { icon: 'calendar' | 'check'; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Icon name={icon} size={12} color={colors.ink3} />
        <Text variant="small" color={colors.ink3}>{label}</Text>
      </View>
      <Text variant="small" weight="700" color={colors.ink2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg },
  inner: { padding: spacing.md, gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { flex: 1, minWidth: 0 },
  desc: { lineHeight: 19 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radii.pill, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tagText: { fontSize: 11.5 },
  dot: { width: 6, height: 6, borderRadius: 999 },
  details: { gap: 4, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});

import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Tag } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing } from '@/src/theme';

export default function TravauxScreen() {
  return (
    <Screen>
      <View style={styles.head}>
        <Text variant="eyebrow">Le chalet</Text>
        <Text variant="h1" style={{ marginTop: spacing.xxs }}>Travaux</Text>
      </View>
      <View style={styles.body}>
        <Card>
          <View style={styles.box}>
            <View style={styles.iconWrap}>
              <Icon name="tools" size={32} color={colors.forest} />
            </View>
            <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
              <Tag label="Coming soon" tone="worn" withDot />
            </View>
            <Text variant="h2" style={styles.title}>
              Bientôt disponible
            </Text>
            <Text variant="small" color={colors.ink2} style={styles.lead}>
              Le suivi des travaux et entretiens du logement arrive prochainement&nbsp;:
              chantiers en cours, interventions des artisans, devis et factures liés au chalet.
            </Text>

            <View style={styles.bullets}>
              <Bullet label="Planifier interventions et devis" />
              <Bullet label="Journal d'entretien (chaudière, toiture…)" />
              <Bullet label="Photos avant/après et garanties" />
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

function Bullet({ label }: { label: string }) {
  return (
    <View style={styles.bullet}>
      <View style={styles.dot} />
      <Text variant="small" color={colors.ink2} style={{ flex: 1 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  body: { paddingHorizontal: spacing.lg },
  box: { padding: spacing.xl, alignItems: 'center' },
  iconWrap: {
    width: 72, height: 72, borderRadius: 999,
    backgroundColor: colors.sageBg, alignItems: 'center', justifyContent: 'center',
  },
  title: { marginTop: spacing.md, textAlign: 'center' },
  lead: { marginTop: spacing.xs, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.sm },
  bullets: { marginTop: spacing.lg, alignSelf: 'stretch', gap: spacing.sm },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 5, height: 5, borderRadius: 999, backgroundColor: colors.forest },
});

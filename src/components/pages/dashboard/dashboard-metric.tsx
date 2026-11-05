import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function DashboardMetric({ label, value, detail, featured = false, alert = false }: {
  label: string; value: string; detail: string; featured?: boolean; alert?: boolean;
}) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: featured ? theme.hero : theme.background, borderColor: featured ? theme.borderStrong : theme.border }]}>
    <ThemedText style={LoginTypography.label} themeColor={featured ? 'onHeroSecondary' : 'textSecondary'}>{label}</ThemedText>
    <ThemedText style={styles.value} themeColor={featured ? 'onHero' : alert ? 'danger' : 'text'}>{value}</ThemedText>
    <ThemedText style={styles.detail} themeColor={featured ? 'onHeroSecondary' : 'textMuted'}>{detail}</ThemedText>
  </View>;
}

const styles = StyleSheet.create({
  card: { flexGrow: 1, flexBasis: '30%', minWidth: 240, padding: Spacing.four, gap: Spacing.small, borderWidth: 1, borderRadius: Radius.panel },
  value: { ...LoginTypography.title, fontSize: 30, lineHeight: 40, fontVariant: ['tabular-nums'] },
  detail: { ...LoginTypography.body, marginTop: 'auto' },
});

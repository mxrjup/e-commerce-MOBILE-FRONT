import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { categories, type Product } from '@/services/catalog';

export function DashboardCategories({ products }: { products: Product[] }) {
  const theme = useTheme();
  return <View style={[styles.panel, { backgroundColor: theme.background, borderColor: theme.border }]}>
    <View style={styles.heading}>
      <ThemedText style={LoginTypography.label} themeColor="textMuted">Catalogue</ThemedText>
      <ThemedText accessibilityRole="header" style={styles.title}>Répartition par catégorie</ThemedText>
      <ThemedText style={LoginTypography.body} themeColor="textSecondary">{products.length} références · {categories.length} catégories</ThemedText>
    </View>
    {categories.map(category => {
      const count = products.filter(product => product.category === category.id).length;
      const percentage = products.length ? Math.round(count / products.length * 100) : 0;
      return <View key={category.id} style={styles.category}>
        <View style={styles.row}>
          <ThemedText style={[LoginTypography.body, styles.name]}>{category.name}</ThemedText>
          <ThemedText style={styles.count} themeColor="textSecondary">{count} · {percentage} %</ThemedText>
        </View>
        <View accessible accessibilityRole="progressbar" accessibilityLabel={category.name}
          accessibilityValue={{ min: 0, max: products.length || 1, now: count, text: `${count} produits, ${percentage} % du catalogue` }}
          style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
          <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: theme.textSecondary }]} />
        </View>
      </View>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  panel: { flex: 1, minWidth: 0, padding: Spacing.four, borderWidth: 1, borderRadius: Radius.panel, gap: Spacing.four },
  heading: { gap: Spacing.two }, title: { ...LoginTypography.lead, fontWeight: '800' },
  category: { gap: Spacing.two }, row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  name: { flexShrink: 1 }, count: { ...LoginTypography.body, fontVariant: ['tabular-nums'] },
  track: { height: 6, borderRadius: Radius.pill, overflow: 'hidden' }, fill: { height: '100%', borderRadius: Radius.pill },
});

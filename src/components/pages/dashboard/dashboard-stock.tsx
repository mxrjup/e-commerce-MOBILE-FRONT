import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type Product } from '@/services/catalog';

export function DashboardStock({ products }: { products: Product[] }) {
  const theme = useTheme();
  const lowStock = products.filter(product => product.stock > 0 && product.stock <= 5);
  return <View style={[styles.panel, { backgroundColor: theme.background, borderColor: theme.border }]}>
    <View style={styles.heading}>
      <ThemedText style={LoginTypography.label} themeColor="textMuted">Vigilance</ThemedText>
      <ThemedText accessibilityRole="header" style={styles.title}>Stocks à surveiller</ThemedText>
      <ThemedText style={LoginTypography.body} themeColor="textSecondary">{lowStock.length} référence{lowStock.length > 1 ? 's' : ''} avec 1 à 5 unités restantes</ThemedText>
    </View>
    {lowStock.length === 0 && <ThemedText style={LoginTypography.body} themeColor="textSecondary">Aucun stock faible à signaler.</ThemedText>}
    {lowStock.map(product => <Pressable key={product.id} accessibilityRole="button"
      accessibilityLabel={`${product.brand} ${product.name}, ${product.stock} unités restantes. Voir le produit`}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={({ pressed }) => [styles.row, { borderColor: theme.border, opacity: pressed ? 0.65 : 1 }]}>
      <View style={styles.product}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">{product.brand}</ThemedText>
        <ThemedText style={styles.name}>{product.name}</ThemedText>
      </View>
      <View style={styles.action}>
        <View style={[styles.badge, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <ThemedText style={styles.quantity}>{product.stock} unités</ThemedText>
        </View>
        <ThemedText accessible={false} themeColor="accent">↗</ThemedText>
      </View>
    </Pressable>)}
    <ThemedText style={styles.footnote} themeColor="textMuted">Sélectionnez une référence pour consulter sa fiche.</ThemedText>
  </View>;
}

const styles = StyleSheet.create({
  panel: { flex: 1, minWidth: 0, padding: Spacing.four, borderWidth: 1, borderRadius: Radius.panel },
  heading: { gap: Spacing.two, paddingBottom: Spacing.three }, title: { ...LoginTypography.lead, fontWeight: '800' },
  row: { minHeight: 80, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.small, borderTopWidth: 1, paddingVertical: Spacing.three },
  product: { flexGrow: 1, flexBasis: 140, gap: Spacing.one }, name: { ...LoginTypography.body, fontWeight: '700' },
  action: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small },
  badge: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, borderWidth: 1, borderRadius: Radius.control },
  quantity: { ...LoginTypography.body, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  footnote: { ...LoginTypography.body, fontSize: 12, paddingTop: Spacing.three, marginTop: 'auto' },
});

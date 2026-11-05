import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCategories } from '@/components/pages/dashboard/dashboard-categories';
import { DashboardMetric } from '@/components/pages/dashboard/dashboard-metric';
import { DashboardStock } from '@/components/pages/dashboard/dashboard-stock';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { categories, products, formatPrice } from '@/services/catalog';

export function DashboardPage({ name }: { name: string }) {
  const theme = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const wide = width / fontScale >= 900;
  const compact = width < 600;
  const lowStock = products.filter(product => product.stock > 0 && product.stock <= 5);
  const outOfStock = products.filter(product => product.stock === 0).length;
  const metrics = [
    { label: 'Valeur du stock', value: formatPrice(products.reduce((sum, product) => sum + product.price * product.stock, 0)), detail: 'Valorisation au prix de vente', featured: true },
    { label: 'Produits', value: String(products.length), detail: `${categories.length} catégories au catalogue` },
    { label: 'Unités en stock', value: String(products.reduce((sum, product) => sum + product.stock, 0)), detail: 'Toutes références confondues' },
    { label: 'Stock faible', value: String(lowStock.length), detail: 'Références avec 1 à 5 unités' },
    { label: 'Ruptures de stock', value: String(outOfStock), detail: 'Références indisponibles', alert: outOfStock > 0 },
    { label: 'Marques', value: String(new Set(products.map(product => product.brand)).size), detail: 'Représentées dans le catalogue' },
  ];

  return <ThemedView type="backgroundElement" style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView contentContainerStyle={[styles.content, compact && styles.compact]}>
      <View style={[styles.topbar, { borderColor: theme.border }]}>
        <View style={styles.identity}>
          <ThemedText style={styles.wordmark}>LOG</ThemedText>
          <View style={[styles.divider, { backgroundColor: theme.borderStrong }]} />
          <ThemedText style={LoginTypography.label} themeColor="textSecondary">Back-office</ThemedText>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/home')}
          style={({ pressed }) => [styles.back, { borderColor: theme.border, backgroundColor: theme.background, opacity: pressed ? 0.65 : 1 }]}>
          <ThemedText style={styles.backLabel} themeColor="accent">← Accueil</ThemedText>
        </Pressable>
      </View>

      <View style={styles.header}>
        <View style={styles.intro}>
          <ThemedText style={LoginTypography.label} themeColor="textMuted">Pilotage du catalogue</ThemedText>
          <ThemedText accessibilityRole="header" style={LoginTypography.title}>Vue d’ensemble</ThemedText>
          <ThemedText style={LoginTypography.body} themeColor="textSecondary">Bienvenue, {name}. Voici les indicateurs de votre catalogue.</ThemedText>
        </View>
        <View style={[styles.demoBadge, { borderColor: theme.borderStrong }]}>
          <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
          <ThemedText style={styles.demoLabel} themeColor="textSecondary">Données de démonstration</ThemedText>
        </View>
      </View>

      <View style={styles.grid}>{metrics.map(metric => <DashboardMetric key={metric.label} {...metric} />)}</View>

      <View style={[styles.panels, wide && styles.horizontal]}>
        <DashboardCategories products={products} />
        <DashboardStock products={products} />
      </View>

      <View style={[styles.footer, { borderColor: theme.border }]}>
        <ThemedText style={styles.footerText} themeColor="textMuted">LOG · Espace de gestion</ThemedText>
        <ThemedText style={styles.footerText} themeColor="textMuted">Catalogue de démonstration. Valeur du stock calculée aux prix de vente.</ThemedText>
      </View>
    </ScrollView>
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, content: { padding: Spacing.five, gap: Spacing.five, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  compact: { padding: Spacing.three, gap: Spacing.four },
  topbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three, borderBottomWidth: 1, paddingBottom: Spacing.four },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small }, wordmark: { ...LoginTypography.lead, fontWeight: '800', letterSpacing: -0.5 },
  divider: { height: 20, width: 1 }, back: { minHeight: ControlSize.touch, paddingHorizontal: Spacing.three, justifyContent: 'center', borderWidth: 1, borderRadius: Radius.control },
  backLabel: { ...LoginTypography.body, fontWeight: '700' },
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.three },
  intro: { flexGrow: 1, flexShrink: 1, flexBasis: 450, gap: Spacing.two },
  demoBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: Spacing.two, paddingHorizontal: Spacing.small, paddingVertical: Spacing.two, borderWidth: 1, borderRadius: Radius.control, maxWidth: '100%' },
  dot: { width: 6, height: 6, borderRadius: Radius.pill }, demoLabel: { ...LoginTypography.body, fontSize: 12, flexShrink: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  panels: { gap: Spacing.three }, horizontal: { flexDirection: 'row', alignItems: 'stretch' },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.two, borderTopWidth: 1, paddingTop: Spacing.three },
  footerText: { ...LoginTypography.body, fontSize: 12 },
});

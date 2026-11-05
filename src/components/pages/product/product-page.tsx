import { Link, router } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Choice, ProductCard, ProductImage } from '@/components/shared/catalog-ui';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { categories, formatPrice, getProduct, products } from '@/services/catalog';

export function ProductPage({ id }: { id: string }) {
  const product = getProduct(id);
  const theme = useTheme();
  const wide = useWindowDimensions().width >= 800;
  const back = () => router.canGoBack() ? router.back() : router.replace('/home');
  if (!product) return <ThemedView style={styles.root}><SafeAreaView style={styles.root}><View style={styles.missing}>
    <ThemedText accessibilityRole="header" style={LoginTypography.title}>Produit introuvable</ThemedText>
    <ThemedText style={LoginTypography.body}>Ce produit n’existe pas dans le catalogue.</ThemedText>
    <Choice label="Retour au catalogue" onPress={back} />
  </View></SafeAreaView></ThemedView>;
  const category = categories.find(c => c.id === product.category);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.top}><Choice label="← Retour au catalogue" onPress={back} /><ThemedText themeColor="textMuted" style={LoginTypography.label}>LOG · Informatique & téléphonie</ThemedText></View>
      <ThemedText style={LoginTypography.body} themeColor="textMuted">Catalogue / {category?.name} / {product.name}</ThemedText>
      <View style={[styles.main, wide && styles.horizontal]}>
        <View style={styles.flex}><ProductImage key={product.id} product={product} large /><ThemedText style={styles.caption} themeColor="textMuted">Photo d’illustration · modèle et coloris indicatifs.</ThemedText></View>
        <View style={[styles.details, styles.flex]}>
          <ThemedText style={LoginTypography.label} themeColor="accent">{product.brand}{product.badge ? ` · ${product.badge}` : ''}</ThemedText>
          <ThemedText accessibilityRole="header" style={LoginTypography.title}>{product.name}</ThemedText>
          <ThemedText style={LoginTypography.lead} themeColor="textSecondary">{product.description}</ThemedText>
          <View style={styles.prices}><ThemedText style={styles.price}>{formatPrice(product.price)}</ThemedText>
            {!!product.previousPrice && <ThemedText style={styles.oldPrice} themeColor="textMuted">{formatPrice(product.previousPrice)}</ThemedText>}</View>
          {!!product.previousPrice && <ThemedText style={LoginTypography.body} themeColor="accent">Économie indicative : {formatPrice(product.previousPrice - product.price)}</ThemedText>}
          <View style={[styles.stock, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={LoginTypography.button}>{product.stock > 0 ? `En stock · ${product.stock} disponibles` : 'Actuellement indisponible'}</ThemedText>
            <ThemedText style={LoginTypography.body} themeColor="textSecondary">Catalogue de démonstration. Prix et disponibilités indicatifs.</ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.details}>
        <ThemedText accessibilityRole="header" style={styles.sectionTitle}>L’essentiel, en détail.</ThemedText>
        <View style={[styles.specs, { borderColor: theme.border }]}>{Object.entries(product.specs).map(([label, value], index) => <View key={label} style={[styles.specRow, { backgroundColor: index % 2 === 0 ? theme.backgroundElement : theme.background }]}>
          <ThemedText style={[LoginTypography.body, styles.specLabel]} themeColor="textSecondary">{label}</ThemedText><ThemedText style={[LoginTypography.body, styles.flex]}>{value}</ThemedText>
        </View>)}</View>
      </View>
      {!!related.length && <View style={styles.details}><ThemedText accessibilityRole="header" style={styles.sectionTitle}>Dans le même univers</ThemedText>
        <View style={[styles.related, wide && styles.horizontal]}>{related.map(item => <View key={item.id} style={wide ? styles.flex : undefined}><ProductCard product={item} /></View>)}</View>
      </View>}
      <Link href="/home" style={{ color: theme.accent, paddingVertical: 16, ...LoginTypography.button }}>Tous les produits →</Link>
    </ScrollView>
  </SafeAreaView></ThemedView>;
}
const styles = StyleSheet.create({
  root: { flex: 1 }, content: { width: '100%', maxWidth: 1200, alignSelf: 'center', padding: 20, gap: 28 },
  missing: { padding: 24, gap: 24, flex: 1, justifyContent: 'center' }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  main: { gap: 32 }, horizontal: { flexDirection: 'row' }, flex: { flex: 1, minWidth: 0 }, details: { gap: 16 }, caption: { ...LoginTypography.body, marginTop: 8 },
  prices: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16 }, price: { ...LoginTypography.title, fontSize: 30 }, oldPrice: { ...LoginTypography.lead, textDecorationLine: 'line-through' },
  stock: { padding: 20, borderWidth: 1, borderRadius: Radius.panel, gap: 8 }, sectionTitle: { ...LoginTypography.lead, fontSize: 24, lineHeight: 32, fontWeight: '800' },
  specs: { borderWidth: 1, borderRadius: Radius.panel, overflow: 'hidden' }, specRow: { padding: 16, flexDirection: 'row', gap: 16 }, specLabel: { width: '40%' }, related: { gap: 16 },
});

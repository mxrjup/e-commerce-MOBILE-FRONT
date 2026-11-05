import { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, TextInput, type TextInputInstance, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SideMenu } from '@/components/side-menu';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Choice, ProductCard } from '@/components/shared/catalog-ui';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { categories, defaultFilters, filterProducts, products, type CatalogFilters } from '@/services/catalog';

export function HomePage() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const search = useRef<TextInputInstance>(null);
  const list = useRef<FlatList>(null);
  const results = useMemo(() => filterProducts(products, filters), [filters]);
  const sections = categories.map(category => ({ ...category, products: results.filter(p => p.category === category.id) })).filter(section => section.products.length > 0);
  const hasCriteria = filters.category !== 'all' || filters.brands.length > 0 || !!filters.minPrice || !!filters.maxPrice;
  const categoryName = categories.find(c => c.id === filters.category)?.name;
  const reset = () => setFilters(defaultFilters);
  const applyFilters = (next: CatalogFilters) => { setFilters(next); list.current?.scrollToOffset({ offset: 0, animated: false }); };

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <FlatList ref={list} data={sections} keyExtractor={section => section.id} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}
      ListHeaderComponent={<View style={styles.header}>
        <SideMenu filters={filters} onApplyFilters={applyFilters} onHome={reset} />
        <View style={[styles.hero, { backgroundColor: theme.hero }]}>
          <ThemedText style={LoginTypography.label} themeColor="onHeroSecondary">L’ESSENTIEL TECH, BIEN CHOISI.</ThemedText>
          <ThemedText accessibilityRole="header" style={styles.heroTitle} themeColor="onHero">Votre prochain coup de cœur technologique.</ThemedText>
          <ThemedText style={LoginTypography.lead} themeColor="onHeroSecondary">PC, smartphones et accessoires. Trouvez l’équipement qui vous ressemble.</ThemedText>
          <Choice label="Explorer les produits →" onPress={() => search.current?.focus()} />
        </View>
        <View style={styles.searchRow}>
          <TextInput ref={search} accessibilityLabel="Rechercher un produit, une marque ou une caractéristique" placeholder="Rechercher un PC, un smartphone…" placeholderTextColor={theme.textMuted}
            value={filters.query} onChangeText={query => setFilters(current => ({ ...current, query }))} returnKeyType="search" onSubmitEditing={() => search.current?.blur()}
            style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.borderStrong }]} />
          {!!filters.query && <Choice label="Effacer" onPress={() => setFilters(current => ({ ...current, query: '' }))} />}
        </View>
        {hasCriteria && <View style={[styles.summary, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <ThemedText style={LoginTypography.label} themeColor="textMuted">Votre sélection</ThemedText>
          <ThemedText style={LoginTypography.body}>{[categoryName, ...filters.brands, filters.minPrice && `Dès ${filters.minPrice} €`, filters.maxPrice && `Jusqu’à ${filters.maxPrice} €`].filter(Boolean).join(' · ')}</ThemedText>
          <Choice label="Retirer les critères" onPress={() => setFilters(current => ({ ...defaultFilters, query: current.query }))} />
        </View>}
        {(hasCriteria || !!filters.query) && <ThemedText accessibilityLiveRegion="polite" style={LoginTypography.body} themeColor="textSecondary">{results.length} produit{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''}</ThemedText>}
        <ThemedText style={styles.caption} themeColor="textMuted">Catalogue de démonstration · prix et disponibilités indicatifs.</ThemedText>
      </View>}
      renderItem={({ item: section }) => <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText accessibilityRole="header" style={styles.sectionTitle}>{section.name}</ThemedText>
          <ThemedText style={LoginTypography.body} themeColor="textMuted">{section.products.length} produit{section.products.length > 1 ? 's' : ''}</ThemedText>
        </View>
        <FlatList horizontal data={section.products} keyExtractor={item => item.id} showsHorizontalScrollIndicator keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.productRow} renderItem={({ item }) => <View style={{ width: Math.min(280, width - 64) }}><ProductCard product={item} /></View>} />
      </View>}
      ListEmptyComponent={<View style={styles.empty}>
        <ThemedText accessibilityRole="header" style={styles.sectionTitle}>Aucun produit ne correspond.</ThemedText>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">Modifiez vos critères dans le menu Catégories ou essayez une autre recherche.</ThemedText>
        <Choice label="Afficher tous les produits" onPress={reset} />
      </View>}
      ListFooterComponent={<ThemedText style={styles.footer} themeColor="textMuted">LOG · Informatique & téléphonie{'\n'}Photos d’illustration.</ThemedText>}
    />
  </SafeAreaView></ThemedView>;
}
const styles = StyleSheet.create({
  root: { flex: 1 }, content: { padding: 16, maxWidth: 1200, width: '100%', alignSelf: 'center' },
  header: { gap: 20, paddingBottom: 28 }, hero: { padding: 28, borderRadius: Radius.card, gap: 18 }, heroTitle: { ...LoginTypography.title, maxWidth: 680 },
  section: { gap: 16, marginBottom: 36 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  sectionTitle: { ...LoginTypography.lead, fontSize: 24, lineHeight: 32, fontWeight: '800' }, productRow: { gap: 16, paddingBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center' }, input: { ...LoginTypography.body, flex: 1, minWidth: 0, minHeight: 48, borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 12, paddingVertical: 10 },
  summary: { padding: 16, gap: 12, borderWidth: 1, borderRadius: Radius.panel }, caption: { ...LoginTypography.body, fontSize: 12 },
  empty: { paddingVertical: 40, gap: 16 }, footer: { ...LoginTypography.body, paddingVertical: 24, textAlign: 'center' },
});

import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { categories, defaultFilters, filterProducts, products, validPriceRange, type CatalogFilters } from '@/services/catalog';

export function CategoryForm({ filters, onApply }: { filters: CatalogFilters; onApply: (filters: CatalogFilters) => void }) {
  const theme = useTheme();
  const [draft, setDraft] = useState(filters);
  const [submitted, setSubmitted] = useState(false);
  const update = (patch: Partial<CatalogFilters>) => setDraft(current => ({ ...current, ...patch }));
  const brands = [...new Set(products.filter(p => draft.category === 'all' || p.category === draft.category).map(p => p.brand))].sort();
  const valid = validPriceRange(draft);
  const fieldStyle = [styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.borderStrong }];
  return <View style={[styles.form, { borderColor: theme.border }]}>
    <ThemedText accessibilityRole="header" style={LoginTypography.lead}>Trouver votre équipement</ThemedText>
    <ThemedText style={LoginTypography.label} themeColor="textMuted">Type de produit</ThemedText>
    <View style={styles.choices}>
      <Choice label="Tous les types" selected={draft.category === 'all'} onPress={() => update({ category: 'all', brands: [] })} />
      {categories.map(category => <Choice key={category.id} label={category.name} selected={draft.category === category.id} onPress={() => update({ category: category.id, brands: [] })} />)}
    </View>
    <ThemedText style={LoginTypography.label} themeColor="textMuted">Marque</ThemedText>
    <View style={styles.choices}>
      <Choice label="Toutes les marques" selected={!draft.brands.length} onPress={() => update({ brands: [] })} />
      {brands.map(brand => <Choice key={brand} label={brand} selected={draft.brands.includes(brand)} onPress={() => update({ brands: draft.brands.includes(brand) ? [] : [brand] })} />)}
    </View>
    <ThemedText style={LoginTypography.label} themeColor="textMuted">Prix (€)</ThemedText>
    <View style={styles.row}>
      <View style={styles.field}><ThemedText style={LoginTypography.body}>Minimum</ThemedText><TextInput accessibilityLabel="Prix minimum en euros" keyboardType="decimal-pad" value={draft.minPrice} onChangeText={minPrice => update({ minPrice })} placeholder="0" placeholderTextColor={theme.textMuted} style={fieldStyle} /></View>
      <View style={styles.field}><ThemedText style={LoginTypography.body}>Maximum</ThemedText><TextInput accessibilityLabel="Prix maximum en euros" keyboardType="decimal-pad" value={draft.maxPrice} onChangeText={maxPrice => update({ maxPrice })} placeholder="Sans limite" placeholderTextColor={theme.textMuted} style={fieldStyle} /></View>
    </View>
    {submitted && !valid && <ThemedText accessibilityRole="alert" style={LoginTypography.body} themeColor="danger">Vérifiez les prix : montants positifs et minimum inférieur ou égal au maximum.</ThemedText>}
    <ThemedText accessibilityLiveRegion="polite" style={LoginTypography.body} themeColor="textSecondary">{valid ? `${filterProducts(products, draft).length} produit(s) correspondent à vos critères.` : 'Le budget saisi est invalide.'}</ThemedText>
    <Choice label="Afficher les produits →" selected onPress={() => { setSubmitted(true); if (valid) onApply(draft); }} />
    <Choice label="Réinitialiser les critères" onPress={() => { setDraft({ ...defaultFilters, query: draft.query }); setSubmitted(false); }} />
  </View>;
}
const styles = StyleSheet.create({
  form: { borderTopWidth: 1, paddingTop: 16, gap: 16 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', gap: 8 }, field: { flex: 1, minWidth: 0, gap: 4 },
  input: { ...LoginTypography.body, minHeight: 48, borderWidth: 1, borderRadius: Radius.control, padding: 10 },
});

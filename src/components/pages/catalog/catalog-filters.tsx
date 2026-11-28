import { StyleSheet, View } from 'react-native';
import { CatalogFilterGroup } from '@/components/pages/catalog/catalog-filter-group';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { catalogKinds } from '@/services/catalog-api';
import { catalogFilterKeys, type ProductFilters } from '@/services/product-list';

export function CatalogFilters({ selected, onChange }: { selected: ProductFilters; onChange: (filters: ProductFilters) => void }) {
  const theme = useTheme();
  const count = Object.values(selected).filter(Boolean).length;

  return <View style={[styles.panel, { borderColor: theme.border }]}>
    <ThemedText accessibilityRole="header" style={LoginTypography.lead}>Filtres</ThemedText>
    <ThemedText themeColor="textSecondary">Combinez une catégorie, une marque et un univers.</ThemedText>
    {catalogKinds.map(kind => <CatalogFilterGroup key={kind} kind={kind} selected={selected[catalogFilterKeys[kind]]}
      onChange={value => onChange({ ...selected, [catalogFilterKeys[kind]]: value })} />)}
    <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">
      {count === 0 ? 'Tous les articles.' : `${count} critère${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}.`}
    </ThemedText>
    <Choice label="Réinitialiser les filtres" disabled={count === 0}
      onPress={() => onChange({})} />
  </View>;
}

const styles = StyleSheet.create({ panel: { padding: 12, gap: 12, borderWidth: 1, borderRadius: Radius.panel } });

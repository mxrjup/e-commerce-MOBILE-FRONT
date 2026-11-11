import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CatalogFilterGroup } from '@/components/pages/catalog/catalog-filter-group';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { catalogKinds, type CatalogKind } from '@/services/catalog-api';

export function CatalogFilters() {
  const theme = useTheme();
  const [selected, setSelected] = useState<Record<CatalogKind, number[]>>({ categories: [], brands: [], universes: [] });
  const count = catalogKinds.reduce((total, kind) => total + selected[kind].length, 0);

  return <View style={[styles.panel, { borderColor: theme.border }]}>
    <ThemedText accessibilityRole="header" style={LoginTypography.lead}>Filtres des articles</ThemedText>
    <ThemedText themeColor="textSecondary">Préparez vos critères. Le filtrage des articles sera disponible lorsque le catalogue produits sera accessible. Ces sélections ne filtrent pas les rubriques ci-dessous.</ThemedText>
    {catalogKinds.map(kind => <CatalogFilterGroup key={kind} kind={kind} selected={selected[kind]}
      onChange={values => setSelected(current => ({ ...current, [kind]: values }))} />)}
    <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">
      {count === 0 ? 'Aucun critère sélectionné.' : `${count} critère${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''} · non appliqué${count > 1 ? 's' : ''}.`}
    </ThemedText>
    <Choice label="Réinitialiser les filtres" disabled={count === 0}
      onPress={() => setSelected({ categories: [], brands: [], universes: [] })} />
  </View>;
}

const styles = StyleSheet.create({ panel: { padding: 16, gap: 16, borderWidth: 1, borderRadius: Radius.panel } });

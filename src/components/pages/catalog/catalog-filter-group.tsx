import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography } from '@/constants/theme';
import { useCatalog } from '@/hooks/use-catalog';
import { useTheme } from '@/hooks/use-theme';
import { catalogLabels, flattenCategories, type CatalogKind } from '@/services/catalog-api';

export function CatalogFilterGroup({ kind, selected, onChange }: {
  kind: CatalogKind; selected: number[]; onChange: (selected: number[]) => void;
}) {
  const { data, loading, error } = useCatalog(kind);
  const theme = useTheme();
  const options = flattenCategories(data);

  return <View style={styles.group}>
    <ThemedText accessibilityRole="header" style={LoginTypography.label}>{catalogLabels[kind]}</ThemedText>
    {loading ? <View style={styles.loading}>
      <ActivityIndicator color={theme.accent} />
      <ThemedText accessibilityLiveRegion="polite">Chargement des options…</ThemedText>
    </View> : error ? <ThemedText accessibilityRole="alert" themeColor="danger">{error}</ThemedText>
      : options.length === 0 ? <ThemedText themeColor="textSecondary">Aucune option disponible pour ce filtre.</ThemedText>
        : <View style={styles.options}>
          <Choice label={`Tout inclure — ${catalogLabels[kind]}`} selected={selected.length === 0} onPress={() => onChange([])} />
          {options.map(({ item, path }) => <Choice key={item.id} label={path}
            accessibilityLabel={`${catalogLabels[kind]} : ${path}`} selected={selected.includes(item.id)}
            onPress={() => onChange(selected.includes(item.id) ? selected.filter(id => id !== item.id) : [...selected, item.id])} />)}
        </View>}
  </View>;
}

const styles = StyleSheet.create({
  group: { gap: 8 }, options: { gap: 8 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

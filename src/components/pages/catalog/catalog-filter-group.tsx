import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { Accordion } from '@/components/shared/ui/accordion';
import { useCatalog } from '@/hooks/use-catalog';
import { useTheme } from '@/hooks/use-theme';
import { catalogLabels, flattenCategories, type CatalogKind } from '@/services/catalog-api';

export function CatalogFilterGroup({ kind, selected, onChange }: {
  kind: CatalogKind; selected?: string; onChange: (selected: string | undefined) => void;
}) {
  const { data, loading, error } = useCatalog(kind);
  const theme = useTheme();
  const options = flattenCategories(data);

  return <Accordion title={catalogLabels[kind]} count={selected ? 1 : 0}
    summary={options.find(({ item }) => item.slug === selected)?.path}>
    {loading ? <View style={styles.loading}>
      <ActivityIndicator color={theme.accent} />
      <ThemedText accessibilityLiveRegion="polite">Chargement des options…</ThemedText>
    </View> : error ? <ThemedText accessibilityRole="alert" themeColor="danger">{error}</ThemedText>
      : options.length === 0 ? <ThemedText themeColor="textSecondary">Aucune option disponible pour ce filtre.</ThemedText>
        : <View style={styles.options}>
          <Choice label={`Tout inclure — ${catalogLabels[kind]}`} selected={!selected} onPress={() => onChange(undefined)} />
          {options.map(({ item, path }) => <Choice key={item.id} label={path}
            accessibilityLabel={`${catalogLabels[kind]} : ${path}`} selected={selected === item.slug}
            onPress={() => onChange(selected === item.slug ? undefined : item.slug)} />)}
        </View>}
  </Accordion>;
}

const styles = StyleSheet.create({
  options: { gap: 8 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

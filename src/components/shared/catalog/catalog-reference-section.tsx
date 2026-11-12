import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { CatalogReferenceLinks } from '@/components/shared/catalog/catalog-reference-links';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography } from '@/constants/theme';
import { useCatalog } from '@/hooks/use-catalog';
import { useTheme } from '@/hooks/use-theme';
import { catalogLabels, searchReferences, type CatalogKind } from '@/services/catalog-api';

export function CatalogReferenceSection({ kind, query, onNavigate }: { kind: CatalogKind; query: string; onNavigate?: () => void }) {
  const { data, loading, error } = useCatalog(kind);
  const theme = useTheme();
  return <View style={styles.section}>
    <ThemedText accessibilityRole="header" style={LoginTypography.lead}>{catalogLabels[kind]}</ThemedText>
    {loading ? <View style={styles.loading}><ActivityIndicator color={theme.accent} /><ThemedText accessibilityLiveRegion="polite">Chargement…</ThemedText></View>
      : error ? <ThemedText accessibilityRole="alert" themeColor="danger">{error}</ThemedText>
        : !data.length ? <ThemedText themeColor="textSecondary">Aucune rubrique disponible pour le moment.</ThemedText>
          : !searchReferences(data, query).length ? <ThemedText themeColor="textSecondary">Aucune rubrique ne correspond à votre recherche.</ThemedText>
            : <CatalogReferenceLinks kind={kind} items={data} query={query} onNavigate={onNavigate} />}
  </View>;
}

const styles = StyleSheet.create({ section: { gap: 12 }, loading: { flexDirection: 'row', alignItems: 'center', gap: 8 } });

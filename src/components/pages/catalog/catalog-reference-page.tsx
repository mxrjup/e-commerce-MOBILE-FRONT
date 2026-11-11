import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatalogReferenceLinks } from '@/components/shared/catalog/catalog-reference-links';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { LoginTypography } from '@/constants/theme';
import { useCatalog } from '@/hooks/use-catalog';
import { useTheme } from '@/hooks/use-theme';
import { catalogLabels, flattenCategories, isCatalogKind } from '@/services/catalog-api';

export function CatalogReferencePage({ kind, slug }: { kind: string; slug: string }) {
  const valid = isCatalogKind(kind) && !!slug && slug !== '.' && slug !== '..';
  const resource = isCatalogKind(kind) ? kind : 'categories';
  const detail = useCatalog(resource, slug, valid);
  const tree = useCatalog('categories', undefined, valid && resource === 'categories');
  const item = detail.data[0];
  const children = item ? flattenCategories(tree.data).find(node => node.item.id === item.id)?.item.children ?? [] : [];
  const theme = useTheme();
  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}><ScrollView contentContainerStyle={styles.content}>
    <Choice label="← Retour" accessibilityLabel="Retour à la page précédente" onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} />
    {!valid ? <ThemedText accessibilityRole="alert">Rubrique introuvable.</ThemedText>
      : detail.loading ? <><ActivityIndicator color={theme.accent} /><ThemedText accessibilityLiveRegion="polite">Chargement de la rubrique…</ThemedText></>
        : detail.error ? <ThemedText accessibilityRole="alert" themeColor="danger">{detail.error}</ThemedText>
          : item && <>
            <ThemedText themeColor="textMuted" style={LoginTypography.label}>{catalogLabels[resource]}</ThemedText>
            <ThemedText accessibilityRole="header" style={LoginTypography.title}>{item.name}</ThemedText>
            {!!item.description && <ThemedText style={LoginTypography.lead}>{item.description}</ThemedText>}
            {resource === 'categories' && <View style={styles.children}>
              {tree.loading ? <ThemedText accessibilityLiveRegion="polite">Chargement des sous-catégories…</ThemedText>
                : tree.error ? <ThemedText accessibilityRole="alert" themeColor="danger">Sous-catégories : {tree.error}</ThemedText>
                  : children.length > 0 && <><ThemedText accessibilityRole="header" style={LoginTypography.lead}>Sous-catégories</ThemedText><CatalogReferenceLinks kind="categories" items={children} /></>}
            </View>}
            <ThemedText themeColor="textSecondary">La consultation des articles de cette rubrique n’est pas encore disponible.</ThemedText>
          </>}
    <Choice label="Retour à l’accueil" onPress={() => router.navigate('/home')} />
  </ScrollView></SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { width: '100%', maxWidth: 1200, alignSelf: 'center', padding: 20, gap: 24 }, children: { gap: 12 } });

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Choice } from '@/components/shared/forms/choice';
import { searchReferences, type CatalogKind, type CatalogReference } from '@/services/catalog-api';

export function CatalogReferenceLinks({ kind, items, query = '', onNavigate }: { kind: CatalogKind; items: CatalogReference[]; query?: string; onNavigate?: () => void }) {
  return <View style={styles.links}>{searchReferences(items, query).map(({ item, path }) =>
    <Choice key={item.id} label={path} onPress={() => {
      onNavigate?.();
      router.push({ pathname: '/catalog/[kind]/[slug]', params: { kind, slug: item.slug } });
    }} />
  )}</View>;
}

const styles = StyleSheet.create({ links: { gap: 8 } });

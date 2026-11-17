import { ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatalogFilters } from '@/components/pages/catalog/catalog-filters';
import { CatalogNavigation } from '@/components/shared/catalog/catalog-navigation';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { CatalogProducts } from '@/components/shared/catalog/catalog-products';
import type { ProductFilters } from '@/services/product-list';
import { ThemedView } from '@/components/shared/ui/themed-view';

export function CatalogPage() {
  const [filters, setFilters] = useState<ProductFilters>({});
  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <SideMenu />
      <CatalogFilters selected={filters} onChange={setFilters} />
      <CatalogProducts filters={filters} />
      <CatalogNavigation />
    </ScrollView>
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center' },
});

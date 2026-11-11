import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatalogFilters } from '@/components/pages/catalog/catalog-filters';
import { CatalogNavigation } from '@/components/shared/catalog/catalog-navigation';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';

export function CatalogPage() {
  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <SideMenu />
      <CatalogNavigation><CatalogFilters /></CatalogNavigation>
      <ThemedText themeColor="textSecondary">La consultation des articles n’est pas encore disponible.</ThemedText>
    </ScrollView>
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center' },
});

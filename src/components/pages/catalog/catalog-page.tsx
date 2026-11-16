import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Choice } from '@/components/shared/forms/choice';
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
      <Choice label="Rechercher des produits" onPress={() => router.navigate('/search')} />
      <CatalogNavigation><CatalogFilters /></CatalogNavigation>
      <ThemedText themeColor="textSecondary">Retrouvez les articles depuis la recherche de produits.</ThemedText>
    </ScrollView>
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center' },
});

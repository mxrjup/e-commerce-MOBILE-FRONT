import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchProductCard } from '@/components/pages/search/search-product-card';
import { useProductSearch } from '@/components/pages/search/use-product-search';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function SearchPage() {
  const theme = useTheme();
  const search = useProductSearch();
  const [focused, setFocused] = useState(false);
  function submit(query: string) { Keyboard.dismiss(); search.submit(query); }
  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Choice label="Retour" onPress={() => router.canGoBack() ? router.back() : router.replace('/catalog')} />
        <ThemedText accessibilityRole="header" style={LoginTypography.title}>Rechercher des produits</ThemedText>
        <ThemedText style={LoginTypography.label}>Nom du produit</ThemedText>
        <TextInput value={search.query} onChangeText={search.change} onSubmitEditing={() => submit(search.query)}
          accessibilityLabel="Nom du produit" placeholder="Rechercher un produit…" placeholderTextColor={theme.textMuted}
          maxLength={150} returnKeyType="search" autoCorrect={false} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: focused ? theme.accent : theme.borderStrong }]} />
        <View style={styles.actions}>
          <Choice label="Rechercher" disabled={!search.query.trim()} onPress={() => submit(search.query)} />
          {!!search.query && <Choice label="Effacer" accessibilityLabel="Effacer la recherche de produits" onPress={() => search.change('')} />}
        </View>
        <FlatList style={styles.root} data={search.items} keyExtractor={item => String(item.id)} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
          onEndReached={search.more} onEndReachedThreshold={0.3}
          ListHeaderComponent={<View style={styles.section}>
            {search.mode === 'history' && <>
              <ThemedText accessibilityRole="header" style={LoginTypography.lead}>Recherches récentes</ThemedText>
              {search.history.length === 0 && <ThemedText themeColor="textSecondary">Aucune recherche récente.</ThemedText>}
              {search.history.map(query => <View key={query} style={styles.history}>
                <View style={styles.root}><Choice label={query} accessibilityLabel={`Relancer la recherche ${query}`} onPress={() => submit(query)} /></View>
                <Choice label="Supprimer" accessibilityLabel={`Supprimer la recherche ${query}`} onPress={() => search.remove(query)} />
              </View>)}
            </>}
            {!!search.historyError && <ThemedText accessibilityRole="alert">{search.historyError}</ThemedText>}
            {search.mode !== 'history' && <ThemedText accessibilityLiveRegion="polite" style={LoginTypography.lead}>
              {search.mode === 'suggestions' ? 'Suggestions' : `Résultats pour « ${search.query} »${search.page >= 0 ? ` · ${search.total}` : ''}`}
            </ThemedText>}
          </View>}
          renderItem={({ item }) => search.mode === 'suggestions'
            ? <View style={styles.suggestion}><Choice label={item.title} accessibilityLabel={`Rechercher ${item.title}`} onPress={() => submit(item.title)} /></View>
            : <SearchProductCard product={item} />}
          ListEmptyComponent={!search.loading && !search.error && search.mode !== 'history'
            ? <ThemedText accessibilityLiveRegion="polite">{search.mode === 'suggestions' ? 'Aucune suggestion. Vous pouvez lancer la recherche.' : 'Aucun produit trouvé. Essayez un autre nom.'}</ThemedText> : undefined}
          ListFooterComponent={<View style={styles.section}>
            {search.loading && <><ActivityIndicator color={theme.accent} /><ThemedText accessibilityLiveRegion="polite">Chargement…</ThemedText></>}
            {!!search.error && <><ThemedText accessibilityRole="alert">{search.error}</ThemedText><Choice label="Réessayer" onPress={search.retry} /></>}
            {search.mode === 'results' && !search.loading && !search.error && search.page + 1 < search.totalPages && <Choice label="Charger plus de produits" onPress={search.more} />}
          </View>} />
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView></ThemedView>;
}
const styles = StyleSheet.create({
  root: { flex: 1 }, content: { flex: 1, padding: 16, gap: 12, width: '100%', maxWidth: 800, alignSelf: 'center' },
  input: { ...LoginTypography.body, borderWidth: 2, borderRadius: Radius.control, padding: 12, minHeight: 48 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, section: { gap: 12, paddingVertical: 16 },
  history: { flexDirection: 'row', gap: 8, alignItems: 'center' }, suggestion: { marginBottom: 8 },
});

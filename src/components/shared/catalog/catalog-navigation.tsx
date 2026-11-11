import { useState, type ReactNode, type Ref } from 'react';
import { StyleSheet, TextInput, type TextInputInstance, View } from 'react-native';
import { CatalogReferenceSection } from '@/components/shared/catalog/catalog-reference-section';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { catalogKinds } from '@/services/catalog-api';

export function CatalogNavigation({ onNavigate, searchRef, showSearch = true, children }: { onNavigate?: () => void; searchRef?: Ref<TextInputInstance>; showSearch?: boolean; children?: ReactNode }) {
  const [query, setQuery] = useState('');
  const theme = useTheme();
  return <View style={styles.content}>
    <ThemedText accessibilityRole="header" style={LoginTypography.lead}>Explorer le catalogue</ThemedText>
    {showSearch && <>
    <ThemedText style={LoginTypography.label}>Rechercher une rubrique</ThemedText>
    <TextInput ref={searchRef} accessibilityLabel="Rechercher une catégorie, une marque ou un univers" placeholder="Rechercher une rubrique…" placeholderTextColor={theme.textMuted}
      value={query} onChangeText={setQuery} returnKeyType="search" style={[styles.input, { color: theme.text, borderColor: theme.borderStrong }]} />
    {!!query && <Choice label="Effacer la recherche de rubriques" onPress={() => setQuery('')} />}
    </>}
    {children}
    {catalogKinds.map(kind => <CatalogReferenceSection key={kind} kind={kind} query={showSearch ? query : ''} onNavigate={onNavigate} />)}
  </View>;
}

const styles = StyleSheet.create({ content: { gap: 24 }, input: { ...LoginTypography.body, borderWidth: 1, borderRadius: Radius.control, minHeight: 48, padding: 12 } });

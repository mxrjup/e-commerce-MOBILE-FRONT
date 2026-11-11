import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatalogNavigation } from '@/components/shared/catalog/catalog-navigation';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { Choice } from '@/components/shared/forms/choice';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function HomePage() {
  const theme = useTheme();

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <SideMenu />
      <View style={[styles.hero, { backgroundColor: theme.hero }]}>
        <ThemedText style={LoginTypography.label} themeColor="onHeroSecondary">L’ESSENTIEL TECH, BIEN CHOISI.</ThemedText>
        <ThemedText accessibilityRole="header" style={styles.heroTitle} themeColor="onHero">Votre prochain coup de cœur technologique.</ThemedText>
        <ThemedText style={LoginTypography.lead} themeColor="onHeroSecondary">PC, smartphones et accessoires. Trouvez l’équipement qui vous ressemble.</ThemedText>
        <Choice label="Explorer le catalogue →" onPress={() => router.navigate('/catalog')} />
      </View>
      <CatalogNavigation showSearch={false} />
      <ThemedText style={styles.footer} themeColor="textMuted">LOG · Informatique & téléphonie</ThemedText>
    </ScrollView>
  </SafeAreaView></ThemedView>;
}
const styles = StyleSheet.create({
  root: { flex: 1 }, content: { padding: 16, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center' },
  hero: { padding: 28, borderRadius: Radius.card, gap: 18 }, heroTitle: { ...LoginTypography.title, maxWidth: 680 },
  footer: { ...LoginTypography.body, paddingVertical: 24, textAlign: 'center' },
});

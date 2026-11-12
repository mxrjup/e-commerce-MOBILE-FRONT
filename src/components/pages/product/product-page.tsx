import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { LoginTypography } from '@/constants/theme';

export function ProductPage() {
  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <View style={styles.content}>
      <ThemedText accessibilityRole="header" style={LoginTypography.title}>Produit indisponible</ThemedText>
      <ThemedText style={LoginTypography.body}>Les fiches produits ne sont pas encore disponibles.</ThemedText>
      <Choice label="Retour au catalogue" onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} />
    </View>
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, content: { padding: 24, gap: 24, flex: 1, justifyContent: 'center' },
});

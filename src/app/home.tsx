import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { HomePage } from '@/components/pages/home/home-page';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const { user, busy } = useAuth();
  const theme = useTheme();

  if (!user && busy) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator accessibilityLabel="Chargement de votre session" color={theme.accent} />
      </ThemedView>
    );
  }

  if (!user) return <Redirect href="/" />;

  return <HomePage />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

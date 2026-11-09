import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { DashboardPage } from '@/components/pages/dashboard/dashboard-page';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { canAccessDashboard } from '@/services/authorization';

export default function Dashboard() {
  const { user, busy } = useAuth();
  if (!user && busy) return <ThemedView style={styles.loading}><ActivityIndicator accessibilityLabel="Chargement" /></ThemedView>;
  if (!user) return <Redirect href="/login" />;
  if (!canAccessDashboard(user)) return <Redirect href="/home" />;
  return <DashboardPage name={user.name || user.preferred_username || 'équipe LOG'} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

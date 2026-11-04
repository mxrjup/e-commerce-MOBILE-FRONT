import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginBrand } from '@/components/pages/login/login-brand';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ControlSize, LoginTypography, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export function HomePage() {
  const { user, busy, error, signOut } = useAuth();
  const theme = useTheme();
  const name = user?.name || user?.preferred_username || user?.email;

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <LoginBrand />
            <View style={styles.heading}>
              <ThemedText style={LoginTypography.label} themeColor="textMuted">Accueil</ThemedText>
              <ThemedText accessibilityRole="header" style={LoginTypography.title}>
                {name ? `Bonjour ${name}.` : 'Bienvenue chez vous.'}
              </ThemedText>
              <ThemedText style={LoginTypography.lead} themeColor="textSecondary">Bienvenue dans votre espace personnel.</ThemedText>
            </View>
            <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <ThemedText style={LoginTypography.label}>Votre compte</ThemedText>
              <ThemedText style={LoginTypography.body} themeColor="textSecondary">Vous êtes connecté. Retrouvez bientôt ici vos commandes et vos produits favoris.</ThemedText>
              {!!user?.email && <ThemedText style={LoginTypography.body}>{user.email}</ThemedText>}
            </View>
            {!!error && <ThemedText accessibilityRole="alert" style={LoginTypography.body} themeColor="danger">{error}</ThemedText>}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={() => { void signOut(); }}
              style={({ pressed }) => [styles.button, { backgroundColor: theme.accent }, (pressed || busy) && styles.dimmed]}>
              {busy && <ActivityIndicator color={theme.onAccent} />}
              <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>
                {busy ? 'Veuillez patienter…' : 'Se déconnecter'}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.four },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.five, paddingVertical: Spacing.four },
  heading: { gap: Spacing.three },
  card: { borderWidth: 1, borderRadius: Radius.panel, padding: Spacing.four, gap: Spacing.three },
  button: { minHeight: ControlSize.primary, borderRadius: Radius.control, paddingHorizontal: Spacing.four, paddingVertical: Spacing.small, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  dimmed: { opacity: 0.75 },
});

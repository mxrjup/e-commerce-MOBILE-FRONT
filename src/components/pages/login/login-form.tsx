import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export function LoginForm() {
  const theme = useTheme();
  const { user, busy, ready, error, signIn, signOut } = useAuth();
  const disabled = busy || (!user && !ready);

  return (
    <View style={styles.form}>
      {user ? (
        <View style={[styles.notice, { backgroundColor: theme.backgroundElement, borderColor: theme.borderStrong }]}>
          <ThemedText accessibilityLiveRegion="polite" style={LoginTypography.label}>Vous êtes connecté</ThemedText>
          <ThemedText style={LoginTypography.body}>{user.name || user.preferred_username || user.email || 'Votre compte'}</ThemedText>
        </View>
      ) : (
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">
          Connectez-vous pour retrouver votre espace personnel. Vous pourrez aussi réinitialiser votre mot de passe sur la page de connexion.
        </ThemedText>
      )}
      {!!error && (
        <View style={[styles.notice, { backgroundColor: theme.backgroundElement, borderColor: theme.borderStrong }]}>
          <ThemedText accessibilityRole="alert" accessibilityLiveRegion="polite" style={LoginTypography.body} themeColor="danger">{error}</ThemedText>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, busy }}
        disabled={disabled}
        onPress={() => { void (user ? signOut() : signIn()); }}
        style={({ pressed }) => [styles.submit, { backgroundColor: theme.accent }, (pressed || disabled) && styles.dimmed]}>
        {busy && <ActivityIndicator color={theme.onAccent} />}
        <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>
          {busy ? 'Veuillez patienter…' : user ? 'Se déconnecter' : 'Se connecter'}
        </ThemedText>
        {!busy && <ThemedText accessible={false} style={[styles.arrow, { color: theme.onAccent }]}>→</ThemedText>}
      </Pressable>
      <ThemedText style={[LoginTypography.body, styles.help]} themeColor="textSecondary">Retrouvez vos commandes et le matériel qui vous correspond</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.four },
  notice: { borderWidth: 1, borderRadius: Radius.control, padding: Spacing.three, gap: Spacing.two },
  submit: { minHeight: ControlSize.primary, paddingHorizontal: Spacing.four, paddingVertical: Spacing.small, borderRadius: Radius.control, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  arrow: { fontSize: 22, lineHeight: 26 },
  help: { textAlign: 'center' },
  dimmed: { opacity: 0.75 },
});

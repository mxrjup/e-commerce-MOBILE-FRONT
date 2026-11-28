import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { type AuthMode, type AuthProviderId } from '@/services/keycloak';

type AuthMethodsProps = {
  mode: AuthMode;
  onSwitchMode: () => void;
};

export function AuthMethods({ mode, onSwitchMode }: AuthMethodsProps) {
  const theme = useTheme();
  const { user, busy, activeProvider, ready, error, signIn, register, signOut } = useAuth();
  const isRegister = mode === 'register';
  const disabled = busy || (!user && !ready);

  const handleSelectProvider = (provider: AuthProviderId) => {
    if (isRegister) {
      void register(provider);
    } else {
      void signIn({ mode: 'login', provider });
    }
  };

  return (
    <View style={styles.form}>
      {user ? (
        <View style={[styles.notice, { backgroundColor: theme.backgroundElement, borderColor: theme.borderStrong }]}>
          <ThemedText accessibilityLiveRegion="polite" style={LoginTypography.label}>Vous êtes connecté</ThemedText>
          <ThemedText style={LoginTypography.body}>
            {user.name || user.preferred_username || user.email || 'Votre compte'}
          </ThemedText>
        </View>
      ) : (
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">
          {isRegister
            ? 'Créez votre compte client en quelques secondes avec votre adresse e-mail ou votre compte Google / Apple.'
            : 'Choisissez votre méthode de connexion. Vous pourrez également réinitialiser votre mot de passe sur la page suivante.'}
        </ThemedText>
      )}

      {!!error && (
        <View style={[styles.notice, { backgroundColor: theme.backgroundElement, borderColor: theme.danger }]}>
          <ThemedText accessibilityRole="alert" accessibilityLiveRegion="polite" style={LoginTypography.body} themeColor="danger">
            {error}
          </ThemedText>
        </View>
      )}

      {user ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled, busy }}
          disabled={disabled}
          onPress={() => { void signOut(); }}
          style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.accent }, (pressed || disabled) && styles.dimmed]}>
          {busy && <ActivityIndicator color={theme.onAccent} />}
          <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>
            {busy ? 'Déconnexion…' : 'Se déconnecter'}
          </ThemedText>
        </Pressable>
      ) : (
        <View style={styles.methods}>
          {/* 1. Email */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRegister ? 'S’inscrire avec un e-mail' : 'Continuer avec un e-mail'}
            accessibilityState={{ disabled, busy: busy && activeProvider === 'email' }}
            disabled={disabled}
            onPress={() => handleSelectProvider('email')}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.accent }, (pressed || disabled) && styles.dimmed]}>
            {busy && activeProvider === 'email' ? (
              <ActivityIndicator color={theme.onAccent} />
            ) : (
              <ThemedText accessible={false} style={[styles.badgeIcon, { color: theme.onAccent }]}>✉</ThemedText>
            )}
            <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>
              {busy && activeProvider === 'email'
                ? 'Redirection…'
                : isRegister
                  ? 'S’inscrire avec un e-mail'
                  : 'Continuer avec un e-mail'}
            </ThemedText>
            {!(busy && activeProvider === 'email') && (
              <ThemedText accessible={false} style={[styles.arrow, { color: theme.onAccent }]}>→</ThemedText>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <ThemedText style={LoginTypography.label} themeColor="textMuted">ou</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* 2. Google */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRegister ? 'S’inscrire avec Google' : 'Continuer avec Google'}
            accessibilityState={{ disabled, busy: busy && activeProvider === 'google' }}
            disabled={disabled}
            onPress={() => handleSelectProvider('google')}
            style={({ pressed }) => [
              styles.socialButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.borderStrong },
              (pressed || disabled) && styles.dimmed,
            ]}>
            {busy && activeProvider === 'google' ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <View style={[styles.providerBadge, { borderColor: theme.border }]}>
                <ThemedText accessible={false} style={styles.googleGlyph}>G</ThemedText>
              </View>
            )}
            <ThemedText style={LoginTypography.button}>
              {busy && activeProvider === 'google'
                ? 'Connexion Google…'
                : isRegister
                  ? 'S’inscrire avec Google'
                  : 'Continuer avec Google'}
            </ThemedText>
          </Pressable>

          {/* 3. Apple */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRegister ? 'S’inscrire avec Apple' : 'Continuer avec Apple'}
            accessibilityState={{ disabled, busy: busy && activeProvider === 'apple' }}
            disabled={disabled}
            onPress={() => handleSelectProvider('apple')}
            style={({ pressed }) => [
              styles.socialButton,
              { backgroundColor: theme.hero, borderColor: theme.hero },
              (pressed || disabled) && styles.dimmed,
            ]}>
            {busy && activeProvider === 'apple' ? (
              <ActivityIndicator color={theme.onHero} />
            ) : (
              <View style={[styles.providerBadge, { borderColor: theme.borderStrong }]}>
                <ThemedText accessible={false} style={[styles.appleGlyph, { color: theme.onHero }]}></ThemedText>
              </View>
            )}
            <ThemedText style={[LoginTypography.button, { color: theme.onHero }]}>
              {busy && activeProvider === 'apple'
                ? 'Connexion Apple…'
                : isRegister
                  ? 'S’inscrire avec Apple'
                  : 'Continuer avec Apple'}
            </ThemedText>
          </Pressable>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={onSwitchMode}
        style={({ pressed }) => [styles.switchRow, (pressed || busy) && styles.dimmed]}>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">
          {isRegister ? 'Vous avez déjà un compte ? ' : 'Nouveau sur LOG ? '}
          <ThemedText style={[LoginTypography.body, styles.switchLink, { color: theme.accent }]}>
            {isRegister ? 'Se connecter' : 'Créer un compte'}
          </ThemedText>
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.four },
  notice: { borderWidth: 1, borderRadius: Radius.control, padding: Spacing.three, gap: Spacing.two },
  methods: { gap: Spacing.small },
  primaryButton: {
    minHeight: ControlSize.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.small,
    borderRadius: Radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.small,
  },
  socialButton: {
    minHeight: ControlSize.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.small,
    borderWidth: 1,
    borderRadius: Radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.small,
  },
  providerBadge: {
    width: 26,
    height: 26,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: { fontSize: 18, lineHeight: 22 },
  googleGlyph: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: '#4285F4' },
  appleGlyph: { fontSize: 17, lineHeight: 20 },
  arrow: { fontSize: 20, lineHeight: 24 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small, paddingVertical: Spacing.one },
  dividerLine: { flex: 1, height: 1 },
  switchRow: { minHeight: ControlSize.touch, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.one },
  switchLink: { fontWeight: '700', textDecorationLine: 'underline' },
  dimmed: { opacity: 0.7 },
});
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputInstance, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoginForm() {
  const theme = useTheme();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string>();
  const [notice, setNotice] = useState('');
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailError = submitted && !emailValid;
  const passwordError = submitted && !password;

  function submit() {
    setSubmitted(true);
    setNotice('');
    if (!emailValid) emailRef.current?.focus();
    else if (!password) passwordRef.current?.focus();
    else setNotice('La connexion est momentanément indisponible. Veuillez réessayer plus tard.');
  }

  const inputStyle = (name: string, invalid: boolean) => [
    styles.input,
    { backgroundColor: theme.background, borderColor: invalid ? theme.danger : focused === name ? theme.accent : theme.borderStrong },
    focused === name && styles.focused,
  ];

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <ThemedText nativeID="email-label" style={LoginTypography.label} themeColor="textMuted">Adresse e-mail</ThemedText>
        <TextInput
          ref={emailRef}
          accessibilityLabel="Adresse e-mail"
          accessibilityLabelledBy="email-label"
          aria-invalid={emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          value={email}
          onChangeText={(value) => { setEmail(value); setNotice(''); }}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(undefined)}
          placeholder="vous@exemple.fr"
          placeholderTextColor={theme.textMuted}
          style={[...inputStyle('email', emailError), styles.textInput, { color: theme.text }]}
        />
        {emailError && <ThemedText nativeID="email-error" accessibilityRole="alert" style={LoginTypography.body} themeColor="danger">Saisissez une adresse e-mail valide.</ThemedText>}
      </View>
      <View style={styles.field}>
        <ThemedText nativeID="password-label" style={LoginTypography.label} themeColor="textMuted">Mot de passe</ThemedText>
        <View style={inputStyle('password', passwordError)}>
          <TextInput
            ref={passwordRef}
            accessibilityLabel="Mot de passe"
            accessibilityLabelledBy="password-label"
            aria-invalid={passwordError}
            aria-describedby={passwordError ? 'password-error' : undefined}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            secureTextEntry={!visible}
            returnKeyType="go"
            onSubmitEditing={submit}
            value={password}
            onChangeText={(value) => { setPassword(value); setNotice(''); }}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(undefined)}
            placeholder="Votre mot de passe"
            placeholderTextColor={theme.textMuted}
            style={[styles.textInput, styles.password, { color: theme.text }]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            accessibilityState={{ expanded: visible }}
            onPress={() => setVisible(!visible)}
            style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}>
            <ThemedText style={styles.toggleText} themeColor="accent">{visible ? 'Masquer' : 'Afficher'}</ThemedText>
          </Pressable>
        </View>
        {passwordError && <ThemedText nativeID="password-error" accessibilityRole="alert" style={LoginTypography.body} themeColor="danger">Saisissez votre mot de passe.</ThemedText>}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => setNotice('La réinitialisation du mot de passe est momentanément indisponible. Veuillez réessayer plus tard.')}
        style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}>
        <ThemedText style={styles.link} themeColor="accent">Mot de passe oublié ?</ThemedText>
      </Pressable>
      {notice !== '' && (
        <View style={[styles.notice, { backgroundColor: theme.backgroundElement, borderColor: theme.borderStrong }]}>
          <ThemedText accessibilityRole="alert" accessibilityLiveRegion="polite" style={LoginTypography.body}>{notice}</ThemedText>
        </View>
      )}
      <Pressable accessibilityRole="button" onPress={submit} style={({ pressed }) => [styles.submit, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
        <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>Se connecter</ThemedText>
        <ThemedText accessible={false} style={[styles.arrow, { color: theme.onAccent }]}>→</ThemedText>
      </Pressable>
      <ThemedText style={[LoginTypography.body, styles.help]} themeColor="textSecondary">Retrouvez vos commandes et le matériel qui vous correspond</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.four },
  field: { gap: Spacing.two },
  input: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.control, minHeight: ControlSize.input },
  focused: { borderWidth: 2 },
  textInput: { ...LoginTypography.body, paddingHorizontal: Spacing.small, paddingVertical: Spacing.small, minHeight: ControlSize.input },
  password: { flex: 1, minWidth: 0 },
  toggle: { minHeight: ControlSize.touch, justifyContent: 'center', paddingHorizontal: Spacing.small },
  toggleText: { ...LoginTypography.body, fontWeight: '600' },
  forgot: { minHeight: ControlSize.touch, justifyContent: 'center', alignSelf: 'flex-end', marginTop: -Spacing.two },
  link: { ...LoginTypography.body, fontWeight: '600' },
  notice: { borderWidth: 1, borderRadius: Radius.control, padding: Spacing.three },
  submit: { minHeight: ControlSize.primary, paddingHorizontal: Spacing.four, paddingVertical: Spacing.small, borderRadius: Radius.control, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  arrow: { fontSize: 22, lineHeight: 26 },
  help: { textAlign: 'center' },
  pressed: { opacity: 0.75 },
});

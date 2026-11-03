import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoginTypography, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { LoginBrand } from './login-brand';
import { LoginForm } from './login-form';

export function LoginPage() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            <View style={[styles.layout, wide && styles.wide]}>
              {wide && (
                <View style={[styles.story, { backgroundColor: theme.hero }]}>
                  <LoginBrand inverse />
                  <View style={styles.storyContent}>
                    <ThemedText style={[LoginTypography.label, { color: theme.onHeroSecondary }]}>Le sens du bois</ThemedText>
                    <ThemedText accessibilityRole="header" style={[styles.storyTitle, { color: theme.onHero }]}>La matière brute.{'\n'}Les idées en plus.</ThemedText>
                    <ThemedText style={[LoginTypography.lead, { color: theme.onHeroSecondary }]}>Des pièces choisies avec soin, pour les projets qui vous ressemblent.</ThemedText>
                  </View>
                  <View style={[styles.storyFooter, { borderColor: theme.borderStrong }]}>
                    <ThemedText style={[LoginTypography.body, { color: theme.onHeroSecondary }]}>Du caractère, naturellement.</ThemedText>
                    <ThemedText accessible={false} style={{ color: theme.onHeroSecondary }}>◎</ThemedText>
                  </View>
                </View>
              )}
              <View style={[styles.main, wide && styles.mainWide]}>
                <View style={styles.topbar}>
                  {!wide ? <LoginBrand /> : <ThemedText style={LoginTypography.label} themeColor="textMuted">Votre espace personnel</ThemedText>}
                  <ThemedText style={LoginTypography.label} themeColor="textMuted">FR</ThemedText>
                </View>
                <View style={styles.formArea}>
                  <View style={styles.heading}>
                    <ThemedText style={LoginTypography.label} themeColor="textMuted">Heureux de vous retrouver</ThemedText>
                    <ThemedText accessibilityRole="header" style={LoginTypography.title}>Bienvenue{'\n'}chez vous.</ThemedText>
                    <ThemedText style={LoginTypography.lead} themeColor="textSecondary">Connectez-vous à votre compte</ThemedText>
                  </View>
                  <LoginForm />
                </View>
                <View style={[styles.footer, { borderColor: theme.border }]}>
                  <ThemedText style={LoginTypography.body} themeColor="textSecondary">LOG</ThemedText>
                  <ThemedText style={LoginTypography.body} themeColor="textMuted">Espace client</ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  layout: { flex: 1 },
  wide: { flexDirection: 'row', minHeight: 760 },
  story: { width: '45%', padding: Spacing.large, justifyContent: 'space-between', gap: Spacing.six },
  storyContent: { gap: Spacing.four, maxWidth: 420, paddingVertical: Spacing.six },
  storyTitle: { ...LoginTypography.title, fontSize: 48, lineHeight: 54, letterSpacing: -1.2 },
  storyFooter: { borderTopWidth: 1, paddingTop: Spacing.four, flexDirection: 'row', justifyContent: 'space-between' },
  main: { flex: 1, paddingHorizontal: Spacing.four },
  mainWide: { paddingHorizontal: Spacing.large },
  topbar: { paddingVertical: Spacing.five, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formArea: { flex: 1, justifyContent: 'center', alignSelf: 'center', width: '100%', maxWidth: 400, paddingVertical: Spacing.large, gap: Spacing.five },
  heading: { gap: Spacing.three },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.two, borderTopWidth: 1, paddingVertical: Spacing.four },
});

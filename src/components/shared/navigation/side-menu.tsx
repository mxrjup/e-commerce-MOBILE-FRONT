import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginBrand } from '@/components/shared/brand/login-brand';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export function SideMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const inCatalog = pathname === '/catalog' || pathname.startsWith('/catalog/');
  const { user, busy, signOut } = useAuth();
  const theme = useTheme();
  const close = () => setOpen(false);

  return (
    <>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le menu"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.iconButton, { borderColor: theme.border }, pressed && styles.dimmed]}>
          <ThemedText accessible={false} style={styles.icon}>☰</ThemedText>
        </Pressable>
        <LoginBrand />
      </View>
      <Modal visible={open} transparent animationType="none" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer le menu"
            onPress={close}
            style={styles.backdrop}
          />
          <SafeAreaView
            accessibilityViewIsModal
            onAccessibilityEscape={close}
            style={[styles.panel, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.menuContent}>
              <View style={styles.header}>
                <LoginBrand />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fermer le menu"
                  onPress={close}
                  style={({ pressed }) => [styles.iconButton, { borderColor: theme.border }, pressed && styles.dimmed]}>
                  <ThemedText accessible={false} style={styles.icon}>×</ThemedText>
                </Pressable>
              </View>
              <View style={[styles.account, { borderColor: theme.border }]}>
                <ThemedText style={LoginTypography.label} themeColor="textMuted">Mon compte</ThemedText>
                <ThemedText style={LoginTypography.lead}>{user ? user.name || user.preferred_username || 'Votre compte' : 'Invité'}</ThemedText>
                {!!user?.email && <ThemedText style={LoginTypography.body} themeColor="textSecondary">{user.email}</ThemedText>}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: pathname === '/home' }}
                onPress={() => { close(); router.navigate('/home'); }}
                style={({ pressed }) => [styles.menuItem, { backgroundColor: pathname === '/home' ? theme.backgroundSelected : theme.background }, pressed && styles.dimmed]}>
                <ThemedText style={LoginTypography.button}>Accueil</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: inCatalog }}
                onPress={() => { close(); router.navigate('/catalog'); }}
                style={({ pressed }) => [styles.menuItem, { borderColor: theme.border, borderWidth: 1, backgroundColor: inCatalog ? theme.backgroundSelected : theme.background }, pressed && styles.dimmed]}>
                <ThemedText style={LoginTypography.button}>Catalogue</ThemedText>
              </Pressable>
              <View style={styles.spacer} />
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !!user && busy, busy: !!user && busy }}
                disabled={!!user && busy}
                onPress={() => { close(); if (user) { void signOut(); } else { router.navigate('/login'); } }}
                style={({ pressed }) => [styles.menuItem, { borderColor: theme.border, borderWidth: 1 }, (pressed || (!!user && busy)) && styles.dimmed]}>
                <ThemedText style={LoginTypography.button} themeColor={user ? 'danger' : 'text'}>{user ? 'Se déconnecter' : 'Se connecter'}</ThemedText>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  iconButton: { width: ControlSize.touch, minHeight: ControlSize.touch, borderWidth: 1, borderRadius: Radius.control, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 26, lineHeight: 32 },
  overlay: { flex: 1 },
  backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  panel: { width: '85%', maxWidth: 360, flex: 1 },
  menuContent: { flexGrow: 1, padding: Spacing.four, gap: Spacing.four },
  account: { borderBottomWidth: 1, paddingBottom: Spacing.four, gap: Spacing.two },
  menuItem: { minHeight: ControlSize.primary, padding: Spacing.three, borderRadius: Radius.control, justifyContent: 'center' },
  spacer: { flex: 1 },
  dimmed: { opacity: 0.75 },
});


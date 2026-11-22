import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddressCard } from '@/components/pages/profile/address-card';
import { AddressForm } from '@/components/pages/profile/address-form';
import { ProfileDetailsCard } from '@/components/pages/profile/profile-details-card';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/services/api-client';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchUserProfile,
  setDefaultAddress,
  updateAddress,
  updateUserProfile,
  type Address,
  type AddressPayload,
  type UserProfile,
  type UserProfileUpdatePayload,
} from '@/services/user-profile-api';

type AddressEditorState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; address: Address };

export function ProfilePage() {
  const theme = useTheme();
  const { user, ready } = useAuth();
  const api = useApi();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [editor, setEditor] = useState<AddressEditorState>({ mode: 'closed' });
  const [addressBusy, setAddressBusy] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');

  const loadData = useCallback(async (signal?: AbortSignal) => {
    if (!user) return;
    setLoading(true);
    setLoadError('');
    try {
      const [loadedProfile, loadedAddresses] = await Promise.all([
        fetchUserProfile(api, signal),
        fetchAddresses(api, signal),
      ]);
      if (signal?.aborted) return;
      setProfile(loadedProfile);
      setAddresses(loadedAddresses);
    } catch (cause) {
      if (signal?.aborted) return;
      setLoadError(getApiErrorMessage(cause));
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [api, user]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setAddresses([]);
      setLoadError('');
      setEditor({ mode: 'closed' });
      return;
    }
    const controller = new AbortController();
    void loadData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadData, user]);

  async function handleSaveProfile(payload: UserProfileUpdatePayload): Promise<boolean> {
    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const updated = await updateUserProfile(api, payload);
      setProfile(updated);
      setProfileSuccess('Vos informations ont été mises à jour.');
      return true;
    } catch (cause) {
      setProfileError(getApiErrorMessage(cause));
      return false;
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddressSubmit(payload: AddressPayload) {
    if (editor.mode === 'closed') return;
    setAddressBusy(true);
    setAddressError('');
    setAddressSuccess('');
    try {
      if (editor.mode === 'create') {
        await createAddress(api, payload);
        setAddressSuccess('Adresse ajoutée à votre carnet.');
      } else {
        await updateAddress(api, editor.address.id, payload);
        setAddressSuccess('Adresse mise à jour.');
      }
      const refreshed = await fetchAddresses(api);
      setAddresses(refreshed);
      setEditor({ mode: 'closed' });
    } catch (cause) {
      setAddressError(getApiErrorMessage(cause));
    } finally {
      setAddressBusy(false);
    }
  }

  async function handleSetDefault(id: number) {
    setAddressBusy(true);
    setAddressError('');
    setAddressSuccess('');
    try {
      await setDefaultAddress(api, id);
      const refreshed = await fetchAddresses(api);
      setAddresses(refreshed);
      setAddressSuccess('Adresse par défaut mise à jour.');
    } catch (cause) {
      setAddressError(getApiErrorMessage(cause));
    } finally {
      setAddressBusy(false);
    }
  }

  async function handleDeleteAddress(id: number) {
    setAddressBusy(true);
    setAddressError('');
    setAddressSuccess('');
    try {
      await deleteAddress(api, id);
      const refreshed = await fetchAddresses(api);
      setAddresses(refreshed);
      if (editor.mode === 'edit' && editor.address.id === id) {
        setEditor({ mode: 'closed' });
      }
      setAddressSuccess('Adresse supprimée.');
    } catch (cause) {
      setAddressError(getApiErrorMessage(cause));
    } finally {
      setAddressBusy(false);
    }
  }

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.root}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <SideMenu />

            <View style={styles.pageHeader}>
              <ThemedText accessibilityRole="header" style={LoginTypography.title}>
                Mon profil
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={LoginTypography.body}>
                Gérez vos informations personnelles et vos adresses de livraison.
              </ThemedText>
            </View>

            {!user && ready ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText style={LoginTypography.body}>
                  Connectez-vous pour consulter votre profil et gérer votre carnet d’adresses.
                </ThemedText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.navigate('/login')}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { backgroundColor: theme.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>
                    Se connecter
                  </ThemedText>
                </Pressable>
              </View>
            ) : loading || !ready ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText style={LoginTypography.body}>Chargement de votre profil…</ThemedText>
              </View>
            ) : loadError ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>{loadError}</ThemedText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadData()}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { backgroundColor: theme.background, borderColor: theme.borderStrong },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText style={styles.secondaryButtonText}>Réessayer</ThemedText>
                </Pressable>
              </View>
            ) : (
              <>
                {profile && (
                  <ProfileDetailsCard
                    profile={profile}
                    saving={savingProfile}
                    saveError={profileError}
                    saveSuccess={profileSuccess}
                    onSave={handleSaveProfile}
                    onClearFeedback={() => {
                      setProfileError('');
                      setProfileSuccess('');
                    }}
                  />
                )}

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionHeadingText}>
                      <ThemedText accessibilityRole="header" style={styles.sectionTitle}>
                        Carnet d’adresses
                      </ThemedText>
                      <ThemedText style={LoginTypography.body} themeColor="textSecondary">
                        {addresses.length === 0
                          ? 'Aucune adresse enregistrée'
                          : `${addresses.length} adresse${addresses.length > 1 ? 's' : ''} enregistrée${addresses.length > 1 ? 's' : ''}`}
                      </ThemedText>
                    </View>

                    {editor.mode === 'closed' && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Ajouter une adresse"
                        onPress={() => {
                          setAddressError('');
                          setAddressSuccess('');
                          setEditor({ mode: 'create' });
                        }}
                        style={({ pressed }) => [
                          styles.addAddressButton,
                          { backgroundColor: theme.accent },
                          pressed && styles.pressed,
                        ]}
                      >
                        <ThemedText style={[styles.addAddressText, { color: theme.onAccent }]}>
                          Ajouter une adresse
                        </ThemedText>
                      </Pressable>
                    )}
                  </View>

                  {!!addressSuccess && (
                    <View
                      accessibilityLiveRegion="polite"
                      style={[styles.banner, { backgroundColor: theme.okSoft }]}
                    >
                      <ThemedText style={[LoginTypography.body, { color: theme.ok }]}>
                        {addressSuccess}
                      </ThemedText>
                    </View>
                  )}

                  {!!addressError && editor.mode === 'closed' && (
                    <View
                      accessibilityLiveRegion="polite"
                      style={[styles.banner, { backgroundColor: theme.dangerSoft }]}
                    >
                      <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>
                        {addressError}
                      </ThemedText>
                    </View>
                  )}

                  {editor.mode !== 'closed' && (
                    <AddressForm
                      key={editor.mode === 'edit' ? `edit-${editor.address.id}` : 'create'}
                      initialAddress={editor.mode === 'edit' ? editor.address : undefined}
                      submitting={addressBusy}
                      submitError={addressError}
                      onSubmit={handleAddressSubmit}
                      onCancel={() => {
                        setAddressError('');
                        setEditor({ mode: 'closed' });
                      }}
                    />
                  )}

                  {addresses.length === 0 && editor.mode === 'closed' ? (
                    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      <ThemedText style={LoginTypography.body} themeColor="textSecondary">
                        Vous n’avez pas encore enregistré d’adresse de livraison.
                      </ThemedText>
                    </View>
                  ) : (
                    addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        busy={addressBusy}
                        onEdit={(selected) => {
                          setAddressError('');
                          setAddressSuccess('');
                          setEditor({ mode: 'edit', address: selected });
                        }}
                        onSetDefault={handleSetDefault}
                        onDelete={handleDeleteAddress}
                      />
                    ))
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.four,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: Spacing.five,
  },
  pageHeader: {
    gap: Spacing.two,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.small,
    flexWrap: 'wrap',
  },
  sectionHeadingText: {
    gap: Spacing.one,
  },
  sectionTitle: {
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  banner: {
    borderRadius: Radius.panel,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.small,
  },
  primaryButton: {
    minHeight: ControlSize.primary,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressButton: {
    minHeight: ControlSize.input,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  secondaryButton: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.78,
  },
});
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { fetchUserProfile, updateUserProfile } from '@/services/user';
import { UserProfile, UserProfileUpdateRequest } from '@/types/user';
import { ProfileForm } from './profile-form';

interface ProfilePageProps {
  isAuthenticated: boolean;
  isAuthBusy: boolean;
  getAccessToken: () => Promise<string | null>;
  onSignOut: () => Promise<void>;
}

export function ProfilePage({
  isAuthenticated,
  isAuthBusy,
  getAccessToken,
  onSignOut,
}: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(isAuthenticated);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    getAccessToken()
      .then((token) => {
        if (!token) {
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
        }
        return fetchUserProfile(token, controller.signal);
      })
      .then((data) => {
        if (!isActive) return;
        setProfile(data);
        setLoadError(null);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isActive || (err as Error).name === 'AbortError') return;
        setLoadError(
          err instanceof Error
            ? err.message
            : 'Impossible de charger vos informations.'
        );
        setIsLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [isAuthenticated, getAccessToken, reloadKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    setReloadKey((prev) => prev + 1);
  };

  const handleSubmit = async (payload: UserProfileUpdateRequest) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
      }
      const updated = await updateUserProfile(token, payload);
      setProfile(updated);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'L’enregistrement a échoué. Vos saisies sont conservées.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthBusy && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredBlock}>
          <ActivityIndicator color="#9A5518" />
          <Text style={styles.bodyText}>Vérification de la session…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredBlock}>
          <Text style={styles.title}>Mon compte</Text>
          <Text style={styles.bodyText}>
            Connectez-vous pour consulter et modifier vos informations personnelles.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push('/login')}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Se connecter</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Retour"
            >
              <Text style={styles.backButtonText}>← Retour</Text>
            </Pressable>
            <Text style={styles.title}>Mon profil</Text>
          </View>

          {isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color="#9A5518" />
              <Text style={styles.bodyText}>Chargement du profil…</Text>
            </View>
          ) : loadError ? (
            <View style={styles.stateBox}>
              <View style={styles.bannerDanger} accessibilityRole="alert">
                <Text style={styles.bannerDangerText}>{loadError}</Text>
              </View>
              <Pressable
                style={styles.secondaryButton}
                onPress={handleRetry}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryButtonText}>Réessayer</Text>
              </Pressable>
            </View>
          ) : profile ? (
            <ProfileForm
              profile={profile}
              isSubmitting={isSubmitting}
              submitError={submitError}
              submitSuccess={submitSuccess}
              onSubmit={handleSubmit}
            />
          ) : null}

          <View style={styles.divider} />

          <View style={styles.actionsSection}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/addresses' as never)}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Carnet d’adresses</Text>
            </Pressable>

            <Pressable
              style={styles.dangerButton}
              onPress={onSignOut}
              accessibilityRole="button"
            >
              <Text style={styles.dangerButtonText}>Se déconnecter</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  header: { marginBottom: 24, gap: 12 },
  backButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingRight: 12 },
  backButtonText: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '600', color: '#55504A' },
  title: { fontFamily: 'Manrope', fontSize: 28, fontWeight: '800', lineHeight: 32, letterSpacing: -0.7, color: '#17150F' },
  bodyText: { fontFamily: 'Manrope', fontSize: 17, lineHeight: 25, color: '#55504A' },
  centeredBlock: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, gap: 16 },
  stateBox: { paddingVertical: 24, gap: 16 },
  bannerDanger: { backgroundColor: '#FBEAE8', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 18 },
  bannerDangerText: { fontFamily: 'Manrope', fontSize: 14, color: '#17150F' },
  divider: { height: 1, backgroundColor: '#E3DFD8', marginVertical: 32 },
  actionsSection: { gap: 12 },
  primaryButton: { height: 52, backgroundColor: '#9A5518', borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  primaryButtonText: { fontFamily: 'Manrope', fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  secondaryButton: { height: 44, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#938B80', borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
  secondaryButtonText: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '600', color: '#17150F' },
  dangerButton: { height: 44, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#B3261E', borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
  dangerButtonText: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '600', color: '#B3261E' },
});
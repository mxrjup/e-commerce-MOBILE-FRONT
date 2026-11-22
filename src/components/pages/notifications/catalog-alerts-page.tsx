import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CatalogAlertCard } from '@/components/pages/notifications/catalog-alert-card';
import { CatalogAlertForm } from '@/components/pages/notifications/catalog-alert-form';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/services/api-client';
import {
  createCatalogAlert,
  deleteCatalogAlert,
  fetchCatalogAlerts,
  updateCatalogAlert,
  type CatalogAlert,
  type CreateCatalogAlertPayload,
  type UpdateCatalogAlertPayload,
} from '@/services/notifications-api';

type LoadedAlertsState = {
  user: ReturnType<typeof useAuth>['user'];
  api: ReturnType<typeof useApi>;
  alerts: CatalogAlert[];
  error: string;
};

export function CatalogAlertsPage() {
  const theme = useTheme();
  const { user, ready } = useAuth();
  const api = useApi();

  const [result, setResult] = useState<LoadedAlertsState>();
  const [reloadKey, setReloadKey] = useState(0);
  const [activeOnly, setActiveOnly] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const current = user && result?.user === user && result.api === api ? result : undefined;
  const allAlerts = current?.alerts ?? [];
  const loadError = current?.error ?? '';
  const loading = !!user && !current;
  const isCreating = !!user && creating;

  const visibleAlerts = activeOnly
    ? allAlerts.filter((item) => item.active)
    : allAlerts;

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    fetchCatalogAlerts(api, { activeOnly: false, signal: controller.signal })
      .then((alerts) => {
        if (controller.signal.aborted) return;
        setResult({
          user,
          api,
          alerts,
          error: '',
        });
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setResult({
          user,
          api,
          alerts: [],
          error: getApiErrorMessage(cause),
        });
      });

    return () => {
      controller.abort();
    };
  }, [api, user, reloadKey]);

  function retryLoad() {
    setResult(undefined);
    setReloadKey((value) => value + 1);
  }

  async function handleCreate(payload: CreateCatalogAlertPayload) {
    if (!user || busy) return;
    setBusy(true);
    setActionError('');
    setActionSuccess('');
    try {
      await createCatalogAlert(api, payload);
      const refreshed = await fetchCatalogAlerts(api, { activeOnly: false });
      setResult({
        user,
        api,
        alerts: refreshed,
        error: '',
      });
      setCreating(false);
      setActionSuccess('Alerte enregistrée.');
    } catch (cause) {
      setActionError(getApiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id: number, payload: UpdateCatalogAlertPayload): Promise<boolean> {
    if (!user || busy) return false;
    setBusy(true);
    setActionError('');
    setActionSuccess('');
    try {
      await updateCatalogAlert(api, id, payload);
      const refreshed = await fetchCatalogAlerts(api, { activeOnly: false });
      setResult({
        user,
        api,
        alerts: refreshed,
        error: '',
      });
      setActionSuccess('Alerte mise à jour.');
      return true;
    } catch (cause) {
      setActionError(getApiErrorMessage(cause));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    if (!user || busy) return;
    setBusy(true);
    setActionError('');
    setActionSuccess('');
    try {
      await deleteCatalogAlert(api, id);
      const refreshed = await fetchCatalogAlerts(api, { activeOnly: false });
      setResult({
        user,
        api,
        alerts: refreshed,
        error: '',
      });
      setActionSuccess('Alerte supprimée.');
    } catch (cause) {
      setActionError(getApiErrorMessage(cause));
    } finally {
      setBusy(false);
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

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour au centre de notifications"
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace('/notifications')
              }
              style={({ pressed }) => [
                styles.backButton,
                { borderColor: theme.borderStrong },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>← Notifications</ThemedText>
            </Pressable>

            <View style={styles.pageHeader}>
              <ThemedText accessibilityRole="header" style={LoginTypography.title}>
                Alertes prix et stock
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={LoginTypography.body}>
                Soyez informé dès qu’un produit baisse sous votre prix cible ou revient en stock.
              </ThemedText>
            </View>

            {!user && ready ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText style={LoginTypography.body}>
                  Connectez-vous pour gérer vos alertes de prix et de retour en stock.
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
                <ThemedText style={LoginTypography.body}>Chargement de vos alertes…</ThemedText>
              </View>
            ) : loadError ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>{loadError}</ThemedText>
                <Pressable
                  accessibilityRole="button"
                  onPress={retryLoad}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { backgroundColor: theme.background, borderColor: theme.borderStrong },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText style={styles.buttonText}>Réessayer</ThemedText>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.toolbar}>
                  <View style={styles.filters}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: !activeOnly }}
                      onPress={() => setActiveOnly(false)}
                      style={({ pressed }) => [
                        styles.filterChip,
                        {
                          backgroundColor: !activeOnly ? theme.accent : theme.background,
                          borderColor: !activeOnly ? theme.accent : theme.borderStrong,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: !activeOnly ? theme.onAccent : theme.text },
                        ]}
                      >
                        {`Toutes (${allAlerts.length})`}
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: activeOnly }}
                      onPress={() => setActiveOnly(true)}
                      style={({ pressed }) => [
                        styles.filterChip,
                        {
                          backgroundColor: activeOnly ? theme.accent : theme.background,
                          borderColor: activeOnly ? theme.accent : theme.borderStrong,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: activeOnly ? theme.onAccent : theme.text },
                        ]}
                      >
                        {`Actives (${allAlerts.filter((item) => item.active).length})`}
                      </ThemedText>
                    </Pressable>
                  </View>

                  {!isCreating && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Créer une nouvelle alerte"
                      onPress={() => {
                        setActionError('');
                        setActionSuccess('');
                        setCreating(true);
                      }}
                      style={({ pressed }) => [
                        styles.primaryCompactButton,
                        { backgroundColor: theme.accent },
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText style={[styles.buttonText, { color: theme.onAccent }]}>
                        Nouvelle alerte
                      </ThemedText>
                    </Pressable>
                  )}
                </View>

                {!!actionSuccess && (
                  <View
                    accessibilityLiveRegion="polite"
                    style={[styles.banner, { backgroundColor: theme.okSoft }]}
                  >
                    <ThemedText style={[LoginTypography.body, { color: theme.ok }]}>
                      {actionSuccess}
                    </ThemedText>
                  </View>
                )}

                {!!actionError && !isCreating && (
                  <View
                    accessibilityLiveRegion="polite"
                    style={[styles.banner, { backgroundColor: theme.dangerSoft }]}
                  >
                    <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>
                      {actionError}
                    </ThemedText>
                  </View>
                )}

                {isCreating && (
                  <CatalogAlertForm
                    submitting={busy}
                    submitError={actionError}
                    onSubmit={handleCreate}
                    onCancel={() => {
                      setActionError('');
                      setCreating(false);
                    }}
                  />
                )}

                {visibleAlerts.length === 0 && !isCreating ? (
                  <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <ThemedText style={LoginTypography.body} themeColor="textSecondary">
                      {activeOnly
                        ? 'Aucune alerte active pour le moment.'
                        : 'Vous n’avez configuré aucune alerte prix ou retour en stock.'}
                    </ThemedText>
                  </View>
                ) : (
                  visibleAlerts.map((alert) => (
                    <CatalogAlertCard
                      key={alert.id}
                      alert={alert}
                      busy={busy}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))
                )}
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
  backButton: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.small,
    flexWrap: 'wrap',
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  filterChip: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
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
  primaryCompactButton: {
    minHeight: ControlSize.input,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.78,
  },
});
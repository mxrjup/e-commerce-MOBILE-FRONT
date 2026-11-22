import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationItemCard } from '@/components/pages/notifications/notification-item-card';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/services/api-client';
import {
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type UserNotification,
} from '@/services/notifications-api';

type LoadedNotificationsState = {
  user: ReturnType<typeof useAuth>['user'];
  api: ReturnType<typeof useApi>;
  notifications: UserNotification[];
  unreadCount: number;
  error: string;
};

export function NotificationsPage() {
  const theme = useTheme();
  const { user, ready } = useAuth();
  const api = useApi();

  const [result, setResult] = useState<LoadedNotificationsState>();
  const [reloadKey, setReloadKey] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const current = user && result?.user === user && result.api === api ? result : undefined;
  const allNotifications = current?.notifications ?? [];
  const unreadCount = current?.unreadCount ?? 0;
  const loadError = current?.error ?? '';
  const loading = !!user && !current;

  const visibleNotifications = unreadOnly
    ? allNotifications.filter((item) => !item.read)
    : allNotifications;

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    Promise.all([
      fetchNotifications(api, { unreadOnly: false, signal: controller.signal }),
      fetchUnreadNotificationsCount(api, controller.signal),
    ])
      .then(([notifications, count]) => {
        if (controller.signal.aborted) return;
        setResult({
          user,
          api,
          notifications,
          unreadCount: count,
          error: '',
        });
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setResult({
          user,
          api,
          notifications: [],
          unreadCount: 0,
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

  async function handleMarkRead(id: number) {
    if (!user || actionBusy) return;
    setActionBusy(true);
    setActionError('');
    setActionSuccess('');
    try {
      const updated = await markNotificationAsRead(api, id);
      setResult((prev) => {
        const previousList = prev?.notifications ?? [];
        const nextList = previousList.map((item) => (item.id === id ? updated : item));
        const nextUnread = nextList.filter((item) => !item.read).length;
        return {
          user,
          api,
          notifications: nextList,
          unreadCount: nextUnread,
          error: '',
        };
      });
    } catch (cause) {
      setActionError(getApiErrorMessage(cause));
    } finally {
      setActionBusy(false);
    }
  }

  async function handleMarkAllRead() {
    if (!user || actionBusy || unreadCount === 0) return;
    setActionBusy(true);
    setActionError('');
    setActionSuccess('');
    try {
      await markAllNotificationsAsRead(api);
      const nowIso = new Date().toISOString();
      setResult((prev) => ({
        user,
        api,
        notifications: (prev?.notifications ?? []).map((item) =>
          item.read ? item : { ...item, read: true, readAt: nowIso }
        ),
        unreadCount: 0,
        error: '',
      }));
      setActionSuccess('Toutes vos notifications ont été marquées comme lues.');
    } catch (cause) {
      setActionError(getApiErrorMessage(cause));
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <SideMenu />

          <View style={styles.pageHeader}>
            <ThemedText accessibilityRole="header" style={LoginTypography.title}>
              Notifications
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={LoginTypography.body}>
              Suivez vos alertes de prix, retours en stock et mises à jour de commande.
            </ThemedText>
          </View>

          {!user && ready ? (
            <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <ThemedText style={LoginTypography.body}>
                Connectez-vous pour consulter vos notifications et configurer vos alertes.
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
              <ThemedText style={LoginTypography.body}>Chargement de vos notifications…</ThemedText>
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
              <View style={[styles.alertsBanner, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <View style={styles.alertsBannerText}>
                  <ThemedText style={LoginTypography.label} themeColor="textMuted">
                    Alertes catalogue
                  </ThemedText>
                  <ThemedText style={LoginTypography.body}>
                    Configurez des alertes de baisse de prix ou de retour en stock sur vos produits.
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Configurer mes alertes prix et retour en stock"
                  onPress={() => router.navigate('/notifications/alerts')}
                  style={({ pressed }) => [
                    styles.primaryCompactButton,
                    { backgroundColor: theme.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText style={[styles.primaryCompactText, { color: theme.onAccent }]}>
                    Configurer mes alertes
                  </ThemedText>
                </Pressable>
              </View>

              <View style={styles.toolbar}>
                <View style={styles.filters}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: !unreadOnly }}
                    onPress={() => setUnreadOnly(false)}
                    style={({ pressed }) => [
                      styles.filterChip,
                      {
                        backgroundColor: !unreadOnly ? theme.accent : theme.background,
                        borderColor: !unreadOnly ? theme.accent : theme.borderStrong,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.chipText,
                        { color: !unreadOnly ? theme.onAccent : theme.text },
                      ]}
                    >
                      {`Toutes (${allNotifications.length})`}
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: unreadOnly }}
                    onPress={() => setUnreadOnly(true)}
                    style={({ pressed }) => [
                      styles.filterChip,
                      {
                        backgroundColor: unreadOnly ? theme.accent : theme.background,
                        borderColor: unreadOnly ? theme.accent : theme.borderStrong,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.chipText,
                        { color: unreadOnly ? theme.onAccent : theme.text },
                      ]}
                    >
                      {`Non lues (${unreadCount})`}
                    </ThemedText>
                  </Pressable>
                </View>

                {unreadCount > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Marquer toutes les notifications comme lues"
                    accessibilityState={{ disabled: actionBusy, busy: actionBusy }}
                    disabled={actionBusy}
                    onPress={() => void handleMarkAllRead()}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      { backgroundColor: theme.background, borderColor: theme.borderStrong },
                      (pressed || actionBusy) && styles.pressed,
                    ]}
                  >
                    <ThemedText style={styles.buttonText}>Tout marquer comme lu</ThemedText>
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

              {!!actionError && (
                <View
                  accessibilityLiveRegion="polite"
                  style={[styles.banner, { backgroundColor: theme.dangerSoft }]}
                >
                  <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>
                    {actionError}
                  </ThemedText>
                </View>
              )}

              {visibleNotifications.length === 0 ? (
                <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <ThemedText style={LoginTypography.body} themeColor="textSecondary">
                    {unreadOnly
                      ? 'Vous n’avez aucune notification non lue.'
                      : 'Vous n’avez reçu aucune notification pour le moment.'}
                  </ThemedText>
                </View>
              ) : (
                visibleNotifications.map((notification) => (
                  <NotificationItemCard
                    key={notification.id}
                    notification={notification}
                    busy={actionBusy}
                    onMarkRead={handleMarkRead}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>
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
  alertsBanner: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.small,
  },
  alertsBannerText: {
    gap: Spacing.one,
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
    alignSelf: 'flex-start',
  },
  primaryCompactText: {
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
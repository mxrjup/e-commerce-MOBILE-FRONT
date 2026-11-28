import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportTicketCard } from '@/components/pages/support/support-ticket-card';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/services/api-client';
import {
  fetchMySupportTickets,
  isTicketActiveStatus,
  type SupportTicketSummary,
} from '@/services/support-api';

type TicketFilter = 'ALL' | 'ACTIVE' | 'CLOSED';

type LoadedSupportState = {
  user: ReturnType<typeof useAuth>['user'];
  api: ReturnType<typeof useApi>;
  tickets: SupportTicketSummary[];
  error: string;
};

export function SupportPage() {
  const theme = useTheme();
  const { user, ready } = useAuth();
  const api = useApi();

  const [result, setResult] = useState<LoadedSupportState>();
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<TicketFilter>('ALL');

  const current = user && result?.user === user && result.api === api ? result : undefined;
  const allTickets = current?.tickets ?? [];
  const loadError = current?.error ?? '';
  const loading = !!user && !current;

  const activeCount = allTickets.filter((ticket) => isTicketActiveStatus(ticket.status)).length;
  const closedCount = allTickets.length - activeCount;

  const visibleTickets = allTickets.filter((ticket) => {
    if (filter === 'ACTIVE') return isTicketActiveStatus(ticket.status);
    if (filter === 'CLOSED') return !isTicketActiveStatus(ticket.status);
    return true;
  });

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    fetchMySupportTickets(api, { signal: controller.signal })
      .then((tickets) => {
        if (controller.signal.aborted) return;
        setResult({ user, api, tickets, error: '' });
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setResult({
          user,
          api,
          tickets: [],
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

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <SideMenu />

          <View style={styles.pageHeader}>
            <ThemedText accessibilityRole="header" style={LoginTypography.title}>
              Service après-vente
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={LoginTypography.body}>
              Ouvrez une demande d’assistance liée à une commande et échangez avec notre équipe.
            </ThemedText>
          </View>

          {!user && ready ? (
            <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <ThemedText style={LoginTypography.body}>
                Connectez-vous pour consulter vos tickets SAV et contacter le support.
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
              <ThemedText style={LoginTypography.body}>Chargement de vos tickets SAV…</ThemedText>
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
              <View style={[styles.ctaCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <View style={styles.ctaText}>
                  <ThemedText style={LoginTypography.label} themeColor="textMuted">
                    Besoin d’aide ?
                  </ThemedText>
                  <ThemedText style={LoginTypography.body}>
                    Créez un ticket à partir d’une commande ou posez une question à un conseiller.
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Créer un nouveau ticket SAV"
                  onPress={() => router.navigate('/support/new')}
                  style={({ pressed }) => [
                    styles.primaryCompactButton,
                    { backgroundColor: theme.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText style={[styles.buttonText, { color: theme.onAccent }]}>
                    Nouveau ticket
                  </ThemedText>
                </Pressable>
              </View>

              <View style={styles.filters}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === 'ALL' }}
                  onPress={() => setFilter('ALL')}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: filter === 'ALL' ? theme.accent : theme.background,
                      borderColor: filter === 'ALL' ? theme.accent : theme.borderStrong,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText
                    style={[styles.chipText, { color: filter === 'ALL' ? theme.onAccent : theme.text }]}
                  >
                    {`Tous (${allTickets.length})`}
                  </ThemedText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === 'ACTIVE' }}
                  onPress={() => setFilter('ACTIVE')}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: filter === 'ACTIVE' ? theme.accent : theme.background,
                      borderColor: filter === 'ACTIVE' ? theme.accent : theme.borderStrong,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText
                    style={[styles.chipText, { color: filter === 'ACTIVE' ? theme.onAccent : theme.text }]}
                  >
                    {`En cours (${activeCount})`}
                  </ThemedText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === 'CLOSED' }}
                  onPress={() => setFilter('CLOSED')}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: filter === 'CLOSED' ? theme.accent : theme.background,
                      borderColor: filter === 'CLOSED' ? theme.accent : theme.borderStrong,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText
                    style={[styles.chipText, { color: filter === 'CLOSED' ? theme.onAccent : theme.text }]}
                  >
                    {`Résolus / fermés (${closedCount})`}
                  </ThemedText>
                </Pressable>
              </View>

              {visibleTickets.length === 0 ? (
                <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <ThemedText style={LoginTypography.body} themeColor="textSecondary">
                    {filter === 'ALL'
                      ? 'Vous n’avez ouvert aucun ticket SAV pour le moment.'
                      : 'Aucun ticket dans cette catégorie.'}
                  </ThemedText>
                </View>
              ) : (
                visibleTickets.map((ticket) => (
                  <SupportTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onPress={(ticketId) =>
                      router.navigate({ pathname: '/support/[id]', params: { id: String(ticketId) } })
                    }
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
  ctaCard: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.small,
  },
  ctaText: {
    gap: Spacing.one,
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

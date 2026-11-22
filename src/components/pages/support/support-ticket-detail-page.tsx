import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TicketStatusBadge } from '@/components/pages/support/ticket-status-badge';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/services/api-client';
import {
  addSupportTicketMessage,
  fetchSupportTicketDetail,
  getTicketCategoryLabel,
  parsePositiveTicketId,
  validateTicketReply,
  type SupportTicketDetail,
} from '@/services/support-api';

type LoadedTicketDetailState = {
  ticketId: number;
  user: ReturnType<typeof useAuth>['user'];
  api: ReturnType<typeof useApi>;
  ticket: SupportTicketDetail | null;
  error: string;
};

export function SupportTicketDetailPage() {
  const theme = useTheme();
  const { user, ready } = useAuth();
  const api = useApi();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  const rawId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] ?? '' : '';
  const ticketId = parsePositiveTicketId(rawId);

  const [result, setResult] = useState<LoadedTicketDetailState>();
  const [reloadKey, setReloadKey] = useState(0);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const replyInputRef = useRef<ComponentRef<typeof TextInput>>(null);

  const current =
    user && ticketId && result?.ticketId === ticketId && result.user === user && result.api === api
      ? result
      : undefined;

  const ticket = current?.ticket ?? null;
  const loadError = current?.error ?? '';
  const loading = !!user && !!ticketId && !current;

  useEffect(() => {
    if (!user || !ticketId) return;
    const controller = new AbortController();

    fetchSupportTicketDetail(api, ticketId, controller.signal)
      .then((detail) => {
        if (controller.signal.aborted) return;
        setResult({
          ticketId,
          user,
          api,
          ticket: detail,
          error: '',
        });
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setResult({
          ticketId,
          user,
          api,
          ticket: null,
          error: getApiErrorMessage(cause),
        });
      });

    return () => {
      controller.abort();
    };
  }, [api, user, ticketId, reloadKey]);

  function retryLoad() {
    setResult(undefined);
    setReloadKey((value) => value + 1);
  }

  async function handleSendReply() {
    if (!user || !ticket || sending || ticket.status === 'CLOSED') return;

    const validationError = validateTicketReply(replyContent);
    setReplyError(validationError);
    setSendError('');
    if (validationError) {
      replyInputRef.current?.focus();
      return;
    }

    setSending(true);
    try {
      await addSupportTicketMessage(api, ticket.id, { content: replyContent.trim() });
      const refreshed = await fetchSupportTicketDetail(api, ticket.id);
      setResult({
        ticketId: ticket.id,
        user,
        api,
        ticket: refreshed,
        error: '',
      });
      setReplyContent('');
    } catch (cause) {
      setSendError(getApiErrorMessage(cause));
    } finally {
      setSending(false);
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

            <View style={styles.navRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour aux tickets SAV"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/support'))}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { borderColor: theme.borderStrong },
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText style={styles.buttonText}>← Tickets SAV</ThemedText>
              </Pressable>

              {!!ticket && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Actualiser la conversation"
                  onPress={retryLoad}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { borderColor: theme.borderStrong },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText style={styles.buttonText}>Actualiser</ThemedText>
                </Pressable>
              )}
            </View>

            {!user && ready ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText style={LoginTypography.body}>
                  Connectez-vous pour accéder à ce ticket SAV.
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
            ) : !ticketId ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText accessibilityRole="header" style={LoginTypography.title}>
                  Ticket introuvable
                </ThemedText>
                <ThemedText style={LoginTypography.body} themeColor="textSecondary">
                  L’identifiant du ticket demandé est invalide.
                </ThemedText>
              </View>
            ) : loading || !ready ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText style={LoginTypography.body}>Chargement du fil de discussion…</ThemedText>
              </View>
            ) : loadError || !ticket ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>
                  {loadError || 'Impossible de charger ce ticket.'}
                </ThemedText>
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
                <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <View style={styles.headerTop}>
                    <ThemedText style={LoginTypography.label} themeColor="textMuted">
                      {`Ticket #${ticket.id} · ${getTicketCategoryLabel(ticket.category)}`}
                    </ThemedText>
                    <TicketStatusBadge status={ticket.status} />
                  </View>

                  <ThemedText accessibilityRole="header" style={LoginTypography.title}>
                    {ticket.subject}
                  </ThemedText>

                  {ticket.createdAt && (
                    <ThemedText style={styles.metaText} themeColor="textSecondary">
                      {`Ouvert le ${new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}`}
                    </ThemedText>
                  )}

                  {(ticket.orderNumber || ticket.orderId !== null) && (
                    <Pressable
                      accessibilityRole="button"
                      disabled={ticket.orderId === null}
                      onPress={() => {
                        if (ticket.orderId !== null) {
                          router.navigate({
                            pathname: '/orders/[id]',
                            params: { id: String(ticket.orderId) },
                          });
                        }
                      }}
                      style={({ pressed }) => [
                        styles.orderBanner,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                        pressed && ticket.orderId !== null && styles.pressed,
                      ]}
                    >
                      <ThemedText style={styles.orderBannerText}>
                        {ticket.orderNumber
                          ? `Commande ${ticket.orderNumber}`
                          : `Commande #${ticket.orderId}`}
                      </ThemedText>
                      {ticket.orderId !== null && (
                        <ThemedText style={styles.orderLinkText} themeColor="textSecondary">
                          Voir le suivi →
                        </ThemedText>
                      )}
                    </Pressable>
                  )}
                </View>

                <View style={styles.threadSection}>
                  <ThemedText style={LoginTypography.label} themeColor="textMuted">
                    {`Fil de discussion (${ticket.messages.length})`}
                  </ThemedText>

                  {ticket.messages.length === 0 ? (
                    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      <ThemedText style={LoginTypography.body} themeColor="textSecondary">
                        Aucun message dans ce fil de discussion.
                      </ThemedText>
                    </View>
                  ) : (
                    ticket.messages.map((item) => {
                      const isAgent = item.authorRole === 'AGENT';
                      const timestamp = item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '';

                      return (
                        <View
                          key={item.id}
                          style={[
                            styles.messageBubble,
                            isAgent ? styles.agentBubble : styles.customerBubble,
                            {
                              backgroundColor: isAgent
                                ? theme.backgroundElement
                                : theme.backgroundSelected,
                              borderColor: isAgent ? theme.border : theme.borderStrong,
                            },
                          ]}
                        >
                          <View style={styles.messageHeader}>
                            <ThemedText style={styles.authorLabel}>
                              {isAgent ? 'Conseiller SAV' : 'Vous'}
                            </ThemedText>
                            {!!timestamp && (
                              <ThemedText style={styles.timestampText} themeColor="textMuted">
                                {timestamp}
                              </ThemedText>
                            )}
                          </View>
                          <ThemedText style={LoginTypography.body}>{item.content}</ThemedText>
                        </View>
                      );
                    })
                  )}
                </View>

                {ticket.status === 'CLOSED' ? (
                  <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <ThemedText style={LoginTypography.body} themeColor="textSecondary">
                      Ce ticket est fermé. Ouvrez une nouvelle demande si vous avez besoin d’aide supplémentaire.
                    </ThemedText>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.navigate({
                          pathname: '/support/new',
                          params:
                            ticket.orderId !== null && ticket.orderNumber
                              ? {
                                  orderId: String(ticket.orderId),
                                  orderNumber: ticket.orderNumber,
                                }
                              : undefined,
                        })
                      }
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        { backgroundColor: theme.background, borderColor: theme.borderStrong },
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText style={styles.buttonText}>Ouvrir un nouveau ticket</ThemedText>
                    </Pressable>
                  </View>
                ) : (
                  <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.borderStrong }]}>
                    <ThemedText style={LoginTypography.label} themeColor="textMuted">
                      Ajouter une réponse
                    </ThemedText>

                    {!!sendError && (
                      <View
                        accessibilityLiveRegion="polite"
                        style={[styles.errorBanner, { backgroundColor: theme.dangerSoft }]}
                      >
                        <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>
                          {sendError}
                        </ThemedText>
                      </View>
                    )}

                    <TextInput
                      ref={replyInputRef}
                      value={replyContent}
                      onChangeText={(value) => {
                        setReplyContent(value);
                        if (replyError) setReplyError(undefined);
                      }}
                      accessibilityLabel="Votre réponse au service après-vente"
                      multiline
                      maxLength={5000}
                      textAlignVertical="top"
                      editable={!sending}
                      style={[
                        styles.textarea,
                        {
                          color: theme.text,
                          backgroundColor: theme.background,
                          borderColor: replyError ? theme.danger : theme.borderStrong,
                        },
                      ]}
                    />
                    {!!replyError && (
                      <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                        {replyError}
                      </ThemedText>
                    )}

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Envoyer la réponse"
                      accessibilityState={{ disabled: sending, busy: sending }}
                      disabled={sending}
                      onPress={() => void handleSendReply()}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        { backgroundColor: theme.accent },
                        (pressed || sending) && styles.pressed,
                      ]}
                    >
                      <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>
                        {sending ? 'Envoi…' : 'Envoyer la réponse'}
                      </ThemedText>
                    </Pressable>
                  </View>
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 19,
  },
  orderBanner: {
    borderWidth: 1,
    borderRadius: Radius.panel,
    padding: Spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  orderBannerText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  orderLinkText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  threadSection: {
    gap: Spacing.small,
  },
  messageBubble: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.one,
    maxWidth: '92%',
  },
  customerBubble: {
    alignSelf: 'flex-end',
  },
  agentBubble: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    flexWrap: 'wrap',
  },
  authorLabel: {
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  timestampText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 17,
  },
  errorBanner: {
    borderRadius: Radius.panel,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.small,
  },
  textarea: {
    minHeight: 104,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.small,
    ...LoginTypography.body,
  },
  errorText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: ControlSize.primary,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.four,
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
    alignSelf: 'flex-start',
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
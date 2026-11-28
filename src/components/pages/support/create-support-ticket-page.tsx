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

import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import {
  getOrderStatusLabel,
  mapOrderHistoryResponse,
  type ApiOrderHistoryItem,
  type OrderHistoryEntry,
} from '@/services/order-status';
import {
  createSupportTicket,
  getSupportApiErrorMessage,
  getTicketCategoryLabel,
  isOrderEligibleForSupport,
  isOrderRequiredCategory,
  parsePositiveTicketId,
  SUPPORT_WINDOW_DAYS,
  TICKET_CATEGORIES,
  validateCreateTicketInput,
  type CreateTicketFormErrors,
  type TicketCategory,
} from '@/services/support-api';

type SelectedOrder = {
  id: number;
  orderNumber: string;
  createdAt?: string | null;
};

type LoadedOrdersState = {
  user: ReturnType<typeof useAuth>['user'];
  api: ReturnType<typeof useApi>;
  orders: OrderHistoryEntry[];
};

function readSingleParam(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : Array.isArray(value) ? value[0] ?? '' : '';
}

export function CreateSupportTicketPage() {
  const theme = useTheme();
  const { user, ready } = useAuth();
  const api = useApi();
  const params = useLocalSearchParams<{ orderId?: string | string[]; orderNumber?: string | string[] }>();

  const preselectedOrderId = parsePositiveTicketId(readSingleParam(params.orderId));
  const preselectedOrderNumber = readSingleParam(params.orderNumber).trim();

  const [ordersState, setOrdersState] = useState<LoadedOrdersState>();
  const [orderSelectionTouched, setOrderSelectionTouched] = useState(false);
  const [manualSelectedOrder, setManualSelectedOrder] = useState<SelectedOrder | null>(null);
  const [category, setCategory] = useState<TicketCategory>(() =>
    preselectedOrderId ? 'ORDER' : 'OTHER'
  );
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<CreateTicketFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const subjectRef = useRef<ComponentRef<typeof TextInput>>(null);
  const messageRef = useRef<ComponentRef<typeof TextInput>>(null);

  const currentOrders =
    user && ordersState?.user === user && ordersState.api === api ? ordersState : undefined;
  const orders = currentOrders?.orders ?? [];
  const loadingOrders = !!user && !currentOrders;

  const matchedPreselectedOrder = preselectedOrderId
    ? orders.find((item) => Number(item.id) === preselectedOrderId)
    : undefined;

  const defaultSelectedOrder: SelectedOrder | null = matchedPreselectedOrder
    ? {
        id: Number(matchedPreselectedOrder.id),
        orderNumber: matchedPreselectedOrder.orderNumber,
        createdAt: matchedPreselectedOrder.createdAt,
      }
    : preselectedOrderId && preselectedOrderNumber
      ? { id: preselectedOrderId, orderNumber: preselectedOrderNumber }
      : null;

  const selectedOrder = orderSelectionTouched ? manualSelectedOrder : defaultSelectedOrder;
  const effectiveCategory: TicketCategory =
    !selectedOrder && !categoryTouched && isOrderRequiredCategory(category) ? 'OTHER' : category;

  useEffect(() => {
    if (!user) return;
    let active = true;

    api
      .get<ApiOrderHistoryItem[]>('/api/orders/history')
      .then((data) => {
        if (!active) return;
        setOrdersState({
          user,
          api,
          orders: mapOrderHistoryResponse(data),
        });
      })
      .catch(() => {
        if (!active) return;
        setOrdersState({
          user,
          api,
          orders: [],
        });
      });

    return () => {
      active = false;
    };
  }, [api, user]);

  function handleSelectOrder(nextOrder: SelectedOrder | null) {
    setOrderSelectionTouched(true);
    setManualSelectedOrder(nextOrder);
    if (!nextOrder && isOrderRequiredCategory(category)) {
      setCategory('OTHER');
      setCategoryTouched(false);
    } else if (nextOrder && !categoryTouched) {
      setCategory('ORDER');
    }
    setErrors((prev) => ({ ...prev, order: undefined, category: undefined }));
  }

  async function handleSubmit() {
    if (!user || submitting) return;

    const nextErrors = validateCreateTicketInput({
      subject,
      message,
      category: effectiveCategory,
      orderId: selectedOrder?.id,
      orderNumber: selectedOrder?.orderNumber,
      orderCreatedAt: selectedOrder?.createdAt,
    });
    setErrors(nextErrors);
    setSubmitError('');

    if (nextErrors.order || nextErrors.category) {
      return;
    }
    if (nextErrors.subject) {
      subjectRef.current?.focus();
      return;
    }
    if (nextErrors.message) {
      messageRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const created = await createSupportTicket(api, {
        subject: subject.trim(),
        message: message.trim(),
        category: effectiveCategory,
        orderId: selectedOrder?.id,
        orderNumber: selectedOrder?.orderNumber,
      });
      router.replace({ pathname: '/support/[id]', params: { id: String(created.id) } });
    } catch (cause) {
      setSubmitError(getSupportApiErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  const hasFallbackPreselectedOrder =
    !!selectedOrder && !orders.some((item) => Number(item.id) === selectedOrder.id);

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
              accessibilityLabel="Retour aux tickets SAV"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/support'))}
              style={({ pressed }) => [
                styles.backButton,
                { borderColor: theme.borderStrong },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>← Tickets SAV</ThemedText>
            </Pressable>

            <View style={styles.pageHeader}>
              <ThemedText accessibilityRole="header" style={LoginTypography.title}>
                Nouveau ticket SAV
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={LoginTypography.body}>
                Sélectionnez une commande récente (moins de {SUPPORT_WINDOW_DAYS} jours) si votre demande la concerne, puis décrivez votre besoin.
              </ThemedText>
            </View>

            {!user && ready ? (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText style={LoginTypography.body}>
                  Connectez-vous pour ouvrir un ticket auprès du service après-vente.
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
            ) : (
              <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
                {!!submitError && (
                  <View
                    accessibilityLiveRegion="polite"
                    style={[styles.errorBanner, { backgroundColor: theme.dangerSoft }]}
                  >
                    <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>
                      {submitError}
                    </ThemedText>
                  </View>
                )}

                <View style={styles.fieldGroup}>
                  <ThemedText style={LoginTypography.label} themeColor="textMuted">
                    {isOrderRequiredCategory(effectiveCategory)
                      ? 'Commande associée *'
                      : 'Commande associée (optionnel)'}
                  </ThemedText>

                  <View style={styles.optionsList}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedOrder === null, disabled: submitting }}
                      disabled={submitting}
                      onPress={() => handleSelectOrder(null)}
                      style={({ pressed }) => [
                        styles.orderOption,
                        {
                          backgroundColor:
                            selectedOrder === null ? theme.backgroundSelected : theme.background,
                          borderColor:
                            selectedOrder === null ? theme.accent : theme.borderStrong,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText style={styles.orderOptionTitle}>
                        Demande générale (sans commande)
                      </ThemedText>
                    </Pressable>

                    {hasFallbackPreselectedOrder && selectedOrder && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: true, disabled: submitting }}
                        disabled={submitting}
                        onPress={() => handleSelectOrder(selectedOrder)}
                        style={({ pressed }) => [
                          styles.orderOption,
                          {
                            backgroundColor: theme.backgroundSelected,
                            borderColor: theme.accent,
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <ThemedText style={styles.orderOptionTitle}>
                          {`Commande ${selectedOrder.orderNumber}`}
                        </ThemedText>
                      </Pressable>
                    )}

                    {loadingOrders ? (
                      <ThemedText style={styles.helperText} themeColor="textSecondary">
                        Chargement de vos commandes récentes…
                      </ThemedText>
                    ) : (
                      orders.map((order) => {
                        const orderNumericId = Number(order.id);
                        const isSelected = selectedOrder?.id === orderNumericId;
                        const isEligible = isOrderEligibleForSupport(order.createdAt);
                        const isDisabled = submitting || !isEligible;
                        const dateLabel = order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '';

                        return (
                          <Pressable
                            key={order.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                            disabled={isDisabled}
                            onPress={() =>
                              handleSelectOrder({
                                id: orderNumericId,
                                orderNumber: order.orderNumber,
                                createdAt: order.createdAt,
                              })
                            }
                            style={({ pressed }) => [
                              styles.orderOption,
                              {
                                backgroundColor: isSelected
                                  ? theme.backgroundSelected
                                  : theme.background,
                                borderColor: isSelected ? theme.accent : theme.borderStrong,
                                opacity: isEligible ? 1 : 0.55,
                              },
                              pressed && styles.pressed,
                            ]}
                          >
                            <View style={styles.orderOptionHeader}>
                              <ThemedText style={styles.orderOptionTitle}>
                                {order.orderNumber}
                              </ThemedText>
                              <ThemedText style={styles.orderOptionMeta} themeColor="textSecondary">
                                {getOrderStatusLabel(order.status)}
                              </ThemedText>
                            </View>
                            <ThemedText style={styles.orderOptionMeta} themeColor="textSecondary">
                              {`${dateLabel ? `${dateLabel} · ` : ''}${order.totalInclTax
                                .toFixed(2)
                                .replace('.', ',')} €`}
                            </ThemedText>
                            {!isEligible && (
                              <ThemedText style={styles.orderOptionMeta} themeColor="textMuted">
                                {`Délai SAV de ${SUPPORT_WINDOW_DAYS} jours dépassé`}
                              </ThemedText>
                            )}
                          </Pressable>
                        );
                      })
                    )}
                  </View>

                  {!!errors.order && (
                    <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                      {errors.order}
                    </ThemedText>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText style={LoginTypography.label} themeColor="textMuted">
                    Catégorie *
                  </ThemedText>
                  <View style={styles.categoryGrid}>
                    {TICKET_CATEGORIES.map((item) => {
                      const active = effectiveCategory === item;
                      const requiresOrder = isOrderRequiredCategory(item);
                      const categoryDisabled = submitting || (!selectedOrder && requiresOrder);

                      return (
                        <Pressable
                          key={item}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active, disabled: categoryDisabled }}
                          disabled={categoryDisabled}
                          onPress={() => {
                            setCategoryTouched(true);
                            setCategory(item);
                            setErrors((prev) => ({ ...prev, category: undefined, order: undefined }));
                          }}
                          style={({ pressed }) => [
                            styles.categoryChip,
                            {
                              backgroundColor: active ? theme.accent : theme.background,
                              borderColor: active ? theme.accent : theme.borderStrong,
                              opacity: !selectedOrder && requiresOrder ? 0.5 : 1,
                            },
                            pressed && styles.pressed,
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.categoryText,
                              { color: active ? theme.onAccent : theme.text },
                            ]}
                          >
                            {getTicketCategoryLabel(item)}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                  {!selectedOrder && (
                    <ThemedText style={styles.helperText} themeColor="textSecondary">
                      Sélectionnez une commande ci-dessus pour ouvrir un ticket sur une commande, une livraison ou un retour.
                    </ThemedText>
                  )}
                  {!!errors.category && (
                    <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                      {errors.category}
                    </ThemedText>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText style={LoginTypography.label} themeColor="textMuted">
                    Sujet *
                  </ThemedText>
                  <TextInput
                    ref={subjectRef}
                    value={subject}
                    onChangeText={(value) => {
                      setSubject(value);
                      if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
                    }}
                    accessibilityLabel="Sujet du ticket SAV"
                    maxLength={200}
                    returnKeyType="next"
                    onSubmitEditing={() => messageRef.current?.focus()}
                    editable={!submitting}
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        backgroundColor: theme.background,
                        borderColor: errors.subject ? theme.danger : theme.borderStrong,
                      },
                    ]}
                  />
                  {!!errors.subject && (
                    <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                      {errors.subject}
                    </ThemedText>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText style={LoginTypography.label} themeColor="textMuted">
                    Message *
                  </ThemedText>
                  <TextInput
                    ref={messageRef}
                    value={message}
                    onChangeText={(value) => {
                      setMessage(value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                    }}
                    accessibilityLabel="Description détaillée de votre demande"
                    multiline
                    maxLength={5000}
                    textAlignVertical="top"
                    editable={!submitting}
                    style={[
                      styles.textarea,
                      {
                        color: theme.text,
                        backgroundColor: theme.background,
                        borderColor: errors.message ? theme.danger : theme.borderStrong,
                      },
                    ]}
                  />
                  {!!errors.message && (
                    <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                      {errors.message}
                    </ThemedText>
                  )}
                </View>

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Envoyer le ticket SAV"
                    accessibilityState={{ disabled: submitting, busy: submitting }}
                    disabled={submitting}
                    onPress={() => void handleSubmit()}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      { backgroundColor: theme.accent },
                      (pressed || submitting) && styles.pressed,
                    ]}
                  >
                    <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>
                      {submitting ? 'Envoi en cours…' : 'Envoyer le ticket'}
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Annuler la création du ticket"
                    accessibilityState={{ disabled: submitting }}
                    disabled={submitting}
                    onPress={() =>
                      router.canGoBack() ? router.back() : router.replace('/support')
                    }
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      { backgroundColor: theme.background, borderColor: theme.borderStrong },
                      (pressed || submitting) && styles.pressed,
                    ]}
                  >
                    <ThemedText style={styles.buttonText}>Annuler</ThemedText>
                  </Pressable>
                </View>
              </View>
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
  errorBanner: {
    borderRadius: Radius.panel,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.small,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  optionsList: {
    gap: Spacing.two,
  },
  orderOption: {
    borderWidth: 1,
    borderRadius: Radius.control,
    padding: Spacing.small,
    gap: Spacing.half,
  },
  orderOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  orderOptionTitle: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  orderOptionMeta: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 18,
  },
  helperText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 19,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  categoryChip: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  input: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.small,
    ...LoginTypography.body,
  },
  textarea: {
    minHeight: 120,
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
  actions: {
    gap: Spacing.small,
    paddingTop: Spacing.one,
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
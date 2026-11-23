import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type ApiCart, type CartLine, formatPrice, getLineTotalInclTax, normalizeCartItem } from '@/components/pages/cart/cart-logic';
import { AddressForm } from '@/components/pages/profile/address-form';
import { Choice } from '@/components/shared/forms/choice';
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
  fetchAddresses,
  type Address,
  type AddressPayload,
} from '@/services/user-profile-api';
import { prepareCheckoutAddressPayload, selectCheckoutAddress } from '@/services/checkout-address';

type DeliveryMode = 'STANDARD' | 'EXPRESS' | 'CLICK_AND_COLLECT' | 'RELAY_POINT';

const deliveryOptions: { value: DeliveryMode; label: string; description: string }[] = [
  { value: 'STANDARD', label: 'Livraison standard', description: '2 à 4 jours ouvrés' },
  { value: 'EXPRESS', label: 'Livraison express', description: '24h' },
  { value: 'CLICK_AND_COLLECT', label: 'Retrait magasin', description: 'Disponible le lendemain' },
  { value: 'RELAY_POINT', label: 'Relais', description: 'Point de retrait' },
];

function calculateShippingCost(mode: DeliveryMode, subtotalInclTax: number): number {
  switch (mode) {
    case 'CLICK_AND_COLLECT':
      return 0;
    case 'RELAY_POINT':
      return 3.5;
    case 'STANDARD':
      return subtotalInclTax >= 50 ? 0 : 4.9;
    case 'EXPRESS':
      return 9.9;
    default:
      return 0;
  }
}

export function CheckoutPage() {
  const theme = useTheme();
  const api = useApi();
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryMode>('STANDARD');
  const [loading, setLoading] = useState(Boolean(user));
  const [submitting, setSubmitting] = useState(false);
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let active = true;
    Promise.all([
      api.get<ApiCart>('/api/cart'),
      fetchAddresses(api),
    ])
      .then(([cartData, nextAddresses]) => {
        if (!active) return;

        setItems((cartData?.items ?? []).map(normalizeCartItem));
        setAddresses(nextAddresses);

        if (nextAddresses.length > 0) {
          setSelectedAddressId(selectCheckoutAddress(nextAddresses)?.id ?? null);
        } else {
          setSelectedAddressId(null);
        }

        setError('');
      })
      .catch((cause) => {
        if (!active) return;
        setError(getApiErrorMessage(cause));
        setItems([]);
        setAddresses([]);
        setSelectedAddressId(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [api, user]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + getLineTotalInclTax(item), 0),
    [items],
  );

  const shippingCost = useMemo(
    () => calculateShippingCost(selectedDelivery, subtotal),
    [selectedDelivery, subtotal],
  );

  const total = subtotal + shippingCost;

  async function confirmOrder() {
    if (!user) return;
    if (!selectedAddressId) {
      setError('Ajoutez une adresse de livraison avant de confirmer votre commande.');
      return;
    }
    if (items.length === 0) {
      setError('Votre panier est vide. Ajoutez un article avant de valider.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await api.post<{ stripeCheckoutUrl?: string; orderId?: number; orderNumber?: string }>('/api/orders/checkout', {
        shippingAddressId: selectedAddressId,
        deliveryMode: selectedDelivery,
        items: items.map((item) => ({ variantId: item.variantId || item.id, quantity: item.quantity })),
      });

      if (response?.stripeCheckoutUrl) {
        const canOpen = await Linking.canOpenURL(response.stripeCheckoutUrl);
        if (!canOpen) {
          throw new Error('Impossible d’ouvrir la page de paiement Stripe.');
        }
        await Linking.openURL(response.stripeCheckoutUrl);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de confirmer votre commande.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddressSubmit(payload: AddressPayload): Promise<void> {
    setAddressSubmitting(true);
    setAddressError('');
    try {
      const created = await createAddress(api, prepareCheckoutAddressPayload(payload, addresses.length));
      const refreshed = await fetchAddresses(api);
      setAddresses(refreshed);
      setSelectedAddressId(created.id);
      setAddressEditorOpen(false);
      setError('');
    } catch (cause) {
      setAddressError(getApiErrorMessage(cause));
    } finally {
      setAddressSubmitting(false);
    }
  }

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SideMenu />

      <View style={styles.headerRow}>
        <ThemedText accessibilityRole="header" style={LoginTypography.title}>Commander</ThemedText>
        <ThemedText themeColor="textSecondary" style={LoginTypography.body}>Étape 1 sur 3</ThemedText>
      </View>

      {!user ? (
        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText style={LoginTypography.body}>Connectez-vous pour finaliser votre commande.</ThemedText>
          <Choice label="Se connecter" onPress={() => router.navigate('/login')} />
        </View>
      ) : loading ? (
        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText style={LoginTypography.body}>Chargement de votre panier…</ThemedText>
        </View>
      ) : (
        <>
          {error ? <View style={[styles.notice, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}><ThemedText style={LoginTypography.body}>{error}</ThemedText></View> : null}

          <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <ThemedText accessibilityRole="header" style={LoginTypography.label} themeColor="textMuted">Adresse de livraison</ThemedText>
            {addressEditorOpen ? (
              <AddressForm
                submitting={addressSubmitting}
                submitError={addressError}
                onSubmit={handleAddressSubmit}
                onCancel={() => {
                  setAddressError('');
                  setAddressEditorOpen(false);
                }}
              />
            ) : (
              <>
                {addresses.length === 0 ? (
                  <View style={[styles.optionRow, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
                    <ThemedText style={LoginTypography.body}>Aucune adresse disponible.</ThemedText>
                    <ThemedText themeColor="textSecondary" style={LoginTypography.body}>Ajoutez une adresse pour pouvoir confirmer votre commande.</ThemedText>
                  </View>
                ) : addresses.map((address) => (
                  <Pressable
                    key={address.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedAddressId === address.id }}
                    onPress={() => setSelectedAddressId(address.id)}
                    style={({ pressed }) => [styles.optionRow, { borderColor: selectedAddressId === address.id ? theme.accent : theme.border, backgroundColor: selectedAddressId === address.id ? theme.backgroundSelected : theme.background, opacity: pressed ? 0.8 : 1 }]}
                  >
                    <ThemedText style={LoginTypography.body}>{address.label}</ThemedText>
                    <ThemedText themeColor="textSecondary" style={LoginTypography.body}>{address.recipient}</ThemedText>
                    <ThemedText themeColor="textSecondary" style={LoginTypography.body}>{address.street}</ThemedText>
                    {!!address.complement && <ThemedText themeColor="textSecondary" style={LoginTypography.body}>{address.complement}</ThemedText>}
                    <ThemedText themeColor="textSecondary" style={LoginTypography.body}>{address.zipCode} {address.city}, {address.country}</ThemedText>
                  </Pressable>
                ))}
                <Choice
                  label={addresses.length === 0 ? 'Ajouter une adresse' : 'Ajouter une autre adresse'}
                  onPress={() => {
                    setAddressError('');
                    setAddressEditorOpen(true);
                  }}
                />
              </>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <ThemedText accessibilityRole="header" style={LoginTypography.label} themeColor="textMuted">Mode de livraison</ThemedText>
            {deliveryOptions.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => setSelectedDelivery(option.value)}
                style={({ pressed }) => [styles.deliveryRow, { borderColor: selectedDelivery === option.value ? theme.accent : theme.border, backgroundColor: selectedDelivery === option.value ? theme.backgroundSelected : theme.background, opacity: pressed ? 0.8 : 1 }]}
              >
                <View style={styles.deliveryInfo}>
                  <ThemedText style={LoginTypography.body}>{option.label}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={LoginTypography.body}>{option.description}</ThemedText>
                </View>
                <ThemedText style={LoginTypography.body}>{formatPrice(calculateShippingCost(option.value, subtotal))}</ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <ThemedText accessibilityRole="header" style={LoginTypography.label} themeColor="textMuted">Récapitulatif</ThemedText>
            {items.length === 0 ? (
              <ThemedText style={LoginTypography.body}>Votre panier est vide.</ThemedText>
            ) : (
              <>
                {items.map((item) => (
                  <View key={item.id} style={styles.summaryLine}>
                    <View style={styles.summaryLineInfo}>
                      <ThemedText style={LoginTypography.body}>{item.name}</ThemedText>
                      <ThemedText themeColor="textSecondary" style={LoginTypography.body}>Qté : {item.quantity}</ThemedText>
                    </View>
                    <ThemedText style={LoginTypography.body}>{formatPrice(getLineTotalInclTax(item))}</ThemedText>
                  </View>
                ))}

                <View style={styles.totalBlock}>
                  <View style={styles.totalRow}>
                    <ThemedText style={LoginTypography.body}>Sous-total TTC</ThemedText>
                    <ThemedText style={LoginTypography.body}>{formatPrice(subtotal)}</ThemedText>
                  </View>
                  <View style={styles.totalRow}>
                    <ThemedText style={LoginTypography.body}>Livraison</ThemedText>
                    <ThemedText style={LoginTypography.body}>{formatPrice(shippingCost)}</ThemedText>
                  </View>
                  <View style={[styles.totalRow, styles.totalRowStrong]}>
                    <ThemedText style={LoginTypography.lead}>Total</ThemedText>
                    <ThemedText style={LoginTypography.lead}>{formatPrice(total)}</ThemedText>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.footerActions}>
            <Pressable
              accessibilityRole="button"
              disabled={submitting || addressEditorOpen || items.length === 0 || selectedAddressId === null}
              onPress={() => void confirmOrder()}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: submitting || addressEditorOpen || items.length === 0 || selectedAddressId === null ? theme.border : theme.accent, opacity: pressed ? 0.9 : 1 }]}
            >
              <ThemedText themeColor={submitting || addressEditorOpen || items.length === 0 || selectedAddressId === null ? 'text' : 'onAccent'} style={LoginTypography.button}>
                {submitting ? 'Validation…' : 'Confirmer la commande'}
              </ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center', paddingBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  card: { borderWidth: 1, borderRadius: Radius.card, padding: 16, gap: 12 },
  notice: { borderWidth: 1, borderRadius: Radius.control, padding: 12 },
  optionRow: { borderWidth: 1, borderRadius: Radius.control, padding: 12, gap: 4 },
  deliveryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 12, paddingVertical: 10 },
  deliveryInfo: { flex: 1, gap: 2 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  summaryLineInfo: { flex: 1, gap: 2 },
  totalBlock: { gap: 8, borderTopWidth: 1, paddingTop: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRowStrong: { paddingTop: 8, borderTopWidth: 1 },
  footerActions: { paddingTop: 8 },
  primaryButton: { minHeight: ControlSize.primary, borderRadius: Radius.control, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.small },
});

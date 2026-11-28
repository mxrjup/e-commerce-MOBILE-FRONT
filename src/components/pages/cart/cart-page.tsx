import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type ApiCart, type CartLine, calculateCartTotals, formatPrice, getLineTotalInclTax, normalizeCartItem } from '@/components/pages/cart/cart-logic';
import { Choice } from '@/components/shared/forms/choice';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { loadCartRecommendations, type RecommendedItem } from '@/services/cart-recommendations';

export function CartPage() {
  const theme = useTheme();
  const api = useApi();
  const { user } = useAuth();
  const [recommendedAccessories, setRecommendations] = useState<RecommendedItem[]>([]);
  const [recommendationError, setRecommendationError] = useState('');
  useEffect(() => {
    let active = true;
    loadCartRecommendations(api).then(items => {
      if (active) { setRecommendations(items); setRecommendationError(''); }
    }).catch(() => {
      if (active) { setRecommendations([]); setRecommendationError('Les suggestions sont indisponibles pour le moment.'); }
    });
    return () => { active = false; };
  }, [api]);
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      // Reading the cart must not trigger a merge. The gateway currently forwards
      // X-Auth-Subject, whereas the merge endpoint still requires X-User-Id.
      const data = await api.get<ApiCart>('/api/cart', { auth: Boolean(user) });
      setItems((data?.items ?? []).map(normalizeCartItem));
      setError('');
    } catch (cause) {
      setItems([]);
      setError(cause instanceof Error ? cause.message : 'Le panier est indisponible pour le moment.');
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  useFocusEffect(
    useCallback(() => {
      void refreshCart();
    }, [refreshCart]),
  );

  const { subtotal, totalItems } = useMemo(() => calculateCartTotals(items), [items]);

  async function addItem(item: RecommendedItem) {
    setBusy(true);
    try {
      await api.post<ApiCart>('/api/cart/items', { variantId: item.id, quantity: 1 }, { auth: Boolean(user) });
      await refreshCart();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible d’ajouter cet article.');
    } finally {
      setBusy(false);
    }
  }

  async function updateQuantity(itemId: number, nextQuantity: number) {
    const currentItem = items.find((item) => item.id === itemId);
    if (!currentItem) return;

    setBusy(true);
    try {
      if (nextQuantity <= 0) {
        await api.delete<ApiCart>(`/api/cart/items/${itemId}`, { auth: Boolean(user) });
        await refreshCart();
        return;
      }

      await api.patch<ApiCart>(`/api/cart/items/${itemId}`, { quantity: nextQuantity }, { auth: Boolean(user) });
      await refreshCart();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de mettre à jour le panier.');
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(itemId: number) {
    setBusy(true);
    try {
      await api.delete<ApiCart>(`/api/cart/items/${itemId}`, { auth: Boolean(user) });
      await refreshCart();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de supprimer cet article.');
    } finally {
      setBusy(false);
    }
  }

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SideMenu />
      <View style={styles.headerRow}>
        <ThemedText accessibilityRole="header" style={LoginTypography.title}>Panier</ThemedText>
        <View style={[styles.countBadge, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <ThemedText style={LoginTypography.label} themeColor="textSecondary">{totalItems} article{totalItems > 1 ? 's' : ''}</ThemedText>
        </View>
      </View>

      {loading ? (
        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText style={LoginTypography.body}>Chargement du panier…</ThemedText>
        </View>
      ) : (
        <>
          {error ? <View style={[styles.notice, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}><ThemedText style={LoginTypography.body}>{error}</ThemedText></View> : null}

          {items.length === 0 ? (
            <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <ThemedText style={LoginTypography.lead}>Votre panier est vide.</ThemedText>
              <Choice label="Explorer le catalogue" onPress={() => router.navigate('/catalog')} />
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
              {items.map((item) => (
                <View key={item.id} style={styles.lineRow}>
                  <View style={styles.lineInfo}>
                    <ThemedText style={LoginTypography.body}>{item.name}</ThemedText>
                    {!item.available && <ThemedText style={LoginTypography.body} themeColor="danger">Indisponible</ThemedText>}
                  </View>

                  <View style={styles.lineActions}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Retirer 1 ${item.name}`} disabled={busy} onPress={() => void updateQuantity(item.id, item.quantity - 1)} style={({ pressed }) => [styles.stepButton, { opacity: pressed || busy ? 0.7 : 1, borderColor: theme.border }]}>
                      <ThemedText style={LoginTypography.button}>−</ThemedText>
                    </Pressable>

                    <View style={[styles.quantityBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}> 
                      <ThemedText testID={`cart-quantity-${item.id}`} style={LoginTypography.body}>{item.quantity}</ThemedText>
                    </View>

                    <Pressable accessibilityRole="button" accessibilityLabel={`Ajouter 1 ${item.name}`} disabled={busy} onPress={() => void updateQuantity(item.id, item.quantity + 1)} style={({ pressed }) => [styles.stepButton, { opacity: pressed || busy ? 0.7 : 1, borderColor: theme.border }]}>
                      <ThemedText style={LoginTypography.button}>+</ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.priceBlock}>
                    <ThemedText style={LoginTypography.body}>{formatPrice(getLineTotalInclTax(item))}</ThemedText>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Supprimer ${item.name}`} disabled={busy} onPress={() => void removeItem(item.id)} style={({ pressed }) => [styles.removeButton, { opacity: pressed || busy ? 0.7 : 1, borderColor: theme.border }]}>
                      <ThemedText style={LoginTypography.body} themeColor="danger">Supprimer</ThemedText>
                    </Pressable>
                  </View>
                </View>
              ))}

              <View style={styles.summaryRow}>
                <ThemedText style={LoginTypography.body}>Sous-total</ThemedText>
                <ThemedText testID="cart-subtotal" style={LoginTypography.lead}>{formatPrice(subtotal)}</ThemedText>
              </View>
            </View>
          )}

          <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
            <ThemedText accessibilityRole="header" style={LoginTypography.label} themeColor="textMuted">Articles disponibles</ThemedText>
            {!!recommendationError && <ThemedText accessibilityRole="alert">{recommendationError}</ThemedText>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationList}>
              {recommendedAccessories.map((item) => (
                <View key={item.id} style={[styles.recommendationCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                  <View style={[styles.thumb, { backgroundColor: theme.backgroundSelected }]}>
                    <ThemedText style={LoginTypography.label} themeColor="textMuted">{item.name.charAt(0)}</ThemedText>
                  </View>
                  <ThemedText style={LoginTypography.body}>{item.name}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={LoginTypography.body}>{item.description}</ThemedText>
                  <View style={styles.recommendationFooter}>
                    <ThemedText style={LoginTypography.button}>{formatPrice(item.price)}</ThemedText>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Ajouter ${item.name}`} disabled={busy} onPress={() => void addItem(item)} style={({ pressed }) => [styles.addButton, { backgroundColor: theme.accent, opacity: pressed || busy ? 0.8 : 1 }]}> 
                      <ThemedText themeColor="onAccent" style={LoginTypography.button}>Ajouter</ThemedText>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.footerActions}>
            <Pressable
              accessibilityRole="button"
              disabled={items.length === 0 || busy}
              onPress={() => router.navigate('/checkout' as never)}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: items.length === 0 || busy ? theme.border : theme.accent, opacity: pressed ? 0.9 : 1 }]}
            >
              <ThemedText themeColor={items.length === 0 || busy ? 'text' : 'onAccent'} style={LoginTypography.button}>
                Valider ma commande
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
  countBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1 },
  card: { borderWidth: 1, borderRadius: Radius.card, padding: 16, gap: 16 },
  notice: { borderWidth: 1, borderRadius: Radius.control, padding: 12 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 10 },
  lineInfo: { flex: 1, gap: 4 },
  lineActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepButton: { minWidth: 36, minHeight: 36, borderWidth: 1, borderRadius: Radius.control, justifyContent: 'center', alignItems: 'center' },
  quantityBox: { minWidth: 32, minHeight: 32, borderWidth: 1, borderRadius: Radius.control, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  priceBlock: { alignItems: 'flex-end', gap: 6 },
  removeButton: { borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 8, paddingVertical: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1 },
  recommendationList: { gap: 12, paddingVertical: 8 },
  recommendationCard: { width: 180, borderWidth: 1, borderRadius: Radius.card, padding: 12, gap: 8, marginRight: 12 },
  thumb: { height: 90, borderRadius: Radius.control, alignItems: 'center', justifyContent: 'center' },
  recommendationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  addButton: { borderRadius: Radius.control, minHeight: 36, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center' },
  footerActions: { paddingTop: 8 },
  primaryButton: { minHeight: ControlSize.primary, borderRadius: Radius.control, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.small },
});

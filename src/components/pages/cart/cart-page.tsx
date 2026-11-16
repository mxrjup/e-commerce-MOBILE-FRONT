import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Choice } from '@/components/shared/forms/choice';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

type CartLine = {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  available: boolean;
};

type RecommendedItem = {
  id: number;
  name: string;
  price: number;
  description: string;
};

type ApiCartItem = {
  id?: number;
  variantId?: number;
  quantity?: number;
  productName?: string | null;
  unitPriceExclTax?: number | string | null;
  available?: boolean;
};

type ApiCart = {
  items?: ApiCartItem[];
};

const fallbackItems: CartLine[] = [
  { id: 1, name: 'Écouteurs sans fil Pro', quantity: 1, unitPrice: 149.0, available: true },
  { id: 2, name: 'Câble USB-C rapide', quantity: 2, unitPrice: 19.9, available: true },
];

const recommendedAccessories: RecommendedItem[] = [
  { id: 101, name: 'Station d’accueil', price: 89.0, description: 'Charge rapide et rangement' },
  { id: 102, name: 'Sac de transport', price: 59.0, description: 'Protection et mobilité' },
  { id: 103, name: 'Clavier compact', price: 129.0, description: 'Ergonomie quotidienne' },
];

function normalizeCartItem(item: ApiCartItem): CartLine {
  const quantity = Number(item.quantity ?? 1);
  const unitPrice = Number(item.unitPriceExclTax ?? 0);
  return {
    id: Number(item.id ?? item.variantId ?? 0),
    name: item.productName ?? 'Article',
    quantity: Number.isFinite(quantity) ? quantity : 1,
    unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
    available: item.available ?? true,
  };
}

export function CartPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const api = useApi();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    api.get<ApiCart>('/api/cart')
      .then((data) => {
        if (!active) return;
        const nextItems = (data?.items ?? []).map(normalizeCartItem);
        setItems(nextItems.length ? nextItems : fallbackItems);
        setError('');
      })
      .catch(() => {
        if (!active) return;
        setItems(fallbackItems);
        setError('Le serveur est indisponible pour le moment. Affichage de votre panier de démonstration.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [api, user]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SideMenu />
      <View style={styles.headerRow}>
        <ThemedText accessibilityRole="header" style={LoginTypography.title}>Panier</ThemedText>
        <View style={[styles.countBadge, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <ThemedText style={LoginTypography.label} themeColor="textSecondary">{totalItems} article{totalItems > 1 ? 's' : ''}</ThemedText>
        </View>
      </View>

      {!user ? (
        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText style={LoginTypography.body}>Connectez-vous pour consulter et modifier votre panier.</ThemedText>
          <Choice label="Se connecter" onPress={() => router.navigate('/login')} />
        </View>
      ) : loading ? (
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
                    <ThemedText themeColor="textSecondary" style={LoginTypography.body}>Qté : {item.quantity}</ThemedText>
                    {!item.available && <ThemedText style={LoginTypography.body} themeColor="danger">Indisponible</ThemedText>}
                  </View>
                  <ThemedText style={LoginTypography.body}>{(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')} €</ThemedText>
                </View>
              ))}

              <View style={styles.summaryRow}>
                <ThemedText style={LoginTypography.body}>Sous-total</ThemedText>
                <ThemedText style={LoginTypography.lead}>{subtotal.toFixed(2).replace('.', ',')} €</ThemedText>
              </View>
            </View>
          )}

          <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
            <ThemedText accessibilityRole="header" style={LoginTypography.label} themeColor="textMuted">Accessoires recommandés</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationList}>
              {recommendedAccessories.map((item) => (
                <View key={item.id} style={[styles.recommendationCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                  <View style={[styles.thumb, { backgroundColor: theme.backgroundSelected }]}>
                    <ThemedText style={LoginTypography.label} themeColor="textMuted">{item.name.charAt(0)}</ThemedText>
                  </View>
                  <ThemedText style={LoginTypography.body}>{item.name}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={LoginTypography.body}>{item.description}</ThemedText>
                  <ThemedText style={LoginTypography.button}>{item.price.toFixed(2).replace('.', ',')} €</ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.footerActions}>
            <Pressable
              accessibilityRole="button"
              disabled={items.length === 0}
              onPress={() => router.navigate('/orders')}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: items.length === 0 ? theme.border : theme.accent, opacity: pressed ? 0.9 : 1 }]}
            >
              <ThemedText themeColor={items.length === 0 ? 'text' : 'onAccent'} style={LoginTypography.button}>
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
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  lineInfo: { flex: 1, gap: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1 },
  recommendationList: { gap: 12, paddingVertical: 8 },
  recommendationCard: { width: 180, borderWidth: 1, borderRadius: Radius.card, padding: 12, gap: 8, marginRight: 12 },
  thumb: { height: 90, borderRadius: Radius.control, alignItems: 'center', justifyContent: 'center' },
  footerActions: { paddingTop: 8 },
  primaryButton: { minHeight: ControlSize.primary, borderRadius: Radius.control, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.small },
});

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

type CheckoutResultProps = {
  success: boolean;
};

type CheckoutSessionStatusResponse = {
  orderId: number;
  orderNumber: string;
  stripeSessionId: string;
  orderStatus: string;
  paymentConfirmed: boolean;
};

export function CheckoutResultPage({ success }: CheckoutResultProps) {
  const theme = useTheme();
  const api = useApi();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ session_id?: string }>();
  const sessionId = params.session_id ? String(params.session_id) : '';
  const shouldVerify = Boolean(success && sessionId && user);
  const [verifiedSessionId, setVerifiedSessionId] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState<null | boolean>(null);
  const [statusLabel, setStatusLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shouldVerify) {
      return;
    }

    let active = true;

    api.get<CheckoutSessionStatusResponse>(`/api/orders/checkout-session/${encodeURIComponent(sessionId)}/status`)
      .then((data) => {
        if (!active) return;
        setPaymentConfirmed(Boolean(data?.paymentConfirmed));
        setStatusLabel(data?.orderStatus ? `Statut commande : ${data.orderStatus}` : 'Statut de paiement vérifié');
        setError('');
        setVerifiedSessionId(sessionId);
      })
      .catch((cause) => {
        if (!active) return;
        setPaymentConfirmed(null);
        setError(cause instanceof Error ? cause.message : 'Impossible de vérifier le statut du paiement pour le moment.');
        setVerifiedSessionId(sessionId);
      })
      .finally(() => {});

    return () => { active = false; };
  }, [api, sessionId, shouldVerify]);

  const checking = shouldVerify && verifiedSessionId !== sessionId;
  const resolvedPaymentConfirmed = success ? (shouldVerify ? (checking ? null : paymentConfirmed) : null) : false;
  const resolvedStatusLabel = success
    ? checking
      ? ''
      : statusLabel || 'Statut de paiement en attente de vérification'
    : 'Paiement annulé';

  const title = success
    ? resolvedPaymentConfirmed === true
      ? 'Commande confirmée'
      : resolvedPaymentConfirmed === false
        ? 'Paiement reçu, commande en cours de finalisation'
        : 'Vérification du paiement'
    : 'Paiement annulé';

  const bodyText = success
    ? resolvedPaymentConfirmed === true
      ? 'Votre commande a bien été prise en compte. Vous pouvez suivre son statut dans l’historique.'
      : resolvedPaymentConfirmed === false
        ? 'Le paiement est revenu avec succès mais la confirmation finale n’est pas encore visible côté commande. Actualisez votre historique dans quelques secondes.'
        : 'Nous vérifions le statut réel du paiement auprès du backend.'
    : 'Le paiement n’a pas été finalisé. Vous pouvez réessayer ou modifier votre commande.';

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <View style={styles.content}>
      <SideMenu />
      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
        <ThemedText accessibilityRole="header" style={LoginTypography.title}>
          {title}
        </ThemedText>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">
          {bodyText}
        </ThemedText>

        {checking && (
          <ThemedText style={LoginTypography.body} themeColor="textSecondary">
            Vérification du statut en cours…
          </ThemedText>
        )}

        {!!resolvedStatusLabel && (
          <ThemedText style={LoginTypography.body} themeColor="textSecondary">
            {resolvedStatusLabel}
          </ThemedText>
        )}

        {!!error && (
          <ThemedText style={LoginTypography.body} themeColor="danger">
            {error}
          </ThemedText>
        )}

        {!!params.session_id && (
          <ThemedText style={LoginTypography.body} themeColor="textSecondary">
            Session Stripe : {String(params.session_id)}
          </ThemedText>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate('/orders')}
          style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1 }]}
        >
          <ThemedText themeColor="onAccent" style={LoginTypography.button}>
            Voir mes commandes
          </ThemedText>
        </Pressable>
      </View>
    </View>
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 16, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center', paddingBottom: 32 },
  card: { borderWidth: 1, borderRadius: Radius.card, padding: 16, gap: 16 },
  primaryButton: { minHeight: ControlSize.primary, borderRadius: Radius.control, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.small },
});

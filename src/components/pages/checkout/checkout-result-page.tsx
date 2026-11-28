import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { checkoutSessionId } from '@/services/checkout-payment';

type CheckoutResultProps = {
  result: 'success' | 'cancel' | 'failure';
};

export function CheckoutResultPage({ result }: CheckoutResultProps) {
  const theme = useTheme();
  const params = useLocalSearchParams<{ session_id?: string | string[]; reason?: string | string[] }>();
  const sessionId = checkoutSessionId(params.session_id);
  const reason = typeof params.reason === 'string' ? params.reason : '';

  const content = result === 'success'
    ? {
        title: 'Paiement terminé',
        body: 'Le paiement a été accepté par Stripe. La confirmation finale de la commande est traitée automatiquement.',
        action: 'Voir mes commandes',
      }
    : result === 'cancel'
      ? {
          title: 'Paiement annulé',
          body: 'Le paiement n’a pas été finalisé. Vous pouvez modifier votre commande et réessayer.',
          action: 'Retour au panier',
        }
      : {
          title: 'Échec du paiement',
          body: reason || 'Impossible d’ouvrir ou de finaliser le paiement Stripe. Vous pouvez réessayer.',
          action: 'Retour au panier',
        };

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <View style={styles.content}>
      <SideMenu />
      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
        <ThemedText accessibilityRole="header" style={LoginTypography.title}>{content.title}</ThemedText>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">{content.body}</ThemedText>
        {!!sessionId && (
          <ThemedText style={LoginTypography.body} themeColor="textSecondary">
            Session Stripe : {sessionId}
          </ThemedText>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate(result === 'success' ? '/orders' : '/cart')}
          style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1 }]}
        >
          <ThemedText themeColor="onAccent" style={LoginTypography.button}>{content.action}</ThemedText>
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

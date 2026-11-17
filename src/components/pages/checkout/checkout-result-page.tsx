import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CheckoutResultProps = {
  success: boolean;
};

export function CheckoutResultPage({ success }: CheckoutResultProps) {
  const theme = useTheme();
  const params = useLocalSearchParams<{ session_id?: string }>();

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <View style={styles.content}>
      <SideMenu />
      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
        <ThemedText accessibilityRole="header" style={LoginTypography.title}>
          {success ? 'Commande confirmée' : 'Paiement annulé'}
        </ThemedText>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">
          {success
            ? 'Votre commande a bien été prise en compte. Vous pouvez suivre son statut dans l’historique.'
            : 'Le paiement n’a pas été finalisé. Vous pouvez réessayer ou modifier votre commande.'}
        </ThemedText>

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

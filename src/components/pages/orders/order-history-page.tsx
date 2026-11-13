import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getOrderHistoryData, getOrderStatusLabel, type OrderHistoryEntry } from '@/services/order-status';

export function OrderHistoryPage() {
  const theme = useTheme();
  const orders = getOrderHistoryData();

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SideMenu />
      <View style={styles.header}>
        <ThemedText accessibilityRole="header" style={LoginTypography.title}>Historique</ThemedText>
        <ThemedText themeColor="textSecondary" style={LoginTypography.body}>Suivez vos commandes et ouvrez votre facture.</ThemedText>
      </View>

      {orders.map(order => (
        <Pressable
          key={order.id}
          accessibilityRole="button"
          onPress={() => router.navigate({ pathname: '/orders/[id]', params: { id: String(order.id) } })}
          style={({ pressed }) => [styles.card, { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.9 : 1 }]}
        >
          <View style={styles.cardTop}>
            <View>
              <ThemedText style={LoginTypography.label} themeColor="textMuted">{order.orderNumber}</ThemedText>
              <ThemedText style={LoginTypography.lead}>{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</ThemedText>
            </View>
            <StatusBadge status={order.status} />
          </View>

          <View style={styles.metaRow}>
            <ThemedText style={LoginTypography.body} themeColor="textSecondary">{order.itemCount} article{order.itemCount > 1 ? 's' : ''}</ThemedText>
            <ThemedText style={LoginTypography.body} themeColor="textSecondary">{order.deliveryMode}</ThemedText>
          </View>

          <View style={styles.totalRow}>
            <ThemedText style={[LoginTypography.body, styles.totalLabel]} themeColor="textMuted">Total</ThemedText>
            <ThemedText style={LoginTypography.lead}>{order.totalInclTax.toFixed(2).replace('.', ',')} €</ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => void Linking.openURL(order.invoiceUrl)}
            style={({ pressed }) => [styles.secondaryAction, { borderColor: theme.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <ThemedText style={LoginTypography.button}>Voir la facture</ThemedText>
          </Pressable>
        </Pressable>
      ))}
    </ScrollView>
  </SafeAreaView></ThemedView>;
}

function StatusBadge({ status }: { status: OrderHistoryEntry['status'] }) {
  const theme = useTheme();

  const palette: Record<OrderHistoryEntry['status'], { background: string; text: string }> = {
    NEW: { background: theme.backgroundElement, text: theme.text },
    IN_PREPARATION: { background: '#F3EAD9', text: '#7A4C0F' },
    SHIPPED: { background: '#E8F5F0', text: '#1F6E52' },
    DELIVERED: { background: '#EAF7EE', text: '#185B3A' },
    CANCELLED: { background: '#FDECEA', text: theme.danger },
  };

  return <View style={[styles.badge, { backgroundColor: palette[status].background }]}><ThemedText style={LoginTypography.label} themeColor="text">{getOrderStatusLabel(status)}</ThemedText></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center', paddingBottom: 32 },
  header: { gap: 8 },
  card: { borderWidth: 1, borderRadius: Radius.card, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1 },
  totalLabel: { marginRight: 8 },
  badge: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  secondaryAction: { minHeight: 44, borderWidth: 1, borderRadius: Radius.control, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.small },
});

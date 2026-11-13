import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Choice } from '@/components/shared/forms/choice';
import { SideMenu } from '@/components/shared/navigation/side-menu';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getOrderHistoryData, getOrderStatusLabel, getTrackingTimeline, normalizeOrderStatus, type OrderHistoryEntry } from '@/services/order-status';

export function OrderDetailPage() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const order = getOrderHistoryData().find(item => String(item.id) === String(id));

  if (!order) {
    return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
      <View style={styles.centered}>
        <SideMenu />
        <ThemedText accessibilityRole="header" style={LoginTypography.title}>Commande introuvable</ThemedText>
        <ThemedText style={LoginTypography.body}>Cette commande n’est plus disponible dans l’historique.</ThemedText>
        <Choice label="Retour à l’historique" onPress={() => router.canGoBack() ? router.back() : router.replace('/orders')} />
      </View>
    </SafeAreaView></ThemedView>;
  }

  const timeline = getTrackingTimeline(order.status);

  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SideMenu />
      <View style={styles.headerRow}>
        <Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/orders')} style={styles.backButton}>
          <ThemedText style={LoginTypography.button}>← Retour</ThemedText>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
        <ThemedText style={LoginTypography.label} themeColor="textMuted">{order.orderNumber}</ThemedText>
        <View style={styles.titleRow}>
          <ThemedText accessibilityRole="header" style={LoginTypography.title}>Suivi de commande</ThemedText>
          <StatusBadge status={order.status} />
        </View>
        <ThemedText themeColor="textSecondary" style={LoginTypography.body}>{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
        <ThemedText style={LoginTypography.label} themeColor="textMuted">État actuel</ThemedText>
        <ThemedText style={LoginTypography.lead}>{getOrderStatusLabel(order.status)}</ThemedText>
        <View style={styles.timeline}>
          {timeline.map((step, index) => (
            <View key={step.key} style={styles.timelineRow}>
              <View style={styles.timelineIndicatorWrapper}>
                <View style={[styles.timelineIndicator, {
                  backgroundColor: step.state === 'complete' ? theme.accent : step.state === 'current' ? theme.backgroundSelected : theme.background,
                  borderColor: step.state === 'upcoming' ? theme.borderStrong : theme.accent,
                }]} />
                {index < timeline.length - 1 && <View style={[styles.timelineLine, { backgroundColor: step.state === 'complete' || step.state === 'current' ? theme.borderStrong : theme.border }]} />}
              </View>
              <View style={styles.timelineText}>
                <ThemedText style={LoginTypography.body}>{step.label}</ThemedText>
                <ThemedText style={LoginTypography.body} themeColor="textSecondary">{step.date}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
        <ThemedText style={LoginTypography.label} themeColor="textMuted">Livraison</ThemedText>
        <ThemedText style={LoginTypography.body}>Mode : {order.deliveryMode}</ThemedText>
        <ThemedText style={LoginTypography.body}>Suivi : {order.trackingNumber}</ThemedText>
        <ThemedText style={LoginTypography.body}>Adresse : {order.shippingAddress}</ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}> 
        <ThemedText style={LoginTypography.label} themeColor="textMuted">Articles</ThemedText>
        {order.items.map(item => (
          <View key={`${order.id}-${item.name}`} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <ThemedText style={LoginTypography.body}>{item.name}</ThemedText>
              <ThemedText themeColor="textSecondary" style={LoginTypography.body}>Qté : {item.quantity}</ThemedText>
            </View>
            <ThemedText style={LoginTypography.body}>{item.price.toFixed(2).replace('.', ',')} €</ThemedText>
          </View>
        ))}
        <View style={styles.totalBox}>
          <ThemedText style={LoginTypography.body}>Total</ThemedText>
          <ThemedText style={LoginTypography.lead}>{order.totalInclTax.toFixed(2).replace('.', ',')} €</ThemedText>
        </View>
      </View>

      <View style={styles.footerActions}>
        <Pressable accessibilityRole="button" onPress={() => void Linking.openURL(order.invoiceUrl)} style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1 }]}>
          <ThemedText themeColor="onAccent" style={LoginTypography.button}>Voir la facture</ThemedText>
        </Pressable>
      </View>
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

  return <View style={[styles.badge, { backgroundColor: palette[status].background }]}><ThemedText style={LoginTypography.label}>{getOrderStatusLabel(status)}</ThemedText></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', gap: 24, padding: 24 },
  content: { padding: 16, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center', paddingBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 12, paddingVertical: 8, minHeight: 40 },
  card: { borderWidth: 1, borderRadius: Radius.card, padding: 16, gap: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  badge: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  timeline: { gap: 12, paddingTop: 8 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineIndicatorWrapper: { alignItems: 'center', width: 18 },
  timelineIndicator: { width: 12, height: 12, borderWidth: 2, borderRadius: 999 },
  timelineLine: { width: 2, height: 28, marginTop: 4 },
  timelineText: { flex: 1, gap: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1 },
  itemInfo: { flex: 1, gap: 4 },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
  footerActions: { paddingTop: 8 },
  primaryButton: { minHeight: 52, borderRadius: Radius.control, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.small },
});

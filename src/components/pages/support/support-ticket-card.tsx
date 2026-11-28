import { Pressable, StyleSheet, View } from 'react-native';

import { TicketStatusBadge } from '@/components/pages/support/ticket-status-badge';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getTicketCategoryLabel, type SupportTicketSummary } from '@/services/support-api';

type SupportTicketCardProps = {
  ticket: SupportTicketSummary;
  onPress: (ticketId: number) => void;
};

export function SupportTicketCard({ ticket, onPress }: SupportTicketCardProps) {
  const theme = useTheme();

  const updatedLabel = ticket.updatedAt
    ? new Date(ticket.updatedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir le ticket ${ticket.subject}`}
      onPress={() => onPress(ticket.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.background,
          borderColor: ticket.status === 'WAITING_CUSTOMER' ? theme.borderStrong : theme.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.metaBadges}>
          <ThemedText style={LoginTypography.label} themeColor="textMuted">
            {`#${ticket.id} · ${getTicketCategoryLabel(ticket.category)}`}
          </ThemedText>
        </View>
        <TicketStatusBadge status={ticket.status} />
      </View>

      <ThemedText style={styles.subject}>{ticket.subject}</ThemedText>

      {!!ticket.orderNumber && (
        <View
          style={[
            styles.orderTag,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <ThemedText style={styles.orderTagText} themeColor="textSecondary">
            {`Commande ${ticket.orderNumber}`}
          </ThemedText>
        </View>
      )}

      <View style={styles.footerRow}>
        <ThemedText style={styles.footerText} themeColor="textSecondary">
          {`${ticket.messageCount} message${ticket.messageCount > 1 ? 's' : ''}`}
        </ThemedText>
        {!!updatedLabel && (
          <ThemedText style={styles.footerText} themeColor="textMuted">
            {`Mis à jour le ${updatedLabel}`}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.small,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  metaBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  subject: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
  },
  orderTag: {
    borderWidth: 1,
    borderRadius: Radius.panel,
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.one,
    alignSelf: 'flex-start',
  },
  orderTagText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    flexWrap: 'wrap',
    paddingTop: Spacing.one,
  },
  footerText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.78,
  },
});
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/ui/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getTicketStatusLabel, type TicketStatus } from '@/services/support-api';

type TicketStatusBadgeProps = {
  status: TicketStatus;
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const theme = useTheme();

  const palette: Record<TicketStatus, { background: string; text: string; border?: string }> = {
    OPEN: { background: theme.okSoft, text: theme.ok },
    IN_PROGRESS: { background: theme.backgroundSelected, text: theme.text, border: theme.borderStrong },
    WAITING_CUSTOMER: { background: theme.dangerSoft, text: theme.danger },
    RESOLVED: { background: theme.backgroundElement, text: theme.textSecondary, border: theme.border },
    CLOSED: { background: theme.backgroundElement, text: theme.textMuted, border: theme.border },
  };

  const current = palette[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: current.background,
          borderColor: current.border ?? 'transparent',
          borderWidth: current.border ? 1 : 0,
        },
      ]}
    >
      <ThemedText style={[styles.badgeText, { color: current.text }]}>
        {getTicketStatusLabel(status)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.small,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getNotificationTypeLabel,
  type UserNotification,
} from '@/services/notifications-api';

type NotificationItemCardProps = {
  notification: UserNotification;
  busy: boolean;
  onMarkRead: (id: number) => Promise<void>;
};

export function NotificationItemCard({
  notification,
  busy,
  onMarkRead,
}: NotificationItemCardProps) {
  const theme = useTheme();
  const formattedDate = notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.background,
          borderColor: notification.read ? theme.border : theme.borderStrong,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border, borderWidth: 1 },
            ]}
          >
            <ThemedText style={styles.badgeText} themeColor="textSecondary">
              {getNotificationTypeLabel(notification.type)}
            </ThemedText>
          </View>

          {!notification.read && (
            <View style={[styles.badge, { backgroundColor: theme.okSoft }]}>
              <ThemedText style={[styles.badgeText, { color: theme.ok }]}>
                Non lue
              </ThemedText>
            </View>
          )}
        </View>

        {!!formattedDate && (
          <ThemedText style={styles.dateText} themeColor="textMuted">
            {formattedDate}
          </ThemedText>
        )}
      </View>

      <View style={styles.body}>
        <ThemedText style={styles.title}>{notification.title}</ThemedText>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">
          {notification.message}
        </ThemedText>
      </View>

      {notification.variantAlert && (
        <View
          style={[
            styles.variantBox,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          {!!notification.variantAlert.productName && (
            <ThemedText style={styles.variantProduct}>
              {notification.variantAlert.productName}
            </ThemedText>
          )}
          <ThemedText style={styles.variantMeta} themeColor="textSecondary">
            {notification.variantAlert.sku
              ? `Réf. ${notification.variantAlert.sku}`
              : `Variante #${notification.variantAlert.variantId}`}
            {notification.variantAlert.currentStock !== null
              ? ` · Stock : ${notification.variantAlert.currentStock}`
              : ''}
          </ThemedText>
        </View>
      )}

      {!notification.read && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Marquer comme lue : ${notification.title}`}
          accessibilityState={{ disabled: busy, busy }}
          disabled={busy}
          onPress={() => void onMarkRead(notification.id)}
          style={({ pressed }) => [
            styles.secondaryButton,
            { backgroundColor: theme.background, borderColor: theme.borderStrong },
            (pressed || busy) && styles.pressed,
          ]}
        >
          <ThemedText style={styles.buttonText}>Marquer comme lue</ThemedText>
        </Pressable>
      )}
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.small,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  dateText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 17,
  },
  body: {
    gap: Spacing.one,
  },
  title: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
  },
  variantBox: {
    borderWidth: 1,
    borderRadius: Radius.panel,
    padding: Spacing.small,
    gap: Spacing.half,
  },
  variantProduct: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  variantMeta: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 19,
  },
  secondaryButton: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.78,
  },
});
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Address } from '@/services/user-profile-api';

type AddressCardProps = {
  address: Address;
  busy: boolean;
  onEdit: (address: Address) => void;
  onSetDefault: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function AddressCard({
  address,
  busy,
  onEdit,
  onSetDefault,
  onDelete,
}: AddressCardProps) {
  const theme = useTheme();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.header}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">
          {address.label || 'Adresse enregistrée'}
        </ThemedText>
        {address.isDefault && (
          <View style={[styles.badge, { backgroundColor: theme.okSoft }]}>
            <ThemedText style={[styles.badgeText, { color: theme.ok }]}>
              Adresse par défaut
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <ThemedText style={styles.recipient}>{address.recipient}</ThemedText>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">
          {address.street}
        </ThemedText>
        {!!address.complement && (
          <ThemedText style={LoginTypography.body} themeColor="textSecondary">
            {address.complement}
          </ThemedText>
        )}
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">
          {`${address.zipCode} ${address.city}`}
        </ThemedText>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">
          {address.country}
        </ThemedText>
      </View>

      {confirmingDelete ? (
        <View style={[styles.confirmBox, { backgroundColor: theme.dangerSoft }]}>
          <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>
            Supprimer définitivement cette adresse ?
          </ThemedText>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Confirmer la suppression de l’adresse ${address.label || address.recipient}`}
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={() => void onDelete(address.id)}
              style={({ pressed }) => [
                styles.dangerButton,
                { backgroundColor: theme.background, borderColor: theme.danger },
                (pressed || busy) && styles.pressed,
              ]}
            >
              <ThemedText style={[styles.buttonText, { color: theme.danger }]}>
                {busy ? 'Suppression…' : 'Confirmer'}
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Annuler la suppression"
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={() => setConfirmingDelete(false)}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: theme.background, borderColor: theme.borderStrong },
                (pressed || busy) && styles.pressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>Annuler</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          {!address.isDefault && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Définir ${address.label || address.recipient} par défaut`}
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={() => void onSetDefault(address.id)}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: theme.background, borderColor: theme.borderStrong },
                (pressed || busy) && styles.pressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>Définir par défaut</ThemedText>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Modifier l’adresse ${address.label || address.recipient}`}
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => onEdit(address)}
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: theme.background, borderColor: theme.borderStrong },
              (pressed || busy) && styles.pressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>Modifier</ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Supprimer l’adresse ${address.label || address.recipient}`}
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => setConfirmingDelete(true)}
            style={({ pressed }) => [
              styles.dangerButton,
              { backgroundColor: theme.background, borderColor: theme.danger },
              (pressed || busy) && styles.pressed,
            ]}
          >
            <ThemedText style={[styles.buttonText, { color: theme.danger }]}>Supprimer</ThemedText>
          </Pressable>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  body: {
    gap: Spacing.half,
  },
  recipient: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  confirmBox: {
    borderRadius: Radius.panel,
    padding: Spacing.small,
    gap: Spacing.small,
    marginTop: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  secondaryButton: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
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
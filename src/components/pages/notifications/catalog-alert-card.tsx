import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  formatPriceExclTax,
  getCatalogAlertTypeLabel,
  parsePositivePrice,
  validateUpdateAlertPrice,
  type CatalogAlert,
  type UpdateCatalogAlertPayload,
} from '@/services/notifications-api';

type CatalogAlertCardProps = {
  alert: CatalogAlert;
  busy: boolean;
  onUpdate: (id: number, payload: UpdateCatalogAlertPayload) => Promise<boolean>;
  onDelete: (id: number) => Promise<void>;
};

export function CatalogAlertCard({
  alert,
  busy,
  onUpdate,
  onDelete,
}: CatalogAlertCardProps) {
  const theme = useTheme();
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(
    alert.targetPriceExclTax !== null ? alert.targetPriceExclTax.toFixed(2).replace('.', ',') : ''
  );
  const [priceError, setPriceError] = useState<string | undefined>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const priceInputRef = useRef<ComponentRef<typeof TextInput>>(null);

  function openPriceEditor() {
    setPriceInput(
      alert.targetPriceExclTax !== null ? alert.targetPriceExclTax.toFixed(2).replace('.', ',') : ''
    );
    setPriceError(undefined);
    setConfirmingDelete(false);
    setEditingPrice(true);
  }

  async function savePrice() {
    if (busy) return;
    const error = validateUpdateAlertPrice(priceInput);
    setPriceError(error);
    if (error) {
      priceInputRef.current?.focus();
      return;
    }
    const parsed = parsePositivePrice(priceInput);
    if (!parsed) return;

    const ok = await onUpdate(alert.id, { targetPriceExclTax: parsed });
    if (ok) {
      setEditingPrice(false);
    }
  }

  const createdLabel = alert.createdAt
    ? new Date(alert.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const triggeredLabel = alert.triggeredAt
    ? new Date(alert.triggeredAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">
          {getCatalogAlertTypeLabel(alert.alertType)}
        </ThemedText>

        {alert.active ? (
          <View style={[styles.badge, { backgroundColor: theme.okSoft }]}>
            <ThemedText style={[styles.badgeText, { color: theme.ok }]}>Active</ThemedText>
          </View>
        ) : (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border, borderWidth: 1 },
            ]}
          >
            <ThemedText style={styles.badgeText} themeColor="textSecondary">
              {alert.triggeredAt ? 'Déclenchée' : 'En pause'}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <ThemedText style={styles.variantTitle}>
          {`Variante #${alert.variantId}`}
          {alert.productId !== null ? ` · Produit #${alert.productId}` : ''}
        </ThemedText>

        {alert.alertType === 'PRICE_DROP' && alert.targetPriceExclTax !== null && (
          <ThemedText style={LoginTypography.lead}>
            {`Seuil cible : ${formatPriceExclTax(alert.targetPriceExclTax)}`}
          </ThemedText>
        )}

        {!!createdLabel && (
          <ThemedText style={styles.metaText} themeColor="textSecondary">
            {`Créée le ${createdLabel}`}
            {triggeredLabel ? ` · Déclenchée le ${triggeredLabel}` : ''}
          </ThemedText>
        )}
      </View>

      {editingPrice && alert.alertType === 'PRICE_DROP' && (
        <View style={[styles.inlineEditor, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <ThemedText style={LoginTypography.label} themeColor="textMuted">
            Nouveau prix cible HT (€) *
          </ThemedText>
          <TextInput
            ref={priceInputRef}
            value={priceInput}
            onChangeText={(value) => {
              setPriceInput(value);
              if (priceError) setPriceError(undefined);
            }}
            accessibilityLabel="Nouveau prix cible hors taxes"
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={() => void savePrice()}
            editable={!busy}
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.background,
                borderColor: priceError ? theme.danger : theme.borderStrong,
              },
            ]}
          />
          {!!priceError && (
            <ThemedText style={[styles.errorText, { color: theme.danger }]}>{priceError}</ThemedText>
          )}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enregistrer le nouveau prix cible"
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={() => void savePrice()}
              style={({ pressed }) => [
                styles.primaryCompactButton,
                { backgroundColor: theme.accent },
                (pressed || busy) && styles.pressed,
              ]}
            >
              <ThemedText style={[styles.buttonText, { color: theme.onAccent }]}>
                Enregistrer
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Annuler la modification du prix"
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={() => {
                setEditingPrice(false);
                setPriceError(undefined);
              }}
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
      )}

      {confirmingDelete ? (
        <View style={[styles.confirmBox, { backgroundColor: theme.dangerSoft }]}>
          <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>
            Supprimer définitivement cette alerte ?
          </ThemedText>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Confirmer la suppression de l’alerte variante ${alert.variantId}`}
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={() => void onDelete(alert.id)}
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              alert.active
                ? `Mettre en pause l’alerte variante ${alert.variantId}`
                : `Réactiver l’alerte variante ${alert.variantId}`
            }
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => void onUpdate(alert.id, { active: !alert.active })}
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: theme.background, borderColor: theme.borderStrong },
              (pressed || busy) && styles.pressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>
              {alert.active ? 'Mettre en pause' : 'Réactiver'}
            </ThemedText>
          </Pressable>

          {alert.alertType === 'PRICE_DROP' && !editingPrice && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Modifier le seuil de prix de l’alerte variante ${alert.variantId}`}
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={openPriceEditor}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: theme.background, borderColor: theme.borderStrong },
                (pressed || busy) && styles.pressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>Modifier le prix</ThemedText>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Supprimer l’alerte variante ${alert.variantId}`}
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => {
              setEditingPrice(false);
              setConfirmingDelete(true);
            }}
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
  topRow: {
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
  details: {
    gap: Spacing.one,
  },
  variantTitle: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  metaText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 19,
  },
  inlineEditor: {
    borderWidth: 1,
    borderRadius: Radius.panel,
    padding: Spacing.small,
    gap: Spacing.small,
  },
  input: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.small,
    ...LoginTypography.body,
  },
  errorText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 20,
  },
  confirmBox: {
    borderRadius: Radius.panel,
    padding: Spacing.small,
    gap: Spacing.small,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  primaryCompactButton: {
    minHeight: ControlSize.input,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
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
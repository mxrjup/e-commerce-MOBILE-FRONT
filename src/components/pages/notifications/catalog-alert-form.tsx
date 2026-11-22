import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  parsePositiveIntegerId,
  parsePositivePrice,
  validateCreateAlertInput,
  type CatalogAlertType,
  type CreateAlertFormErrors,
  type CreateCatalogAlertPayload,
} from '@/services/notifications-api';

type CatalogAlertFormProps = {
  submitting: boolean;
  submitError: string;
  onSubmit: (payload: CreateCatalogAlertPayload) => Promise<void>;
  onCancel: () => void;
};

export function CatalogAlertForm({
  submitting,
  submitError,
  onSubmit,
  onCancel,
}: CatalogAlertFormProps) {
  const theme = useTheme();
  const [alertType, setAlertType] = useState<CatalogAlertType>('PRICE_DROP');
  const [variantId, setVariantId] = useState('');
  const [productId, setProductId] = useState('');
  const [targetPriceExclTax, setTargetPriceExclTax] = useState('');
  const [errors, setErrors] = useState<CreateAlertFormErrors>({});

  const variantIdRef = useRef<ComponentRef<typeof TextInput>>(null);
  const productIdRef = useRef<ComponentRef<typeof TextInput>>(null);
  const priceRef = useRef<ComponentRef<typeof TextInput>>(null);

  function handleSelectType(nextType: CatalogAlertType) {
    setAlertType(nextType);
    if (nextType === 'BACK_IN_STOCK' && errors.targetPriceExclTax) {
      setErrors((prev) => ({ ...prev, targetPriceExclTax: undefined }));
    }
  }

  async function handleSubmit() {
    if (submitting) return;

    const nextErrors = validateCreateAlertInput({
      variantId,
      productId,
      alertType,
      targetPriceExclTax,
    });
    setErrors(nextErrors);

    if (nextErrors.variantId) {
      variantIdRef.current?.focus();
      return;
    }
    if (nextErrors.productId) {
      productIdRef.current?.focus();
      return;
    }
    if (nextErrors.targetPriceExclTax) {
      priceRef.current?.focus();
      return;
    }

    const parsedVariantId = parsePositiveIntegerId(variantId);
    if (!parsedVariantId) return;

    const parsedProductId = parsePositiveIntegerId(productId);
    const parsedPrice = alertType === 'PRICE_DROP' ? parsePositivePrice(targetPriceExclTax) : null;

    await onSubmit({
      variantId: parsedVariantId,
      productId: parsedProductId ?? undefined,
      alertType,
      targetPriceExclTax: parsedPrice ?? undefined,
    });
  }

  return (
    <View style={[styles.panel, { backgroundColor: theme.background, borderColor: theme.borderStrong }]}>
      <ThemedText accessibilityRole="header" style={styles.title}>
        Nouvelle alerte catalogue
      </ThemedText>

      {!!submitError && (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.errorBanner, { backgroundColor: theme.dangerSoft }]}
        >
          <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>{submitError}</ThemedText>
        </View>
      )}

      <View style={styles.fieldGroup}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">
          Type d’alerte *
        </ThemedText>
        <View style={styles.typeRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: alertType === 'PRICE_DROP', disabled: submitting }}
            disabled={submitting}
            onPress={() => handleSelectType('PRICE_DROP')}
            style={({ pressed }) => [
              styles.typeButton,
              {
                backgroundColor: alertType === 'PRICE_DROP' ? theme.accent : theme.background,
                borderColor: alertType === 'PRICE_DROP' ? theme.accent : theme.borderStrong,
              },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText
              style={[
                styles.typeButtonText,
                { color: alertType === 'PRICE_DROP' ? theme.onAccent : theme.text },
              ]}
            >
              Baisse de prix
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: alertType === 'BACK_IN_STOCK', disabled: submitting }}
            disabled={submitting}
            onPress={() => handleSelectType('BACK_IN_STOCK')}
            style={({ pressed }) => [
              styles.typeButton,
              {
                backgroundColor: alertType === 'BACK_IN_STOCK' ? theme.accent : theme.background,
                borderColor: alertType === 'BACK_IN_STOCK' ? theme.accent : theme.borderStrong,
              },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText
              style={[
                styles.typeButtonText,
                { color: alertType === 'BACK_IN_STOCK' ? theme.onAccent : theme.text },
              ]}
            >
              Retour en stock
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">
          Identifiant de variante *
        </ThemedText>
        <TextInput
          ref={variantIdRef}
          value={variantId}
          onChangeText={(value) => {
            setVariantId(value);
            if (errors.variantId) setErrors((prev) => ({ ...prev, variantId: undefined }));
          }}
          accessibilityLabel="Identifiant de variante"
          keyboardType="number-pad"
          returnKeyType="next"
          onSubmitEditing={() => productIdRef.current?.focus()}
          editable={!submitting}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.background,
              borderColor: errors.variantId ? theme.danger : theme.borderStrong,
            },
          ]}
        />
        {!!errors.variantId && (
          <ThemedText style={[styles.errorText, { color: theme.danger }]}>{errors.variantId}</ThemedText>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">
          Identifiant produit (optionnel)
        </ThemedText>
        <TextInput
          ref={productIdRef}
          value={productId}
          onChangeText={(value) => {
            setProductId(value);
            if (errors.productId) setErrors((prev) => ({ ...prev, productId: undefined }));
          }}
          accessibilityLabel="Identifiant produit"
          keyboardType="number-pad"
          returnKeyType={alertType === 'PRICE_DROP' ? 'next' : 'done'}
          onSubmitEditing={() => {
            if (alertType === 'PRICE_DROP') {
              priceRef.current?.focus();
            } else {
              void handleSubmit();
            }
          }}
          editable={!submitting}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.background,
              borderColor: errors.productId ? theme.danger : theme.borderStrong,
            },
          ]}
        />
        {!!errors.productId && (
          <ThemedText style={[styles.errorText, { color: theme.danger }]}>{errors.productId}</ThemedText>
        )}
      </View>

      {alertType === 'PRICE_DROP' && (
        <View style={styles.fieldGroup}>
          <ThemedText style={LoginTypography.label} themeColor="textMuted">
            Prix cible HT (€) *
          </ThemedText>
          <TextInput
            ref={priceRef}
            value={targetPriceExclTax}
            onChangeText={(value) => {
              setTargetPriceExclTax(value);
              if (errors.targetPriceExclTax) {
                setErrors((prev) => ({ ...prev, targetPriceExclTax: undefined }));
              }
            }}
            accessibilityLabel="Prix cible hors taxes en euros"
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={() => void handleSubmit()}
            editable={!submitting}
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.background,
                borderColor: errors.targetPriceExclTax ? theme.danger : theme.borderStrong,
              },
            ]}
          />
          {!!errors.targetPriceExclTax && (
            <ThemedText style={[styles.errorText, { color: theme.danger }]}>
              {errors.targetPriceExclTax}
            </ThemedText>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Créer cette alerte"
          accessibilityState={{ disabled: submitting, busy: submitting }}
          disabled={submitting}
          onPress={() => void handleSubmit()}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: theme.accent },
            (pressed || submitting) && styles.pressed,
          ]}
        >
          <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>
            {submitting ? 'Création…' : 'Créer l’alerte'}
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Annuler la création d’alerte"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={onCancel}
          style={({ pressed }) => [
            styles.secondaryButton,
            { backgroundColor: theme.background, borderColor: theme.borderStrong },
            (pressed || submitting) && styles.pressed,
          ]}
        >
          <ThemedText style={styles.secondaryButtonText}>Annuler</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  title: {
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.18,
  },
  errorBanner: {
    borderRadius: Radius.panel,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.small,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.small,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    minWidth: 140,
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
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
  actions: {
    gap: Spacing.small,
    paddingTop: Spacing.one,
  },
  primaryButton: {
    minHeight: ControlSize.primary,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.four,
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
  secondaryButtonText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.78,
  },
});
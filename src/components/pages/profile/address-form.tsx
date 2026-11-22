import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  validateAddress,
  type Address,
  type AddressFieldErrors,
  type AddressPayload,
} from '@/services/user-profile-api';

type AddressFormProps = {
  initialAddress?: Address;
  submitting: boolean;
  submitError: string;
  onSubmit: (payload: AddressPayload) => Promise<void>;
  onCancel: () => void;
};

export function AddressForm({
  initialAddress,
  submitting,
  submitError,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const theme = useTheme();
  const isEditing = Boolean(initialAddress);

  const [label, setLabel] = useState(initialAddress?.label ?? '');
  const [recipient, setRecipient] = useState(initialAddress?.recipient ?? '');
  const [street, setStreet] = useState(initialAddress?.street ?? '');
  const [complement, setComplement] = useState(initialAddress?.complement ?? '');
  const [zipCode, setZipCode] = useState(initialAddress?.zipCode ?? '');
  const [city, setCity] = useState(initialAddress?.city ?? '');
  const [country, setCountry] = useState(initialAddress?.country ?? 'France');
  const [isDefault, setIsDefault] = useState(initialAddress?.isDefault ?? false);
  const [errors, setErrors] = useState<AddressFieldErrors>({});

  const recipientRef = useRef<TextInput>(null);
  const streetRef = useRef<TextInput>(null);
  const complementRef = useRef<TextInput>(null);
  const zipCodeRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const countryRef = useRef<TextInput>(null);

  async function handleSubmit() {
    if (submitting) return;
    const payload: AddressPayload = {
      label,
      recipient,
      street,
      complement,
      zipCode,
      city,
      country,
      isDefault,
    };

    const nextErrors = validateAddress(payload);
    setErrors(nextErrors);

    if (nextErrors.recipient) {
      recipientRef.current?.focus();
      return;
    }
    if (nextErrors.street) {
      streetRef.current?.focus();
      return;
    }
    if (nextErrors.zipCode) {
      zipCodeRef.current?.focus();
      return;
    }
    if (nextErrors.city) {
      cityRef.current?.focus();
      return;
    }
    if (nextErrors.country) {
      countryRef.current?.focus();
      return;
    }

    await onSubmit(payload);
  }

  return (
    <View style={[styles.panel, { backgroundColor: theme.background, borderColor: theme.borderStrong }]}>
      <ThemedText accessibilityRole="header" style={styles.title}>
        {isEditing ? 'Modifier l’adresse' : 'Nouvelle adresse'}
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
          Libellé (ex. Domicile, Bureau)
        </ThemedText>
        <TextInput
          value={label}
          onChangeText={setLabel}
          accessibilityLabel="Libellé de l’adresse"
          returnKeyType="next"
          onSubmitEditing={() => recipientRef.current?.focus()}
          editable={!submitting}
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.background, borderColor: theme.borderStrong },
          ]}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">
          Destinataire *
        </ThemedText>
        <TextInput
          ref={recipientRef}
          value={recipient}
          onChangeText={(value) => {
            setRecipient(value);
            if (errors.recipient) setErrors((prev) => ({ ...prev, recipient: undefined }));
          }}
          accessibilityLabel="Nom du destinataire"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => streetRef.current?.focus()}
          editable={!submitting}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.background,
              borderColor: errors.recipient ? theme.danger : theme.borderStrong,
            },
          ]}
        />
        {!!errors.recipient && (
          <ThemedText style={[styles.errorText, { color: theme.danger }]}>{errors.recipient}</ThemedText>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">
          Numéro et rue *
        </ThemedText>
        <TextInput
          ref={streetRef}
          value={street}
          onChangeText={(value) => {
            setStreet(value);
            if (errors.street) setErrors((prev) => ({ ...prev, street: undefined }));
          }}
          accessibilityLabel="Numéro et rue"
          autoComplete="street-address"
          textContentType="streetAddressLine1"
          returnKeyType="next"
          onSubmitEditing={() => complementRef.current?.focus()}
          editable={!submitting}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.background,
              borderColor: errors.street ? theme.danger : theme.borderStrong,
            },
          ]}
        />
        {!!errors.street && (
          <ThemedText style={[styles.errorText, { color: theme.danger }]}>{errors.street}</ThemedText>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">
          Complément d’adresse
        </ThemedText>
        <TextInput
          ref={complementRef}
          value={complement}
          onChangeText={setComplement}
          accessibilityLabel="Complément d’adresse"
          textContentType="streetAddressLine2"
          returnKeyType="next"
          onSubmitEditing={() => zipCodeRef.current?.focus()}
          editable={!submitting}
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.background, borderColor: theme.borderStrong },
          ]}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.zipField]}>
          <ThemedText style={LoginTypography.label} themeColor="textMuted">
            Code postal *
          </ThemedText>
          <TextInput
            ref={zipCodeRef}
            value={zipCode}
            onChangeText={(value) => {
              setZipCode(value);
              if (errors.zipCode) setErrors((prev) => ({ ...prev, zipCode: undefined }));
            }}
            accessibilityLabel="Code postal"
            autoComplete="postal-code"
            textContentType="postalCode"
            returnKeyType="next"
            onSubmitEditing={() => cityRef.current?.focus()}
            editable={!submitting}
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.background,
                borderColor: errors.zipCode ? theme.danger : theme.borderStrong,
              },
            ]}
          />
          {!!errors.zipCode && (
            <ThemedText style={[styles.errorText, { color: theme.danger }]}>{errors.zipCode}</ThemedText>
          )}
        </View>

        <View style={[styles.fieldGroup, styles.cityField]}>
          <ThemedText style={LoginTypography.label} themeColor="textMuted">
            Ville *
          </ThemedText>
          <TextInput
            ref={cityRef}
            value={city}
            onChangeText={(value) => {
              setCity(value);
              if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
            }}
            accessibilityLabel="Ville"
            autoComplete="address-level2"
            textContentType="addressCity"
            returnKeyType="next"
            onSubmitEditing={() => countryRef.current?.focus()}
            editable={!submitting}
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.background,
                borderColor: errors.city ? theme.danger : theme.borderStrong,
              },
            ]}
          />
          {!!errors.city && (
            <ThemedText style={[styles.errorText, { color: theme.danger }]}>{errors.city}</ThemedText>
          )}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">
          Pays *
        </ThemedText>
        <TextInput
          ref={countryRef}
          value={country}
          onChangeText={(value) => {
            setCountry(value);
            if (errors.country) setErrors((prev) => ({ ...prev, country: undefined }));
          }}
          accessibilityLabel="Pays"
          autoComplete="country"
          textContentType="countryName"
          returnKeyType="done"
          onSubmitEditing={() => void handleSubmit()}
          editable={!submitting}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.background,
              borderColor: errors.country ? theme.danger : theme.borderStrong,
            },
          ]}
        />
        {!!errors.country && (
          <ThemedText style={[styles.errorText, { color: theme.danger }]}>{errors.country}</ThemedText>
        )}
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel="Définir comme adresse par défaut"
        accessibilityState={{ checked: isDefault, disabled: submitting }}
        disabled={submitting}
        onPress={() => setIsDefault((value) => !value)}
        style={({ pressed }) => [
          styles.checkboxRow,
          {
            borderColor: isDefault ? theme.accent : theme.borderStrong,
            backgroundColor: isDefault ? theme.backgroundSelected : theme.background,
          },
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.checkboxBox,
            {
              borderColor: isDefault ? theme.accent : theme.borderStrong,
              backgroundColor: isDefault ? theme.accent : theme.background,
            },
          ]}
        >
          {isDefault && (
            <ThemedText style={[styles.checkmark, { color: theme.onAccent }]}>✓</ThemedText>
          )}
        </View>
        <ThemedText style={LoginTypography.body}>Définir comme adresse par défaut</ThemedText>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Enregistrer l’adresse' : 'Ajouter cette adresse'}
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
            {submitting
              ? 'Enregistrement…'
              : isEditing
                ? 'Enregistrer l’adresse'
                : 'Ajouter l’adresse'}
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Annuler"
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
  row: {
    flexDirection: 'row',
    gap: Spacing.small,
  },
  zipField: {
    flex: 2,
  },
  cityField: {
    flex: 3,
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
  checkboxRow: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.small,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
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
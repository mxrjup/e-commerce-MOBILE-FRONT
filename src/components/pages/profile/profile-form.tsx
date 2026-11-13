import React, { ComponentRef, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { UserProfile, UserProfileUpdateRequest } from '@/types/user';

interface ProfileFormProps {
  profile: UserProfile;
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  onSubmit: (payload: UserProfileUpdateRequest) => Promise<void>;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
}

export function ProfileForm({
  profile,
  isSubmitting,
  submitError,
  submitSuccess,
  onSubmit,
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(profile.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});

  const firstNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const lastNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const phoneRef = useRef<ComponentRef<typeof TextInput>>(null);

  const handleSave = async () => {
    if (isSubmitting) return;

    const nextErrors: FieldErrors = {};
    if (!firstName.trim()) {
      nextErrors.firstName = 'Le prénom est obligatoire.';
    }
    if (!lastName.trim()) {
      nextErrors.lastName = 'Le nom est obligatoire.';
    }

    setErrors(nextErrors);

    if (nextErrors.firstName) {
      firstNameRef.current?.focus();
      return;
    }
    if (nextErrors.lastName) {
      lastNameRef.current?.focus();
      return;
    }

    await onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() ? phone.trim() : undefined,
    });
  };

  return (
    <View style={styles.container}>
      {submitSuccess && (
        <View style={styles.bannerOk} accessibilityRole="alert">
          <Text style={styles.bannerOkText}>Informations enregistrées.</Text>
        </View>
      )}

      {submitError && (
        <View style={styles.bannerDanger} accessibilityRole="alert">
          <Text style={styles.bannerDangerText}>{submitError}</Text>
        </View>
      )}

      {/* Email en lecture seule (géré par Keycloak) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>ADRESSE E-MAIL</Text>
        <View style={styles.readonlyBox} accessible accessibilityLabel="Adresse e-mail">
          <Text style={styles.readonlyText}>{profile.email}</Text>
        </View>
        <Text style={styles.helperText}>
          L’adresse e-mail est liée à votre compte de connexion.
        </Text>
      </View>

      {/* Prénom */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>PRÉNOM</Text>
        <TextInput
          ref={firstNameRef}
          style={[styles.input, errors.firstName ? styles.inputInvalid : null]}
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
          }}
          accessibilityLabel="Prénom"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current?.focus()}
          editable={!isSubmitting}
        />
        {errors.firstName && (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.firstName}
          </Text>
        )}
      </View>

      {/* Nom */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>NOM</Text>
        <TextInput
          ref={lastNameRef}
          style={[styles.input, errors.lastName ? styles.inputInvalid : null]}
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }));
          }}
          accessibilityLabel="Nom"
          autoComplete="family-name"
          textContentType="familyName"
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current?.focus()}
          editable={!isSubmitting}
        />
        {errors.lastName && (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.lastName}
          </Text>
        )}
      </View>

      {/* Téléphone */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>TÉLÉPHONE</Text>
        <TextInput
          ref={phoneRef}
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          accessibilityLabel="Téléphone"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="done"
          onSubmitEditing={handleSave}
          editable={!isSubmitting}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          (isSubmitting || pressed) && styles.primaryButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Enregistrer les modifications"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Enregistrer</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: '#696257', // ink-3
  },
  input: {
    height: 44,
    backgroundColor: '#FFFFFF', // canvas
    borderWidth: 1,
    borderColor: '#938B80', // line-strong
    borderRadius: 6, // rounded.sm
    paddingHorizontal: 12,
    fontFamily: 'Manrope',
    fontSize: 17, // lead (mobile body)
    color: '#17150F', // ink
  },
  inputInvalid: {
    borderColor: '#B3261E', // danger
  },
  readonlyBox: {
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: '#F6F4F0', // canvas-warm
    borderWidth: 1,
    borderColor: '#E3DFD8', // line
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  readonlyText: {
    fontFamily: 'Manrope',
    fontSize: 17,
    color: '#55504A', // ink-2
  },
  helperText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 20,
    color: '#55504A', // ink-2
  },
  errorText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 20,
    color: '#B3261E', // danger
  },
  bannerOk: {
    backgroundColor: '#E7F1EB', // ok-soft
    borderRadius: 10, // rounded.md
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  bannerOkText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    color: '#15603A', // ok
  },
  bannerDanger: {
    backgroundColor: '#FBEAE8', // danger-soft
    borderRadius: 10, // rounded.md
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  bannerDangerText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    color: '#17150F', // ink
  },
  primaryButton: {
    height: 52, // button-primary-mobile
    backgroundColor: '#9A5518', // accent
    borderRadius: 6, // rounded.sm
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    fontFamily: 'Manrope',
    fontSize: 16, // button-lg
    fontWeight: '600',
    color: '#FFFFFF', // canvas
  },
});
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  validateUserProfile,
  type UserProfile,
  type UserProfileErrors,
  type UserProfileUpdatePayload,
} from '@/services/user-profile-api';

type ProfileDetailsCardProps = {
  profile: UserProfile;
  saving: boolean;
  saveError: string;
  saveSuccess: string;
  onSave: (payload: UserProfileUpdatePayload) => Promise<boolean>;
  onClearFeedback: () => void;
};

export function ProfileDetailsCard({
  profile,
  saving,
  saveError,
  saveSuccess,
  onSave,
  onClearFeedback,
}: ProfileDetailsCardProps) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);
  const [fieldErrors, setFieldErrors] = useState<UserProfileErrors>({});

  const firstNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const lastNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const phoneRef = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (!editing) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setPhone(profile.phone);
      setFieldErrors({});
    }
  }, [editing, profile.firstName, profile.lastName, profile.phone]);

  function startEditing() {
    onClearFeedback();
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhone(profile.phone);
    setFieldErrors({});
    setEditing(true);
  }

  function cancelEditing() {
    onClearFeedback();
    setFieldErrors({});
    setEditing(false);
  }

  async function handleSubmit() {
    if (saving) return;
    onClearFeedback();
    const errors = validateUserProfile({ firstName, lastName, phone });
    setFieldErrors(errors);

    if (errors.firstName) {
      firstNameRef.current?.focus();
      return;
    }
    if (errors.lastName) {
      lastNameRef.current?.focus();
      return;
    }

    const ok = await onSave({ firstName, lastName, phone });
    if (ok) {
      setEditing(false);
    }
  }

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <ThemedText accessibilityRole="header" style={styles.sectionTitle}>
          Informations personnelles
        </ThemedText>
        {!editing && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Modifier mes informations personnelles"
            onPress={startEditing}
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: theme.background, borderColor: theme.borderStrong },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>Modifier</ThemedText>
          </Pressable>
        )}
      </View>

      {!!saveSuccess && !editing && (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.banner, { backgroundColor: theme.okSoft }]}
        >
          <ThemedText style={[LoginTypography.body, { color: theme.ok }]}>{saveSuccess}</ThemedText>
        </View>
      )}

      {!!saveError && (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.banner, { backgroundColor: theme.dangerSoft }]}
        >
          <ThemedText style={[LoginTypography.body, { color: theme.danger }]}>{saveError}</ThemedText>
        </View>
      )}

      {!editing ? (
        <View style={styles.readGrid}>
          <View style={styles.fieldRead}>
            <ThemedText style={LoginTypography.label} themeColor="textMuted">
              Nom complet
            </ThemedText>
            <ThemedText style={LoginTypography.lead}>
              {fullName || 'Non renseigné'}
            </ThemedText>
          </View>

          <View style={styles.fieldRead}>
            <ThemedText style={LoginTypography.label} themeColor="textMuted">
              Adresse e-mail
            </ThemedText>
            <ThemedText style={LoginTypography.lead}>
              {profile.email || 'Non renseignée'}
            </ThemedText>
          </View>

          <View style={styles.fieldRead}>
            <ThemedText style={LoginTypography.label} themeColor="textMuted">
              Téléphone
            </ThemedText>
            <ThemedText style={LoginTypography.lead}>
              {profile.phone || 'Non renseigné'}
            </ThemedText>
          </View>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <ThemedText style={LoginTypography.label} themeColor="textMuted">
              Prénom *
            </ThemedText>
            <TextInput
              ref={firstNameRef}
              value={firstName}
              onChangeText={(value) => {
                setFirstName(value);
                if (fieldErrors.firstName) {
                  setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                }
              }}
              accessibilityLabel="Prénom"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              editable={!saving}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: fieldErrors.firstName ? theme.danger : theme.borderStrong,
                },
              ]}
            />
            {!!fieldErrors.firstName && (
              <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                {fieldErrors.firstName}
              </ThemedText>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={LoginTypography.label} themeColor="textMuted">
              Nom *
            </ThemedText>
            <TextInput
              ref={lastNameRef}
              value={lastName}
              onChangeText={(value) => {
                setLastName(value);
                if (fieldErrors.lastName) {
                  setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                }
              }}
              accessibilityLabel="Nom"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              editable={!saving}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: fieldErrors.lastName ? theme.danger : theme.borderStrong,
                },
              ]}
            />
            {!!fieldErrors.lastName && (
              <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                {fieldErrors.lastName}
              </ThemedText>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={LoginTypography.label} themeColor="textMuted">
              Téléphone
            </ThemedText>
            <TextInput
              ref={phoneRef}
              value={phone}
              onChangeText={setPhone}
              accessibilityLabel="Téléphone"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="done"
              onSubmitEditing={() => void handleSubmit()}
              editable={!saving}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.borderStrong,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={LoginTypography.label} themeColor="textMuted">
              Adresse e-mail
            </ThemedText>
            <View style={[styles.readOnlyBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <ThemedText style={LoginTypography.body} themeColor="textSecondary">
                {profile.email}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enregistrer les modifications du profil"
              accessibilityState={{ disabled: saving, busy: saving }}
              disabled={saving}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.accent },
                (pressed || saving) && styles.pressed,
              ]}
            >
              <ThemedText style={[LoginTypography.button, { color: theme.onAccent }]}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Annuler la modification du profil"
              accessibilityState={{ disabled: saving }}
              disabled={saving}
              onPress={cancelEditing}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: theme.background, borderColor: theme.borderStrong },
                (pressed || saving) && styles.pressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>Annuler</ThemedText>
            </Pressable>
          </View>
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
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.small,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.18,
  },
  readGrid: {
    gap: Spacing.three,
  },
  fieldRead: {
    gap: Spacing.one,
  },
  form: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  input: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.small,
    ...LoginTypography.body,
  },
  readOnlyBox: {
    minHeight: ControlSize.input,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.small,
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 20,
  },
  banner: {
    borderRadius: Radius.panel,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.small,
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
import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { unavailableAccessories, unavailableReviews } from './product-logic';

export function ProductSection({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.section, { borderTopColor: theme.border }]}>
    <ThemedText accessibilityRole="header" style={LoginTypography.lead}>{title}</ThemedText>
    {children}
  </View>;
}

// No review/accessory endpoint exists yet: deliberately no invented API model.
export function ProductReviews() {
  return <ProductSection title="Avis clients"><ThemedText themeColor="textSecondary">{unavailableReviews}</ThemedText></ProductSection>;
}
export function ProductAccessories() {
  return <ProductSection title="Accessoires associés"><ThemedText themeColor="textSecondary">{unavailableAccessories}</ThemedText></ProductSection>;
}

const styles = StyleSheet.create({ section: { borderTopWidth: 1, paddingTop: Spacing.four, gap: Spacing.small } });

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoginBrand({ inverse = false }: { inverse?: boolean }) {
  const theme = useTheme();
  const color = inverse ? theme.onHero : theme.text;
  return (
    <View style={styles.brand} accessibilityLabel="LOG, le sens du bois" accessibilityRole="header">
      <View accessible={false} style={[styles.ring, { borderColor: color }]}>
        <View style={[styles.innerRing, { borderColor: color }]}>
          <View style={[styles.center, { backgroundColor: color }]} />
        </View>
      </View>
      <ThemedText style={[styles.wordmark, { color }]}>LOG</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small },
  ring: { width: 36, height: 36, borderWidth: 2, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  innerRing: { width: 23, height: 23, borderWidth: 2, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  center: { width: 8, height: 8, borderRadius: Radius.pill },
  wordmark: { ...LoginTypography.title, fontSize: 28, lineHeight: 36, letterSpacing: -1 },
});

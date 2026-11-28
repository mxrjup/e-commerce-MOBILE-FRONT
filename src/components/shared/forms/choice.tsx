import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Choice({ label, accessibilityLabel, selected = false, onPress, disabled = false }: { label: string; accessibilityLabel?: string; selected?: boolean; onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.choice, { borderColor: selected ? theme.accent : theme.border, backgroundColor: selected ? theme.backgroundSelected : theme.background, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
    <ThemedText style={[LoginTypography.body, selected && { color: theme.accent, fontWeight: '700' }]}>{selected ? '✓ ' : ''}{label}</ThemedText>
  </Pressable>;
}

const styles = StyleSheet.create({
  choice: { borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 12, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
});

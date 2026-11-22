import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Accordion({ title, children, count = 0, summary, defaultExpanded = false }: {
  title: string; children: ReactNode; count?: number; summary?: string; defaultExpanded?: boolean;
}) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [focused, setFocused] = useState(false);
  const label = [title, count > 0 ? `${count} sélectionné${count > 1 ? 's' : ''}` : '', summary].filter(Boolean).join(', ');

  return <View style={styles.section}>
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded }} aria-expanded={expanded}
      onPress={() => setExpanded(value => !value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={({ pressed }) => [styles.header, {
        borderColor: focused ? theme.accent : theme.border,
        backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1,
      }]}>
      <View style={styles.label}>
        <ThemedText style={LoginTypography.button}>{title}</ThemedText>
        {!!summary && <ThemedText style={LoginTypography.body} themeColor="textSecondary">{summary}</ThemedText>}
      </View>
      {count > 0 && <ThemedText themeColor="accent" style={LoginTypography.button}>{count}</ThemedText>}
      <ThemedText aria-hidden style={LoginTypography.button}>{expanded ? '▾' : '▸'}</ThemedText>
    </Pressable>
    {expanded && <View style={styles.content}>{children}</View>}
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  header: { minHeight: ControlSize.touch, borderWidth: 1, borderRadius: Radius.control, padding: Spacing.small, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  label: { flex: 1, gap: Spacing.one },
  content: { gap: Spacing.two },
});

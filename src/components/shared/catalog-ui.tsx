import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { categories, formatPrice, type Product } from '@/services/catalog';

export function Choice({ label, selected = false, onPress, disabled = false }: { label: string; selected?: boolean; onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.choice, { borderColor: selected ? theme.accent : theme.border, backgroundColor: selected ? theme.backgroundSelected : theme.background, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
    <ThemedText style={[LoginTypography.body, selected && { color: theme.accent, fontWeight: '700' }]}>{selected ? '✓ ' : ''}{label}</ThemedText>
  </Pressable>;
}
export function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const theme = useTheme();
  return <View style={[styles.imageBox, large && styles.largeImage, { backgroundColor: theme.backgroundElement }]}>
    {!failed ? <Image source={{ uri: product.image }} accessibilityLabel={`Photo d’illustration : ${product.name}`} style={styles.image} resizeMode="cover" onError={() => setFailed(true)} />
      : <ThemedText style={styles.fallback}>{categories.find(c => c.id === product.category)?.symbol}{'\n'}{product.name}</ThemedText>}
  </View>;
}
export function ProductCard({ product }: { product: Product }) {
  const theme = useTheme();
  return <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
    <Pressable accessibilityRole="link" accessibilityLabel={`${product.brand} ${product.name}, ${formatPrice(product.price)}, ${product.stock ? 'en stock' : 'indisponible'}`}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.75 : 1 }]}>
      <ProductImage product={product} />
      <View style={styles.cardBody}>
        <ThemedText style={LoginTypography.label} themeColor="textMuted">{product.brand}{product.badge ? ` · ${product.badge}` : ''}</ThemedText>
        <ThemedText style={styles.name}>{product.name}</ThemedText>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">{Object.values(product.specs).slice(0, 2).join(' · ')}</ThemedText>
        <View style={styles.prices}><ThemedText style={styles.price}>{formatPrice(product.price)}</ThemedText>
          {!!product.previousPrice && <ThemedText themeColor="textMuted" style={styles.oldPrice}>{formatPrice(product.previousPrice)}</ThemedText>}</View>
        <ThemedText style={LoginTypography.body} themeColor="textSecondary">{product.stock > 0 ? '● En stock' : 'Indisponible'}</ThemedText>
        <ThemedText style={LoginTypography.body} themeColor="accent">Découvrir le produit →</ThemedText>
      </View>
    </Pressable>
  </Link>;
}
const styles = StyleSheet.create({
  choice: { borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 12, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  card: { flex: 1, borderWidth: 1, borderRadius: Radius.panel, overflow: 'hidden' }, cardBody: { padding: 16, gap: 8, flex: 1 },
  imageBox: { width: '100%', height: 160, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, largeImage: { height: 320, borderRadius: Radius.panel },
  image: { width: '100%', height: '100%' }, fallback: { textAlign: 'center', fontSize: 24, padding: 16 }, name: { ...LoginTypography.lead, fontWeight: '700' },
  prices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 'auto', paddingTop: 8 }, price: { ...LoginTypography.lead, fontWeight: '800' }, oldPrice: { ...LoginTypography.body, textDecorationLine: 'line-through' },
});

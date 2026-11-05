import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ProductImage } from '@/components/shared/product/product-image';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice, type Product } from '@/services/catalog';

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
  card: { flex: 1, borderWidth: 1, borderRadius: Radius.panel, overflow: 'hidden' },
  cardBody: { padding: 16, gap: 8, flex: 1 },
  name: { ...LoginTypography.lead, fontWeight: '700' },
  prices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 'auto', paddingTop: 8 },
  price: { ...LoginTypography.lead, fontWeight: '800' },
  oldPrice: { ...LoginTypography.body, textDecorationLine: 'line-through' },
});

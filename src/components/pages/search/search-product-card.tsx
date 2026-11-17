import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ProductCardResponse } from '@/services/product-search-api';

export function SearchProductCard({ product }: { product: ProductCardResponse }) {
  const theme = useTheme();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.background }]}>
    {product.imageUrl && failedImage !== product.imageUrl
      ? <Image source={{ uri: product.imageUrl }} accessibilityLabel={product.title} resizeMode="contain" style={styles.image} onError={() => setFailedImage(product.imageUrl)} />
      : <ThemedText themeColor="textSecondary">Image indisponible · {product.title}</ThemedText>}
    <ThemedText style={LoginTypography.lead}>{product.title}</ThemedText>
    <ThemedText>À partir de {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.priceInclTax)} TTC</ThemedText>
    <ThemedText themeColor="textSecondary">{product.available ? 'Disponible' : 'Indisponible'}</ThemedText>
  </View>;
}
const styles = StyleSheet.create({ card: { padding: 12, gap: 12, borderRadius: Radius.card, borderWidth: 1, marginBottom: 16 }, image: { width: '100%', height: 160 } });

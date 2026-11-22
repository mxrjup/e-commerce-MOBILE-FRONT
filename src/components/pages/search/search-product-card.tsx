import { StyleSheet, View } from 'react-native';
import { ProductLink } from '@/components/shared/catalog/catalog-products';
import { Spacing } from '@/constants/theme';
import type { ProductCardResponse } from '@/services/product-search-api';

export function SearchProductCard({ product }: { product: ProductCardResponse }) {
  return <View style={styles.item}><ProductLink key={product.slug} product={product} /></View>;
}
const styles = StyleSheet.create({ item: { marginBottom: Spacing.three } });

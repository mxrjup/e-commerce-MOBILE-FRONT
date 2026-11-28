import { ProductPage } from '@/components/pages/product/product-page';
import { productSlug } from '@/components/pages/product/product-logic';
import { useLocalSearchParams } from 'expo-router';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const slug = productSlug(id);
  return <ProductPage key={slug} slug={slug} />;
}

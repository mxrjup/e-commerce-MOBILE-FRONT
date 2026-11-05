import { useLocalSearchParams } from 'expo-router';
import { ProductPage } from '@/components/pages/product/product-page';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  return <ProductPage key={String(id)} id={typeof id === 'string' ? id : ''} />;
}

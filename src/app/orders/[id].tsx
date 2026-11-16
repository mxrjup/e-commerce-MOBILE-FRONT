import { useLocalSearchParams } from 'expo-router';
import { OrderDetailPage } from '@/components/pages/orders/order-detail-page';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <OrderDetailPage key={typeof id === 'string' ? id : 'missing'} />;
}

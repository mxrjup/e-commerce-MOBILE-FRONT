export type OrderStatusKey = 'NEW' | 'IN_PREPARATION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type OrderTrackingStep = {
  key: OrderStatusKey;
  label: string;
  date: string;
  state: 'complete' | 'current' | 'upcoming';
};

export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

export type OrderHistoryEntry = {
  id: number;
  orderNumber: string;
  status: OrderStatusKey;
  deliveryMode: 'Livraison standard' | 'Livraison express' | 'Retrait magasin';
  totalInclTax: number;
  itemCount: number;
  createdAt: string;
  invoiceUrl: string;
  trackingNumber: string;
  shippingAddress: string;
  items: OrderItem[];
};

const STATUS_LABELS: Record<OrderStatusKey, string> = {
  NEW: 'Commande confirmée',
  IN_PREPARATION: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

const TRACKING_SEQUENCE: OrderStatusKey[] = ['NEW', 'IN_PREPARATION', 'SHIPPED', 'DELIVERED'];

export function normalizeOrderStatus(status?: string | null): OrderStatusKey | null {
  if (!status) return null;
  const normalized = status.toUpperCase();
  if (normalized === 'IN_PREPARATION') return 'IN_PREPARATION';
  if (normalized === 'NEW' || normalized === 'SHIPPED' || normalized === 'DELIVERED' || normalized === 'CANCELLED') {
    return normalized as OrderStatusKey;
  }
  return null;
}

export function getOrderStatusLabel(status?: string | null): string {
  const normalized = normalizeOrderStatus(status);
  return normalized ? STATUS_LABELS[normalized] : 'Statut inconnu';
}

export function getTrackingTimeline(status?: string | null): OrderTrackingStep[] {
  const normalized = normalizeOrderStatus(status) ?? 'NEW';
  const currentIndex = TRACKING_SEQUENCE.indexOf(normalized);

  return TRACKING_SEQUENCE.map((key, index) => ({
    key,
    label: STATUS_LABELS[key],
    date: index === 0 ? 'Aujourd’hui' : index === 1 ? 'Demain' : index === 2 ? 'En cours de livraison' : 'Livraison terminée',
    state: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
  }));
}

export function getOrderHistoryData(): OrderHistoryEntry[] {
  return [
    {
      id: 1048,
      orderNumber: 'LOG-1048',
      status: 'SHIPPED',
      deliveryMode: 'Livraison standard',
      totalInclTax: 1299,
      itemCount: 2,
      createdAt: '2026-11-05T09:30:00Z',
      invoiceUrl: 'https://example.com/invoices/log-1048.pdf',
      trackingNumber: 'LPD 4829 7314',
      shippingAddress: '12 rue des Foulons, 75011 Paris',
      items: [
        { name: 'MacBook Air 13 M2', quantity: 1, price: 1199 },
        { name: 'Magic Mouse', quantity: 1, price: 99 },
      ],
    },
    {
      id: 1027,
      orderNumber: 'LOG-1027',
      status: 'DELIVERED',
      deliveryMode: 'Livraison express',
      totalInclTax: 899,
      itemCount: 1,
      createdAt: '2026-10-20T15:15:00Z',
      invoiceUrl: 'https://example.com/invoices/log-1027.pdf',
      trackingNumber: 'LPD 2514 1980',
      shippingAddress: '8 boulevard Saint-Germain, 75005 Paris',
      items: [
        { name: 'iPhone 15 Pro', quantity: 1, price: 899 },
      ],
    },
    {
      id: 989,
      orderNumber: 'LOG-989',
      status: 'IN_PREPARATION',
      deliveryMode: 'Retrait magasin',
      totalInclTax: 459,
      itemCount: 2,
      createdAt: '2026-10-08T11:00:00Z',
      invoiceUrl: 'https://example.com/invoices/log-989.pdf',
      trackingNumber: 'Magasin central',
      shippingAddress: 'Paris 13 - Retrait sur place',
      items: [
        { name: 'AirPods Pro', quantity: 1, price: 249 },
        { name: 'Chargeur USB-C', quantity: 1, price: 210 },
      ],
    },
  ];
}

export type OrderStatusKey = 'NEW' | 'IN_PREPARATION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type OrderTrackingStep = {
  key: OrderStatusKey;
  label: string;
  date: string;
  state: 'complete' | 'current' | 'upcoming';
};

export type ApiOrderHistoryItem = {
  id: number;
  orderNumber: string;
  status: string | null;
  deliveryMode: string | null;
  totalInclTax: number | string | null;
  itemCount: number;
  createdAt: string | null;
};

export type ApiOrderDetailItem = {
  id: number;
  variantId: number;
  designation: string;
  unitPriceExclTax: number | string | null;
  vatRate: number | string | null;
  quantity: number;
  subTotalExclTax: number | string | null;
  subTotalInclTax: number | string | null;
};

export type ApiOrderDetail = {
  id: number;
  orderNumber: string;
  status: string | null;
  deliveryMode: string | null;
  totalExclTax: number | string | null;
  totalInclTax: number | string | null;
  createdAt: string | null;
  invoiceUrl: string | null;
  items: ApiOrderDetailItem[];
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
  deliveryMode: string;
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

export function mapOrderHistoryResponse(value: ApiOrderHistoryItem[]): OrderHistoryEntry[] {
  return value.map((order) => {
    const status = normalizeOrderStatus(order.status) ?? 'NEW';
    return {
      id: Number(order.id),
      orderNumber: order.orderNumber ?? `CMD-${order.id}`,
      status,
      deliveryMode: order.deliveryMode ? order.deliveryMode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) : 'Livraison standard',
      totalInclTax: Number(order.totalInclTax ?? 0),
      itemCount: Number(order.itemCount ?? 0),
      createdAt: order.createdAt ?? new Date().toISOString(),
      invoiceUrl: `https://example.com/invoices/${order.orderNumber.toLowerCase()}.pdf`,
      trackingNumber: `Suivi ${order.orderNumber}`,
      shippingAddress: 'Adresse de livraison mise à jour',
      items: [
        { name: order.orderNumber, quantity: Number(order.itemCount ?? 1), price: Number(order.totalInclTax ?? 0) },
      ],
    };
  });
}

export function mapOrderDetailResponse(value: ApiOrderDetail): OrderHistoryEntry {
  const status = normalizeOrderStatus(value.status) ?? 'NEW';
  return {
    id: Number(value.id),
    orderNumber: value.orderNumber ?? `CMD-${value.id}`,
    status,
    deliveryMode: value.deliveryMode ? value.deliveryMode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) : 'Livraison standard',
    totalInclTax: Number(value.totalInclTax ?? 0),
    itemCount: Array.isArray(value.items) ? value.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0,
    createdAt: value.createdAt ?? new Date().toISOString(),
    invoiceUrl: value.invoiceUrl ?? `https://example.com/invoices/${value.orderNumber.toLowerCase()}.pdf`,
    trackingNumber: `Suivi ${value.orderNumber}`,
    shippingAddress: 'Adresse de livraison mise à jour',
    items: (value.items ?? []).map((item) => ({
      name: item.designation ?? `Article ${item.id}`,
      quantity: Number(item.quantity ?? 0),
      price: Number(item.subTotalInclTax ?? item.unitPriceExclTax ?? 0),
    })),
  };
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

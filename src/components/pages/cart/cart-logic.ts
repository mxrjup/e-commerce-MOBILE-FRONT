export type CartLine = {
  id: number;
  variantId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  available: boolean;
};

export type ApiCartItem = {
  id?: number;
  variantId?: number;
  quantity?: number;
  productName?: string | null;
  unitPriceExclTax?: number | string | null;
  available?: boolean;
};

export type ApiCart = {
  items?: ApiCartItem[];
};

export function normalizeCartItem(item: ApiCartItem): CartLine {
  const quantity = Number(item.quantity ?? 1);
  const unitPrice = Number(item.unitPriceExclTax ?? 0);

  return {
    id: Number(item.id ?? 0),
    variantId: Number(item.variantId ?? item.id ?? 0),
    name: item.productName ?? 'Article',
    quantity: Number.isFinite(quantity) ? quantity : 1,
    unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
    available: item.available ?? true,
  };
}

export function calculateCartTotals(items: CartLine[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, totalItems };
}

export function formatPrice(value: number) {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

export type CartLine = {
  id: number;
  variantId: number;
  name: string;
  quantity: number;
  unitPriceExclTax: number;
  vatRate: number;
  available: boolean;
};

export type ApiCartItem = {
  id?: number;
  variantId?: number;
  quantity?: number;
  productName?: string | null;
  unitPriceExclTax?: number | string | null;
  vatRate?: number | string | null;
  available?: boolean;
};

export type ApiCart = {
  items?: ApiCartItem[];
};

export function normalizeCartItem(item: ApiCartItem): CartLine {
  const quantity = Number(item.quantity ?? 1);
  const unitPriceExclTax = Number(item.unitPriceExclTax ?? 0);
  const vatRate = Number(item.vatRate ?? 0);

  return {
    id: Number(item.id ?? 0),
    variantId: Number(item.variantId ?? item.id ?? 0),
    name: item.productName ?? 'Article',
    quantity: Number.isFinite(quantity) ? quantity : 1,
    unitPriceExclTax: Number.isFinite(unitPriceExclTax) ? unitPriceExclTax : 0,
    vatRate: Number.isFinite(vatRate) ? vatRate : 0,
    available: item.available ?? true,
  };
}

export function getUnitPriceInclTax(item: CartLine): number {
  return item.unitPriceExclTax * (1 + item.vatRate / 100);
}

export function getLineTotalInclTax(item: CartLine): number {
  return Math.round((getUnitPriceInclTax(item) * item.quantity + Number.EPSILON) * 100) / 100;
}

export function calculateCartTotals(items: CartLine[]) {
  const subtotal = Math.round(items.reduce((sum, item) => sum + getLineTotalInclTax(item), 0) * 100) / 100;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, totalItems };
}

export function formatPrice(value: number) {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

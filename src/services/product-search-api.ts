import type { createApiClient } from './api-client';

export type ProductCardResponse = {
  id: number; slug: string; title: string;
  brand: { name: string; slug: string }; category: { name: string; slug: string };
  priceInclTax: number; regularPriceInclTax: number | null;
  imageUrl: string | null; available: boolean; variantCount: number;
};
export type ProductPageResponse = { content: ProductCardResponse[]; page: number; size: number; totalElements: number; totalPages: number };

function card(value: unknown): ProductCardResponse {
  const item = value as ProductCardResponse | null;
  const text = (value: unknown) => typeof value === 'string' && !!value.trim();
  const price = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  if (!item || !Number.isSafeInteger(item.id) || item.id <= 0 || !text(item.slug) || !text(item.title)
    || !text(item.brand?.name) || !text(item.brand?.slug) || !text(item.category?.name) || !text(item.category?.slug)
    || !price(item.priceInclTax) || !(item.regularPriceInclTax === null || price(item.regularPriceInclTax))
    || !(item.imageUrl === null || typeof item.imageUrl === 'string') || typeof item.available !== 'boolean'
    || !Number.isSafeInteger(item.variantCount) || item.variantCount < 1) throw new Error('Réponse produit invalide.');
  return item;
}

export function createProductSearchApi(client: Pick<ReturnType<typeof createApiClient>, 'get'>) {
  function query(value: string) {
    const q = value.trim();
    if (!q || q.length > 150) throw new Error('Saisissez entre 1 et 150 caractères.');
    return encodeURIComponent(q);
  }
  return {
    async autocomplete(q: string, signal?: AbortSignal): Promise<ProductCardResponse[]> {
      const data = await client.get<unknown>(`/api/catalog/products/autocomplete?q=${query(q)}&limit=8`, { auth: false, signal });
      if (!Array.isArray(data)) throw new Error('Réponse produit invalide.');
      return data.map(card);
    },
    async search(q: string, page = 0, signal?: AbortSignal): Promise<ProductPageResponse> {
      if (!Number.isSafeInteger(page) || page < 0) throw new Error('Page invalide.');
      const data = await client.get<ProductPageResponse>(`/api/catalog/products?q=${query(q)}&page=${page}&size=20`, { auth: false, signal });
      if (!data || !Array.isArray(data.content) || data.page !== page || !Number.isSafeInteger(data.size) || data.size < 1
        || !Number.isSafeInteger(data.totalElements) || data.totalElements < 0 || !Number.isSafeInteger(data.totalPages)
        || data.totalPages !== Math.ceil(data.totalElements / data.size) || data.content.length > data.size) throw new Error('Réponse produit invalide.');
      return { ...data, content: data.content.map(card) };
    },
  };
}

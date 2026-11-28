import type { createApiClient } from './api-client';

type ProductCard = { slug: string; available: boolean };
type ProductDetail = {
  title: string;
  variants: { id: number; available: boolean; priceInclTax: number; values: Record<string, string> }[];
};
export type RecommendedItem = { id: number; name: string; price: number; description: string };

export async function loadCartRecommendations(api: Pick<ReturnType<typeof createApiClient>, 'get'>): Promise<RecommendedItem[]> {
  const page = await api.get<{ content: ProductCard[] }>('/api/catalog/products?size=20', { auth: false });
  const products = page.content.filter(product => product.available).slice(0, 3);
  const details = await Promise.all(products.map(product =>
    api.get<ProductDetail>(`/api/catalog/products/${encodeURIComponent(product.slug)}`, { auth: false })));
  return details.flatMap(product => {
    const variant = product.variants.find(item => item.available);
    return variant ? [{ id: variant.id, name: product.title, price: Number(variant.priceInclTax),
      description: Object.values(variant.values).join(' · ') }] : [];
  });
}

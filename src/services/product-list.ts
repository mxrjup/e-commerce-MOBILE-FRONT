export type ProductFilters = { category?: string; brand?: string; universe?: string };
export const catalogFilterKeys = { categories: 'category', brands: 'brand', universes: 'universe' } as const;
export type ProductCard = {
  id: number; slug: string; title: string;
  brand: { name: string; slug: string }; category: { name: string; slug: string };
  priceInclTax: number; regularPriceInclTax: number | null;
  imageUrl: string | null; available: boolean; variantCount: number;
};
export type ProductPageResponse = { content: ProductCard[]; page: number; size: number; totalElements: number; totalPages: number };

export function productListPath(filters: ProductFilters = {}, page = 0) {
  if (!Number.isSafeInteger(page) || page < 0) throw new Error('Page invalide.');
  const query = new URLSearchParams({ page: String(page), size: '12' });
  for (const key of Object.values(catalogFilterKeys)) {
    if (filters[key]?.trim()) query.set(key, filters[key]!);
  }
  return `/api/catalog/products?${query.toString()}`;
}

export function parseProductList(value: unknown): ProductPageResponse {
  const invalid = () => { throw new Error('Liste de produits invalide.'); };
  if (!value || typeof value !== 'object') return invalid();
  const page = value as ProductPageResponse;
  const integer = (v: unknown, min: number) => Number.isSafeInteger(v) && Number(v) >= min;
  const money = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  const reference = (v: ProductCard['brand']) => v && typeof v.name === 'string' && typeof v.slug === 'string';
  if (!integer(page.page, 0) || !integer(page.size, 1) || page.size > 50 || !integer(page.totalElements, 0)
    || !integer(page.totalPages, 0) || page.totalPages !== Math.ceil(page.totalElements / page.size)
    || !Array.isArray(page.content) || page.content.length > page.size || page.content.length > page.totalElements
    || page.content.some(p => !p || !integer(p.id, 1) || typeof p.slug !== 'string' || !p.slug.trim()
      || typeof p.title !== 'string' || !p.title.trim() || !reference(p.brand) || !reference(p.category)
      || !money(p.priceInclTax) || !(p.regularPriceInclTax === null || money(p.regularPriceInclTax))
      || !(p.imageUrl === null || typeof p.imageUrl === 'string') || typeof p.available !== 'boolean' || !integer(p.variantCount, 1))
    || new Set(page.content.map(p => p.id)).size !== page.content.length) return invalid();
  return page;
}

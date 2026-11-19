export type ProductVariant = {
  id: number; sku: string; values: Record<string, string>;
  priceInclTax: number; regularPriceInclTax: number | null; ecoTaxInclTax: number | null;
  available: boolean; lowStock: boolean; images: string[];
};
export type ProductDetail = {
  id: number; slug: string; title: string; description: string | null;
  brand: { name: string; slug: string; logoUrl: string | null };
  category: { name: string; slug: string };
  universes: { name: string; slug: string }[]; vatRate: number;
  specifications: { key: string; value: string }[];
  attributes: { name: string; values: string[] }[];
  variants: ProductVariant[];
};

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Fiche produit invalide.');
  return value as Record<string, unknown>;
}
const text = (value: unknown) => typeof value === 'string';
const money = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const id = (value: unknown) => Number.isSafeInteger(value) && Number(value) > 0;
const list = (value: unknown, valid: (item: unknown) => boolean) => Array.isArray(value) && value.every(valid);
const reference = (value: unknown) => { const item = object(value); return text(item.name) && text(item.slug); };

/** Validate the public catalog DTO before it reaches prices, selectors or images. */
export function parseProductDetail(value: unknown): ProductDetail {
  const item = object(value);
  const valid = id(item.id) && text(item.slug) && text(item.title)
    && (item.description === null || text(item.description)) && reference(item.brand)
    && (object(item.brand).logoUrl === null || text(object(item.brand).logoUrl))
    && reference(item.category) && list(item.universes, reference) && money(item.vatRate)
    && list(item.specifications, value => { const spec = object(value); return text(spec.key) && text(spec.value); })
    && list(item.attributes, value => { const attr = object(value); return text(attr.name) && list(attr.values, text); })
    && list(item.variants, value => {
      const variant = object(value);
      return id(variant.id) && text(variant.sku) && Object.values(object(variant.values)).every(text)
        && money(variant.priceInclTax) && (variant.regularPriceInclTax === null || money(variant.regularPriceInclTax))
        && (variant.ecoTaxInclTax === null || money(variant.ecoTaxInclTax))
        && typeof variant.available === 'boolean' && typeof variant.lowStock === 'boolean' && list(variant.images, text);
    });
  if (!valid) throw new Error('Fiche produit invalide.');
  const product = item as ProductDetail;
  if (new Set(product.variants.map(v => v.id)).size !== product.variants.length
    || new Set(product.attributes.map(a => a.name)).size !== product.attributes.length
    || product.variants.some(v => product.attributes.some(a => !a.values.includes(v.values[a.name])))) {
    throw new Error('Fiche produit invalide.');
  }
  return product;
}

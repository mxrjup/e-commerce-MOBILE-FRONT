import type { ProductDetail, ProductVariant } from '@/services/product-detail';

export function productSlug(param: string | string[] | undefined): string {
  return typeof param === 'string' ? param : '';
}

// Hierarchical selection: preserve earlier attributes, reset later ones to an
// existing variant. This also makes disconnected combinations reachable.
export function variantForValue(product: ProductDetail, selected: ProductVariant, index: number, value: string) {
  const attribute = product.attributes[index];
  if (!attribute) return undefined;
  const candidates = product.variants.filter(variant => variant.values[attribute.name] === value
    && product.attributes.slice(0, index).every(previous => variant.values[previous.name] === selected.values[previous.name]));
  return candidates.find(v => product.attributes.slice(index + 1).every(a => v.values[a.name] === selected.values[a.name]))
    ?? candidates.find(v => v.available) ?? candidates[0];
}

export function availability(variant?: ProductVariant) {
  return !variant?.available ? 'Indisponible' : variant.lowStock ? 'Stock faible' : 'Disponible';
}

export function promotion(variant: ProductVariant) {
  return variant.regularPriceInclTax !== null && variant.regularPriceInclTax > variant.priceInclTax;
}

export function productImages(variant?: ProductVariant) {
  return [...new Set(variant?.images.filter(url => {
    try { return ['https:', 'http:'].includes(new URL(url).protocol); } catch { return false; }
  }) ?? [])];
}

// Render plain native Text, never HTML/WebView. Even malformed markup and decoded
// entities remain inert text; no scripts, links or external embeds are executed.
export function descriptionText(html: string | null) {
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é', egrave: 'è', agrave: 'à', ecirc: 'ê', ccedil: 'ç', ugrave: 'ù', euro: '€' };
  return (html ?? '')
    .replace(/<(script|style|iframe|object)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, '')
    .replace(/<!--[^]*?(?:-->|$)/g, '')
    .replace(/<\s*br\b[^>]*>|<\/\s*(p|div|li|h[1-6]|tr)\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? match;
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '';
    }).replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
}

export const unavailableReviews = 'Les avis clients ne sont pas encore disponibles.';
export const unavailableAccessories = 'Les accessoires associés ne sont pas encore disponibles.';

export function clampZoom(scale: number) { return Math.min(4, Math.max(1, scale)); }

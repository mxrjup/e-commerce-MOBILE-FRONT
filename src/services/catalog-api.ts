import type { createApiClient } from './api-client';

export const catalogKinds = ['categories', 'brands', 'universes'] as const;
export type CatalogKind = typeof catalogKinds[number];
export const catalogLabels: Record<CatalogKind, string> = { categories: 'Catégories', brands: 'Marques', universes: 'Univers' };
export type CatalogReference = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
  position?: number;
  parentId?: number | null;
  children?: CatalogReference[];
};

export function isCatalogKind(value: string): value is CatalogKind {
  return catalogKinds.some(kind => kind === value);
}

function reference(value: unknown, kind: CatalogKind, tree: boolean, depth = 0): CatalogReference {
  if (!value || typeof value !== 'object' || depth > 50) throw new Error('Réponse catalogue invalide.');
  const item = value as Record<string, unknown>;
  const nullableText = (field: string) => item[field] === null || typeof item[field] === 'string';
  if (!Number.isSafeInteger(item.id) || Number(item.id) <= 0 || typeof item.name !== 'string' || !item.name.trim()
    || typeof item.slug !== 'string' || !item.slug.trim() || !nullableText('description')) {
    throw new Error('Réponse catalogue invalide.');
  }
  if (kind === 'brands' && !nullableText('logoUrl')) throw new Error('Réponse catalogue invalide.');
  if (kind === 'universes' && !nullableText('imageUrl')) throw new Error('Réponse catalogue invalide.');
  if (kind !== 'brands' && !Number.isInteger(item.position)) throw new Error('Réponse catalogue invalide.');
  if (kind === 'categories' && !tree && item.parentId !== null && !Number.isSafeInteger(item.parentId)) throw new Error('Réponse catalogue invalide.');
  if (tree && !Array.isArray(item.children)) throw new Error('Réponse catalogue invalide.');
  return {
    ...item,
    ...(tree ? { children: (item.children as unknown[]).map(child => reference(child, kind, true, depth + 1)) } : {}),
  } as CatalogReference;
}

export function flattenCategories(items: CatalogReference[], parent = ''): { item: CatalogReference; path: string }[] {
  return items.flatMap(item => {
    const path = parent ? `${parent} / ${item.name}` : item.name;
    return [{ item, path }, ...flattenCategories(item.children ?? [], path)];
  });
}

export function searchReferences(items: CatalogReference[], query: string) {
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return flattenCategories(items).filter(({ item, path }) => words.every(word => normalize(`${path} ${item.description ?? ''}`).includes(word)));
}

// Only the public reference endpoints implemented by catalog-service C05.
// Products, variants and relations to these references are not available yet.
export function createCatalogApi(client: Pick<ReturnType<typeof createApiClient>, 'get'>) {
  async function list(kind: CatalogKind, signal?: AbortSignal): Promise<CatalogReference[]> {
    const data = await client.get<unknown>(`/api/catalog/${kind}`, { auth: false, signal });
    if (!Array.isArray(data)) throw new Error('Réponse catalogue invalide.');
    return data.map(item => reference(item, kind, kind === 'categories'));
  }
  async function detail(kind: CatalogKind, slug: string, signal?: AbortSignal): Promise<CatalogReference> {
    if (!slug.trim() || slug === '.' || slug === '..') throw new Error('Rubrique invalide.');
    const data = await client.get<unknown>(`/api/catalog/${kind}/${encodeURIComponent(slug)}`, { auth: false, signal });
    return reference(data, kind, false);
  }
  return { list, detail };
}

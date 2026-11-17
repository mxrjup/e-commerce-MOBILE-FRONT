import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiClient } from '../src/services/api-client.ts';
import { createCatalogApi } from '../src/services/catalog-api.ts';
import { catalogFilterKeys, parseProductList, productListPath } from '../src/services/product-list.ts';

const card = { id: 7, slug: 'produit-test', title: 'Produit test', brand: { name: 'Marque', slug: 'marque' }, category: { name: 'Catégorie', slug: 'categorie' }, priceInclTax: 120, regularPriceInclTax: 140, imageUrl: null, available: true, variantCount: 2 };
const page = { content: [card], page: 0, size: 12, totalElements: 1, totalPages: 1 };

test('each reference kind maps to the real singular backend filter, encoded by slug', () => {
  for (const [kind, key] of Object.entries({ categories: 'category', brands: 'brand', universes: 'universe' })) {
    const path = productListPath({ [catalogFilterKeys[kind]]: 'a/b & c' });
    const url = new URL(path, 'https://example.test');
    assert.equal(url.pathname, '/api/catalog/products');
    assert.equal(url.searchParams.get(key), 'a/b & c');
    assert.equal(url.searchParams.get('page'), '0');
    assert.equal(url.searchParams.get('size'), '12');
  }
});

test('global catalogue supports combined filters and explicit bounded pages', () => {
  assert.equal(productListPath(), '/api/catalog/products?page=0&size=12');
  const url = new URL(productListPath({ category: 'ecrans', brand: 'lg', universe: 'gaming' }, 2), 'https://example.test');
  assert.deepEqual(Object.fromEntries(url.searchParams), { page: '2', size: '12', category: 'ecrans', brand: 'lg', universe: 'gaming' });
  for (const number of [-1, 0.5, NaN]) assert.throws(() => productListPath({}, number), /invalide/);
});

test('product lists are public and preserve backend prices and metadata', async t => {
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://example.test/api/catalog/products?page=0&size=12&brand=marque');
    assert.equal(options.headers.has('Authorization'), false);
    assert.equal(options.signal, controller.signal);
    return Response.json(page);
  });
  const api = createCatalogApi(createApiClient('https://example.test', async () => assert.fail('Must stay public')));
  assert.deepEqual(await api.products({ brand: 'marque' }, 0, controller.signal), page);
});

test('empty results and out of range pages remain empty without a fallback', () => {
  assert.deepEqual(parseProductList({ ...page, content: [], totalElements: 0, totalPages: 0 }).content, []);
  assert.deepEqual(parseProductList({ ...page, page: 4, content: [] }).content, []);
});

test('malformed cards or pagination never masquerade as an empty catalogue', () => {
  for (const value of [null, [], {}, { ...page, size: 0 }, { ...page, totalPages: 3 }, { ...page, content: null }, { ...page, content: [{ ...card, brand: null }] }, { ...page, content: [{ ...card, priceInclTax: '120' }] }, { ...page, content: [{ ...card, available: null }] }, { ...page, content: [{ ...card, slug: '' }] }, { ...page, content: [{ ...card, imageUrl: 4 }] }]) assert.throws(() => parseProductList(value), /invalide/);
});

test('HTTP failure can be retried and cancellation propagates', async t => {
  let failed = true;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    options.signal.throwIfAborted();
    return failed ? Response.json({}, { status: 503 }) : Response.json(page);
  });
  const api = createCatalogApi(createApiClient('https://example.test', async () => null));
  await assert.rejects(api.products(), { status: 503 });
  failed = false;
  assert.deepEqual(await api.products(), page);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(api.products({}, 0, controller.signal), { name: 'AbortError' });
});

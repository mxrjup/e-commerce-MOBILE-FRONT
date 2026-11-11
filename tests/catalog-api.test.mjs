import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiClient, ApiError } from '../src/services/api-client.ts';
import { createCatalogApi, flattenCategories, searchReferences, isCatalogKind } from '../src/services/catalog-api.ts';

const brand = { id: 1, name: 'Marque test', slug: 'marque-test', description: null, logoUrl: null };
const child = { id: 3, name: 'Écrans', slug: 'ecrans', description: null, position: 0, children: [] };
const root = { id: 2, name: 'Informatique', slug: 'informatique', description: 'Matériel', position: 1, children: [child] };
const universe = { id: 4, name: 'Bureau', slug: 'bureau', description: null, imageUrl: null, position: 0 };

test('public lists use the exact backend paths, without retrieving or sending a token', async t => {
  const calls = [];
  const fixtures = { categories: [root], brands: [brand], universes: [universe] };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push(url);
    assert.equal(options.headers.has('Authorization'), false);
    return Response.json(fixtures[url.split('/').at(-1)]);
  });
  const api = createCatalogApi(createApiClient('http://localhost:8080', async () => { throw new Error('Must stay public'); }));
  for (const kind of ['categories', 'brands', 'universes']) assert.deepEqual(await api.list(kind), fixtures[kind]);
  assert.deepEqual(calls, ['http://localhost:8080/api/catalog/categories', 'http://localhost:8080/api/catalog/brands', 'http://localhost:8080/api/catalog/universes']);
});

test('detail uses encoded slugs and accepts the non-tree category DTO', async () => {
  const controller = new AbortController();
  const detail = { ...child, children: undefined, parentId: 2 };
  const api = createCatalogApi({ get: async (path, options) => {
    assert.equal(path, '/api/catalog/categories/ecran%2Ftest%3F');
    assert.equal(options.auth, false);
    assert.equal(options.signal, controller.signal);
    return detail;
  } });
  assert.deepEqual(await api.detail('categories', 'ecran/test?', controller.signal), detail);
  await assert.rejects(api.detail('categories', '..'));
});

test('empty references stay empty, with no demonstration fallback', async () => {
  assert.deepEqual(await createCatalogApi({ get: async () => [] }).list('brands'), []);
});

test('malformed responses and malformed nested categories fail instead of silently showing empty lists', async () => {
  for (const payload of [null, {}, [null], [{ ...brand, id: '1' }], [{ ...brand, name: '' }]]) {
    await assert.rejects(createCatalogApi({ get: async () => payload }).list('brands'), /invalide/);
  }
  await assert.rejects(createCatalogApi({ get: async () => [{ ...root, children: [{}] }] }).list('categories'), /invalide/);
});

test('404 and server failures are propagated for distinct detail/error states', async t => {
  for (const status of [404, 503]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json({ message: 'Unavailable' }, { status }));
    const api = createCatalogApi(createApiClient('http://localhost:8080', async () => null));
    await assert.rejects(api.detail('brands', 'missing'), error => error instanceof ApiError && error.status === status);
    t.mock.restoreAll();
  }
});

test('cancellation reaches fetch and remains an AbortError', async t => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.signal, controller.signal);
    options.signal.throwIfAborted();
  });
  const api = createCatalogApi(createApiClient('http://localhost:8080', async () => null));
  await assert.rejects(api.list('categories', controller.signal), { name: 'AbortError' });
});

test('category navigation preserves hierarchy and backend order; search ignores accents and case', () => {
  assert.deepEqual(flattenCategories([root]).map(({ path }) => path), ['Informatique', 'Informatique / Écrans']);
  assert.deepEqual(searchReferences([root], ' ECRANS informatique ').map(({ item }) => item.slug), ['ecrans']);
  assert.equal(searchReferences([root], 'absent').length, 0);
  assert.equal(isCatalogKind('brands'), true);
  assert.equal(isCatalogKind('../admin'), false);
});

test('every detail endpoint uses the public gateway and its actual DTO', async t => {
  const fixtures = { categories: { id: 3, name: 'Écrans', slug: 'ecrans', description: null, position: 0, parentId: 2 }, brands: brand, universes: universe };
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push(url);
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.has('Authorization'), false);
    return Response.json(fixtures[new URL(url).pathname.split('/')[3]]);
  });
  const api = createCatalogApi(createApiClient('https://gateway.example.test', async () => { throw new Error('No login'); }));
  for (const [kind, dto] of Object.entries(fixtures)) assert.deepEqual(await api.detail(kind, dto.slug), dto);
  assert.deepEqual(calls, Object.entries(fixtures).map(([kind, dto]) => `https://gateway.example.test/api/catalog/${kind}/${dto.slug}`));
});

test('a failed public request can be retried without authentication or stale fallback', async t => {
  let available = false;
  t.mock.method(globalThis, 'fetch', async () => {
    if (!available) throw new TypeError('Offline');
    return Response.json([brand]);
  });
  const api = createCatalogApi(createApiClient('http://localhost:8080', async () => { throw new Error('No login'); }));
  await assert.rejects(api.list('brands'), { code: 'network_error' });
  available = true;
  assert.deepEqual(await api.list('brands'), [brand]);
});

test('empty lists and invalid DTO fields are checked for all public resources', async t => {
  let payload = [];
  t.mock.method(globalThis, 'fetch', async () => Response.json(payload));
  const api = createCatalogApi(createApiClient('http://localhost:8080', async () => null));
  for (const kind of ['categories', 'brands', 'universes']) assert.deepEqual(await api.list(kind), []);
  for (const [kind, invalid] of [['brands', { ...brand, logoUrl: 7 }], ['universes', { ...universe, position: '0' }], ['categories', { ...child, parentId: '2' }]]) {
    payload = invalid;
    await assert.rejects(api.detail(kind, invalid.slug), /invalide/);
  }
});

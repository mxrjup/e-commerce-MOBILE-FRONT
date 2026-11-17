import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiClient, getApiErrorMessage } from '../src/services/api-client.ts';
import { createProductSearchApi } from '../src/services/product-search-api.ts';
import { createProductSearchController } from '../src/services/product-search-controller.ts';
import { createSearchHistory, normalizeHistory } from '../src/services/search-history.ts';

const product = { id: 1, slug: 'clavier', title: 'Clavier', brand: { name: 'LOG', slug: 'log' }, category: { name: 'PC', slug: 'pc' }, priceInclTax: 200.11, regularPriceInclTax: null, imageUrl: null, available: true, variantCount: 2 };
const page = (content = [product], index = 0, total = 1) => ({ content, page: index, size: 20, totalElements: total, totalPages: Math.ceil(total / 20) });
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };

test('search and autocomplete are public, encode q and forward cancellation', async t => {
  const calls = [];
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push(url);
    assert.equal(options.headers.has('Authorization'), false);
    assert.equal(options.credentials, 'omit');
    assert.equal(options.signal, controller.signal);
    return Response.json(url.includes('autocomplete') ? [product] : page());
  });
  const api = createProductSearchApi(createApiClient('https://api.example.test', async () => { throw Error('No authentication'); }));
  assert.deepEqual(await api.autocomplete(' écran & PC ', controller.signal), [product]);
  assert.deepEqual(await api.search(' écran & PC ', 0, controller.signal), page());
  assert.deepEqual(calls, ['https://api.example.test/api/catalog/products/autocomplete?q=%C3%A9cran%20%26%20PC&limit=8', 'https://api.example.test/api/catalog/products?q=%C3%A9cran%20%26%20PC&page=0&size=20']);
});

test('invalid DTOs are rejected and empty responses stay empty', async () => {
  for (const value of [null, {}, { ...product, priceInclTax: '20' }, { ...product, available: null }, { ...product, title: '' }]) {
    await assert.rejects(createProductSearchApi({ get: async () => [value] }).autocomplete('pc'));
  }
  await assert.rejects(createProductSearchApi({ get: async () => ({ ...page(), totalPages: 2 }) }).search('pc'));
  assert.deepEqual(await createProductSearchApi({ get: async () => [] }).autocomplete('absent'), []);
  assert.deepEqual(await createProductSearchApi({ get: async () => page([], 0, 0) }).search('absent'), page([], 0, 0));
});

test('300ms debounce, rapid inputs, stale replies and clearing', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls = []; let state;
  const controller = createProductSearchController({ autocomplete: (q, signal) => { const d = deferred(); calls.push({ q, signal, ...d }); return d.promise; } }, s => { state = s; }, getApiErrorMessage);
  controller.change('p'); t.mock.timers.tick(299); assert.equal(calls.length, 0);
  controller.change('pc'); t.mock.timers.tick(300); assert.equal(calls.length, 1);
  controller.change('clavier'); assert.equal(calls[0].signal.aborted, true);
  t.mock.timers.tick(300); calls[1].resolve([product]); await flush();
  calls[0].resolve([{ ...product, title: 'Obsolete' }]); await flush();
  assert.equal(state.items[0].title, 'Clavier');
  controller.change(''); assert.equal(state.mode, 'history'); assert.deepEqual(state.items, []);
  controller.dispose();
});

test('suggestion submission cancels debounce and loads results; pagination retries without losing data', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let state, fail = true; const pages = [];
  const controller = createProductSearchController({
    autocomplete: () => { throw Error('Debounce should be cancelled'); },
    search: async (q, index) => { pages.push(index); assert.equal(q, 'Clavier'); if (index === 1 && fail) throw Error('Offline'); return page(index ? [{ ...product, id: 2 }] : [product], index, 21); },
  }, s => { state = s; }, getApiErrorMessage);
  controller.change('cla'); controller.submit('Clavier'); await flush();
  assert.equal(state.mode, 'results'); assert.equal(state.items.length, 1);
  controller.more(); controller.more(); await flush();
  assert.ok(state.error); assert.equal(state.items.length, 1);
  fail = false; controller.retry(); await flush();
  assert.deepEqual(pages, [0, 1, 1]); assert.equal(state.items.length, 2); assert.equal(state.error, '');
  controller.more(); assert.equal(pages.length, 3); controller.dispose();
});

test('out-of-order result pages and errors never replace a new query', async () => {
  let state; const calls = [];
  const controller = createProductSearchController({ search: (q, index, signal) => { const d = deferred(); calls.push({ ...d, signal }); return d.promise; } }, s => { state = s; }, getApiErrorMessage);
  controller.submit('old'); controller.submit('new'); assert.ok(calls[0].signal.aborted);
  calls[1].resolve(page()); await flush(); calls[0].reject(Error('Late error')); await flush();
  assert.equal(state.query, 'new'); assert.equal(state.error, ''); assert.equal(state.items.length, 1);
  controller.dispose();
});

test('suggestion errors can retry, empty state and timeout terminate loading', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let state, fail = true;
  const controller = createProductSearchController({ autocomplete: async () => { if (fail) throw Error('Offline'); return []; }, search: () => new Promise(() => {}) }, s => { state = s; }, getApiErrorMessage);
  controller.change('pc'); t.mock.timers.tick(300); await flush(); assert.ok(state.error);
  fail = false; controller.retry(); await flush(); assert.equal(state.error, ''); assert.equal(state.loading, false); assert.deepEqual(state.items, []);
  controller.submit('pc'); t.mock.timers.tick(15000); assert.equal(state.loading, false); assert.match(state.error, /temps/);
  controller.dispose();
});

test('unmount cancels pending work and ignores late success', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const d = deferred(); let count = 0, signal;
  const controller = createProductSearchController({ autocomplete: (_q, s) => { signal = s; return d.promise; } }, () => count++, getApiErrorMessage);
  controller.change('pc'); t.mock.timers.tick(300); controller.dispose(); const previous = count;
  assert.ok(signal.aborted); d.resolve([product]); await flush(); assert.equal(count, previous);
});

test('history persists, serializes concurrent operations, deduplicates and caps at ten', async () => {
  let raw = null;
  const storage = { read: async () => raw, write: async value => { raw = value; } };
  const history = createSearchHistory(storage);
  await Promise.all(Array.from({ length: 12 }, (_, i) => history.add(`PC ${i}`)));
  assert.equal((await history.read()).length, 10);
  await history.add(' pc 11 '); assert.equal((await history.read())[0], 'pc 11');
  assert.equal((await history.read()).length, 10);
  await history.remove('PC 11'); assert.equal((await createSearchHistory(storage).read()).length, 9);
  assert.deepEqual(normalizeHistory([null, ' ', 'PC', 'pc', 'x'.repeat(151)]), ['PC']);
  raw = '{invalid'; assert.deepEqual(await history.read(), []);
});

test('storage failures are surfaced and subsequent operations recover', async () => {
  let fail = true;
  const history = createSearchHistory({ read: async () => null, write: async () => { if (fail) throw Error('Disk'); } });
  await assert.rejects(history.add('pc')); fail = false;
  assert.deepEqual(await history.add('clavier'), ['clavier']);
});

test('network and undeployed backend failures have no synthetic fallback', async t => {
  const api = createProductSearchApi(createApiClient('https://api.example.test', async () => null));
  for (const status of [404, 503]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json({}, { status }));
    await assert.rejects(api.search('pc'), error => error.status === status);
    await assert.rejects(api.autocomplete('pc'), error => error.status === status);
    t.mock.restoreAll();
  }
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiClient } from '../src/services/api-client.ts';
import { readCartSessionToken, writeCartSessionToken } from '../src/services/session-storage.web.ts';
import { getLineTotalInclTax, normalizeCartItem } from '../src/components/pages/cart/cart-logic.ts';

test('web session persists and is shared by separate API clients', async t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const values = new Map();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { sessionStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  } } });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else delete globalThis.window;
  });
  const storage = { read: readCartSessionToken, write: writeCartSessionToken };
  const first = createApiClient('http://localhost:8080', async () => null, storage);
  const second = createApiClient('http://localhost:8080', async () => 'access-token', storage);
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    return Response.json({ items: [] }, { headers: { 'X-Session-Token': 'cart-token' } });
  });
  await first.get('/api/cart', { auth: false });
  await second.get('/api/cart');
  assert.equal(calls[1].options.headers.get('X-Session-Token'), 'cart-token');
  assert.equal(calls[1].options.headers.get('Authorization'), 'Bearer access-token');
  assert.equal(values.get('cart.session-token'), 'cart-token');
  await writeCartSessionToken(null);
  assert.equal(await readCartSessionToken(), null);
});

test('cart prices interpret backend VAT as a percentage and round line totals', () => {
  const item = normalizeCartItem({ id: 1, variantId: 7, quantity: 3, unitPriceExclTax: '10.05', vatRate: '5.5' });
  assert.equal(getLineTotalInclTax(item), 31.81);
});

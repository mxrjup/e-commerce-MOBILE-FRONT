import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiClient } from '../src/services/api-client.ts';
import { loadCartRecommendations } from '../src/services/cart-recommendations.ts';

test('recommendations use available variant IDs rather than product IDs or fake IDs', async () => {
  const calls = [];
  const api = { get: async (path, options) => {
    calls.push(path);
    assert.equal(options.auth, false);
    if (path.includes('?')) return { content: [
      { id: 101, slug: 'keyboard', available: true },
      { id: 102, slug: 'sold-out', available: false },
      { id: 103, slug: 'stock-changed', available: true },
    ] };
    if (path.endsWith('stock-changed')) return { title: 'Sold out', variants: [] };
    return { title: 'Keyboard', variants: [
      { id: 3, available: false, priceInclTax: 10, values: {} },
      { id: 7, available: true, priceInclTax: 12, values: { Color: 'Black' } },
    ] };
  } };
  assert.deepEqual(await loadCartRecommendations(api), [{ id: 7, name: 'Keyboard', price: 12, description: 'Black' }]);
  assert.equal(calls.some(path => path.endsWith('sold-out')), false);
});

test('empty catalogue does not invent recommendations', async () => {
  assert.deepEqual(await loadCartRecommendations({ get: async () => ({ content: [] }) }), []);
});

test('live catalogue variant can be added, read through another client, updated and removed', {
  skip: !process.env.CART_SMOKE_URL,
}, async () => {
  let token = null;
  const storage = { read: async () => token, write: async value => { token = value; } };
  const api = createApiClient(process.env.CART_SMOKE_URL, async () => null, storage);
  const other = createApiClient(process.env.CART_SMOKE_URL, async () => null, storage);
  const [variant] = await loadCartRecommendations(api);
  assert.ok(variant);
  try {
    const added = await api.post('/api/cart/items', { variantId: variant.id, quantity: 1 }, { auth: false });
    assert.ok(token);
    assert.equal(added.items[0].available, true);
    const cart = await other.get('/api/cart', { auth: false });
    assert.equal(cart.items[0].variantId, variant.id);
    const itemId = cart.items[0].id;
    const updated = await other.patch(`/api/cart/items/${itemId}`, { quantity: 2 }, { auth: false });
    assert.equal(updated.items[0].quantity, 2);
    await other.delete(`/api/cart/items/${itemId}`, { auth: false });
    assert.equal((await api.get('/api/cart', { auth: false })).items.length, 0);
  } finally {
    if (token) await api.delete('/api/cart', { auth: false });
  }
});

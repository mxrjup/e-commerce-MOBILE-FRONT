import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { createApiClient } from '../src/services/api-client.ts';

afterEach(() => mock.restoreAll());

test('guest session survives client recreation and is restricted to guest cart requests', async () => {
  const session = { token: null };
  const client = () => createApiClient('http://localhost:8080', async () => 'access', session);
  const calls = [];
  mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push(options.headers.get('X-Session-Token'));
    return Response.json({ items: [] }, { headers: { 'X-Session-Token': 'guest-session' } });
  });
  await client().get('/api/cart', { auth: false });
  await client().post('/api/cart/items', { variantId: 101, quantity: 1 }, { auth: false });
  await client().patch('/api/cart/items/1', { quantity: 2 }, { auth: false });
  await client().delete('/api/cart/items/1', { auth: false });
  await client().get('/api/catalog/products', { auth: false });
  await client().get('/api/cart');
  assert.deepEqual(calls, [null, 'guest-session', 'guest-session', 'guest-session', null, null]);
});

test('failed responses do not replace the guest session', async () => {
  const session = { token: 'original' };
  const client = createApiClient('http://localhost:8080', async () => null, session);
  mock.method(globalThis, 'fetch', async () => Response.json({}, {
    status: 500, headers: { 'X-Session-Token': 'bad' },
  }));
  await assert.rejects(client.get('/api/cart', { auth: false }));
  assert.equal(session.token, 'original');
});

import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';

import { ApiError, createApiClient } from '../src/services/api-client.ts';

afterEach(() => mock.restoreAll());

test('uses the current access token on every request and decodes JSON', async () => {
  let token = 'first-token';
  const api = createApiClient('http://localhost:8080', async () => token);
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({ items: [] }));

  assert.deepEqual(await api.get('/api/cart'), { items: [] });
  token = 'renewed-token';
  await api.get('/api/cart');

  assert.equal(fetchMock.mock.calls[0].arguments[0], 'http://localhost:8080/api/cart');
  assert.equal(fetchMock.mock.calls[0].arguments[1].headers.get('Authorization'), 'Bearer first-token');
  assert.equal(fetchMock.mock.calls[1].arguments[1].headers.get('Authorization'), 'Bearer renewed-token');
});

test('serializes JSON bodies and preserves caller headers and cancellation signal', async () => {
  const api = createApiClient('http://localhost:8080', async () => 'token');
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({ id: 1 }));
  const controller = new AbortController();
  await api.post('/api/cart/items', { quantity: 2 }, {
    headers: { 'X-Request-Id': 'request-1', Authorization: 'untrusted' },
    signal: controller.signal,
  });
  const options = fetchMock.mock.calls[0].arguments[1];
  assert.equal(options.method, 'POST');
  assert.equal(options.body, '{"quantity":2}');
  assert.equal(options.headers.get('Content-Type'), 'application/json');
  assert.equal(options.headers.get('X-Request-Id'), 'request-1');
  assert.equal(options.headers.get('Authorization'), 'Bearer token');
  assert.equal(options.signal, controller.signal);
  assert.equal(options.redirect, 'error');
});

test('does not send authenticated requests without a session or after refresh fails', async () => {
  const fetchMock = mock.method(globalThis, 'fetch');
  const api = createApiClient('http://localhost:8080', async () => null);
  await assert.rejects(api.get('/api/cart'), { code: 'auth_required', status: 401 });
  const failingApi = createApiClient('http://localhost:8080', async () => { throw new Error('refresh failed'); });
  await assert.rejects(failingApi.get('/api/cart'), { code: 'auth_refresh_failed', status: 401 });
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('public requests skip token retrieval and omit authorization', async () => {
  const getToken = mock.fn(async () => { throw new Error('must not be called'); });
  const api = createApiClient('http://localhost:8080', getToken);
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json([]));
  await api.get('/public', { auth: false, headers: { Authorization: 'untrusted' } });
  assert.equal(getToken.mock.callCount(), 0);
  assert.equal(fetchMock.mock.calls[0].arguments[1].headers.has('Authorization'), false);
});

test('returns undefined for 204 and preserves plain text', async () => {
  const api = createApiClient('http://localhost:8080', async () => 'token');
  const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }));
  assert.equal(await api.delete('/api/cart/items/1'), undefined);
  fetchMock.mock.mockImplementation(async () => new Response('ok', { headers: { 'Content-Type': 'text/plain' } }));
  assert.equal(await api.get('/health'), 'ok');
});

test('preserves HTTP status and problem details without retrying failed mutations', async () => {
  const api = createApiClient('http://localhost:8080', async () => 'token');
  const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('{"detail":"Forbidden"}', {
    status: 403, headers: { 'Content-Type': 'application/problem+json' },
  }));
  await assert.rejects(api.post('/api/orders', {}), error => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 403);
    assert.deepEqual(error.data, { detail: 'Forbidden' });
    return true;
  });
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('distinguishes network failures, invalid JSON and cancellation', async () => {
  const api = createApiClient('http://localhost:8080', async () => 'token');
  const fetchMock = mock.method(globalThis, 'fetch', async () => { throw new TypeError('network'); });
  await assert.rejects(api.get('/api/cart'), { code: 'network_error', status: 0 });
  fetchMock.mock.mockImplementation(async () => new Response('invalid', { headers: { 'Content-Type': 'application/json' } }));
  await assert.rejects(api.get('/api/cart'), { code: 'invalid_response', status: 200 });
  const abort = new DOMException('Cancelled', 'AbortError');
  fetchMock.mock.mockImplementation(async () => { throw abort; });
  await assert.rejects(api.get('/api/cart'), error => error === abort);
});

test('rejects external destinations before retrieving or sending a token', async () => {
  const getToken = mock.fn(async () => 'token');
  const api = createApiClient('http://localhost:8080', getToken);
  const fetchMock = mock.method(globalThis, 'fetch');
  for (const path of ['https://example.com/api', '//example.com/api', '/\\example.com/api', 'api/cart']) {
    await assert.rejects(api.get(path));
  }
  assert.equal(getToken.mock.callCount(), 0);
  assert.equal(fetchMock.mock.callCount(), 0);
});

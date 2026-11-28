import assert from 'node:assert/strict';
import test from 'node:test';
import { createApiClient } from '../src/services/api-client.ts';
import { createProductReviewsApi } from '../src/services/product-reviews-api.ts';

test('loads public review pages and authenticates submissions on the encoded product route', async t => {
  const review = { id: 1, rating: 4, comment: 'Très bien', createdAt: '2026-01-01T12:00:00Z', updatedAt: '2026-01-01T12:00:00Z' };
  const page = { reviews: [review], averageRating: 4, totalReviews: 1, page: 2, size: 20, hasNext: false };
  const fetch = t.mock.method(globalThis, 'fetch', async (_url, options) =>
    Response.json(options.method === 'GET' ? page : review));
  const token = t.mock.fn(async () => 'test-token');
  const api = createProductReviewsApi(createApiClient('http://localhost:8080', token));

  assert.deepEqual(await api.list('produit/été', 2), page);
  const [listUrl, listOptions] = fetch.mock.calls[0].arguments;
  assert.equal(listUrl, 'http://localhost:8080/api/catalog/products/produit%2F%C3%A9t%C3%A9/reviews?page=2&size=20');
  assert.equal(listOptions.headers.get('Authorization'), null);
  assert.equal(token.mock.callCount(), 0);

  assert.deepEqual(await api.save('produit/été', { rating: 4, comment: ' Très bien ' }), review);
  const [saveUrl, saveOptions] = fetch.mock.calls[1].arguments;
  assert.equal(saveUrl, 'http://localhost:8080/api/catalog/products/produit%2F%C3%A9t%C3%A9/reviews');
  assert.equal(saveOptions.method, 'POST');
  assert.equal(saveOptions.headers.get('Authorization'), 'Bearer test-token');
  assert.deepEqual(JSON.parse(saveOptions.body), { rating: 4, comment: 'Très bien' });
});

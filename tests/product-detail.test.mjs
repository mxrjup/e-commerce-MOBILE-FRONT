import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiClient, ApiError } from '../src/services/api-client.ts';
import { createCatalogApi } from '../src/services/catalog-api.ts';
import { parseProductDetail } from '../src/services/product-detail.ts';
import { availability, promotion, variantForValue, productImages, descriptionText, productSlug, clampZoom, unavailableAccessories } from '../src/components/pages/product/product-logic.ts';

// Synthetic fixtures are confined to tests; no application fallback data.
const variant = { id: 1, sku: 'TEST-B128', values: { Couleur: 'Noir', Capacité: '128 Go' }, priceInclTax: 100, regularPriceInclTax: 120, ecoTaxInclTax: 1, available: true, lowStock: false, images: ['https://example.test/black.jpg'] };
const product = { id: 1, slug: 'produit-test', title: 'Produit test', description: '<p>Description</p>', brand: { name: 'Test', slug: 'test', logoUrl: null }, category: { name: 'Catégorie', slug: 'categorie' }, universes: [], vatRate: 20, specifications: [{ key: 'Poids', value: '100 g' }], attributes: [{ name: 'Couleur', values: ['Noir', 'Blanc'] }, { name: 'Capacité', values: ['128 Go', '256 Go'] }], variants: [variant, { ...variant, id: 2, sku: 'TEST-W256', values: { Couleur: 'Blanc', Capacité: '256 Go' }, priceInclTax: 150, regularPriceInclTax: null, lowStock: true, images: ['https://example.test/white.jpg'] }] };

test('product loads by encoded slug through the public API without reading a token', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.example.test/api/catalog/products/produit%2Ftest%3F');
    assert.equal(options.headers.has('Authorization'), false);
    assert.equal(options.credentials, 'omit');
    return Response.json(product);
  });
  const api = createCatalogApi(createApiClient('https://api.example.test', async () => { throw Error('No token'); }));
  assert.deepEqual(await api.product('produit/test?'), product);
});

test('invalid slugs fail before requesting the backend', async () => {
  const api = createCatalogApi({ get: () => assert.fail('No request') });
  for (const slug of ['', ' ', '.', '..']) await assert.rejects(api.product(slug));
});

test('404, forbidden and HTTP server errors keep their status for the screen', async t => {
  for (const status of [404, 403, 503]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json({}, { status }));
    await assert.rejects(createCatalogApi(createApiClient('https://api.example.test', async () => null)).product('missing'), error => error instanceof ApiError && error.status === status);
    t.mock.restoreAll();
  }
});

test('network failure can be retried; requests forward cancellation', async t => {
  let failed = true;
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.signal, controller.signal);
    options.signal.throwIfAborted();
    if (failed) throw new TypeError('Offline');
    return Response.json(product);
  });
  const api = createCatalogApi(createApiClient('https://api.example.test', async () => null));
  await assert.rejects(api.product('test', controller.signal), { code: 'network_error' });
  failed = false;
  assert.deepEqual(await api.product('test', controller.signal), product);
  controller.abort();
  await assert.rejects(api.product('test', controller.signal), { name: 'AbortError' });
});

test('malformed prices, flags, references and nested data are rejected', () => {
  for (const value of [null, {}, { ...product, brand: null }, { ...product, specifications: [{}] }, { ...product, variants: [{ ...variant, priceInclTax: '100' }] }, { ...product, variants: [{ ...variant, priceInclTax: NaN }] }, { ...product, variants: [{ ...variant, available: 'true' }] }, { ...product, variants: [{ ...variant, images: [null] }] }, { ...product, variants: [{ ...variant, values: {} }] }, { ...product, variants: [variant, variant] }]) assert.throws(() => parseProductDetail(value), /invalide/);
});

test('selecting a disconnected combination updates the entire variant, price, SKU and images', () => {
  const selected = variantForValue(product, variant, 0, 'Blanc');
  assert.equal(selected.id, 2);
  assert.equal(selected.values.Capacité, '256 Go');
  assert.equal(selected.priceInclTax, 150);
  assert.equal(selected.sku, 'TEST-W256');
  assert.deepEqual(productImages(selected), ['https://example.test/white.jpg']);
  assert.equal(availability(selected), 'Stock faible');
  assert.equal(promotion(selected), false);
  assert.equal(variantForValue(product, selected, 1, '128 Go'), undefined);
  assert.equal(variantForValue(product, selected, 0, 'Noir').id, 1);
  assert.equal(variantForValue(product, selected, 0, 'Rouge'), undefined);
});

test('compatible later selections are preserved and unavailable variants remain inspectable', () => {
  const more = { ...product, variants: [...product.variants, { ...variant, id: 3, values: { Couleur: 'Blanc', Capacité: '128 Go' }, available: false }] };
  assert.equal(variantForValue(more, variant, 0, 'Blanc').id, 3);
});

test('availability and promotions use backend values without stock quantities', () => {
  assert.equal(availability(variant), 'Disponible');
  assert.equal(availability({ ...variant, lowStock: true }), 'Stock faible');
  assert.equal(availability({ ...variant, available: false, lowStock: true }), 'Indisponible');
  assert.equal(availability(), 'Indisponible');
  assert.equal(promotion(variant), true);
  for (const regularPriceInclTax of [null, 100, 50]) assert.equal(promotion({ ...variant, regularPriceInclTax }), false);
});

test('missing images and unsafe URLs never produce invented placeholders', () => {
  assert.deepEqual(productImages(), []);
  assert.deepEqual(productImages({ ...variant, images: [] }), []);
  assert.deepEqual(productImages({ ...variant, images: ['javascript:alert(1)', 'file:///secret', 'data:image/svg+xml,<svg/>', 'https://example.test/a', 'https://example.test/a'] }), ['https://example.test/a']);
  assert.deepEqual(parseProductDetail({ ...product, variants: [] }).variants, []);
});

test('HTML is converted to inert readable text with paragraphs and entities', () => {
  assert.equal(descriptionText('<p>Écran &amp; USB</p><p>Poids&nbsp;: 100&#32;g</p><script src="https://bad.test">alert(1)</script><iframe>bad</iframe>'), 'Écran & USB\nPoids : 100 g');
  assert.equal(descriptionText('<img src=x onerror=alert(1)><a href="javascript:bad()">Texte</a>'), 'Texte');
  assert.equal(descriptionText('<script>unclosed'), '');
  assert.equal(descriptionText('&#x1f600; &#999999999;'), '😀');
  assert.equal(descriptionText(null), '');
});

test('accessories explicitly report unavailability without fake counts', () => {
  assert.match(unavailableAccessories, /pas encore disponibles/);
  assert.doesNotMatch(unavailableAccessories, /\d/);
});

test('navigation preserves the existing dynamic route and rejects ambiguous parameters', () => {
  assert.equal(productSlug('produit-test'), 'produit-test');
  assert.equal(productSlug(undefined), '');
  assert.equal(productSlug(['one', 'two']), '');
});

test('zoom stays between original size and four times magnification', () => {
  assert.equal(clampZoom(0.2), 1);
  assert.equal(clampZoom(2.5), 2.5);
  assert.equal(clampZoom(10), 4);
});

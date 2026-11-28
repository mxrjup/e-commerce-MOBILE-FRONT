import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { root, artifacts, compose, json, waitFor } from './common.mjs';

export async function verifyFixtures() {
  const product = await json('/api/catalog/products/e2e-station');
  assert.equal(product.title, 'Station d’accueil');
  assert.equal(product.variants.length, 2);
  for (const [id, sku, price] of [[101, 'E2E-STATION-BASE', 106.8], [201, 'E2E-STATION-PLUS', 118.8]]) {
    const variant = product.variants.find(item => item.id === id);
    assert.ok(variant, `Seeded variant ${id} missing`);
    assert.equal(variant.sku, sku);
    assert.equal(variant.available, true);
    assert.equal(variant.priceInclTax, price);
  }
  for (const [query, count] of [ ['',4], ['category=e2e-accessoires',3], ['category=e2e-accessoires&brand=e2e-alpha',2], ['category=e2e-accessoires&brand=e2e-alpha&universe=e2e-bureau',1], ['q=Station',1], ['q=zzze2eabsent',0] ]) {
    assert.equal((await json(`/api/catalog/products?${query}`)).totalElements, count, `Unexpected fixture results: ${query}`);
  }
  assert.equal((await json('/api/catalog/products/autocomplete?q=Station')).length, 1);
  const cart = await json('/api/cart');
  assert.deepEqual(cart.items, [], 'Preflight cart must be empty');
  const reviews = await json('/api/catalog/products/e2e-station/reviews');
  assert.equal(reviews.totalReviews, 0, 'Preflight reviews must be empty');
}
export async function reset() {
  // No host/database URL override: writes can only reach this compose project.
  compose(['exec', '-T', 'postgres', 'psql', '-U', 'e2e', '-d', 'ecommerce_catalog', '-v', 'ON_ERROR_STOP=1'], {
    input: readFileSync(resolve(root, 'e2e/backend/seed.sql')), stdio: ['pipe', 'inherit', 'inherit'],
  });
  compose(['exec', '-T', 'postgres', 'psql', '-U', 'e2e', '-d', 'ecommerce_cart', '-v', 'ON_ERROR_STOP=1', '-c', 'TRUNCATE ligne_panier, panier RESTART IDENTITY CASCADE;']);
  await verifyFixtures();
}
export async function backend(action) {
  if (action === 'up') {
    assert.ok(existsSync(resolve(root, '../backend/Dockerfile')), 'Expected the backend repository in ../backend');
    // Keycloak imports the fixture realm at first startup.
    compose(['up', '-d', '--force-recreate', 'keycloak']);
    compose(['up', '-d', '--build']);
    await waitFor('Gateway/catalog', () => json('/api/catalog/products'));
    await waitFor('Cart', () => json('/api/cart'));
    await waitFor('Keycloak', async () => {
      const response = await fetch('http://127.0.0.1:18180/realms/ecommerce/.well-known/openid-configuration', { signal: AbortSignal.timeout(5000) });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).issuer, 'http://localhost:18180/realms/ecommerce');
    });
    await reset();
  } else if (action === 'reset') await reset();
  else if (action === 'verify') await verifyFixtures();
  else if (action === 'down') compose(['down', '--volumes', '--remove-orphans']);
  else if (action === 'logs') {
    mkdirSync(artifacts, { recursive: true });
    writeFileSync(resolve(artifacts, 'backend.log'), compose(['logs', '--no-color'], { stdio: 'pipe', maxBuffer: 32 * 1024 * 1024 }));
  } else throw new Error('Expected up, reset, verify, logs or down');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  backend(process.argv[2]).catch(error => { console.error(error); process.exitCode = 1; });
}

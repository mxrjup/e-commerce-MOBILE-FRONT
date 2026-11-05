import assert from 'node:assert/strict';
import { test } from 'node:test';
import { products, defaultFilters, filterProducts, getFacets, getProduct, validPriceRange } from '../src/services/catalog.ts';
const filters = patch => ({ ...defaultFilters, ...patch });

test('catalog has unique stable IDs and every category is represented', () => {
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
  assert.equal(new Set(products.map(p => p.category)).size, 5);
  assert.equal(getProduct('missing'), undefined);
  assert.equal(getProduct('zenbook-14').brand, 'ASUS');
});
test('search ignores accents, case and whitespace and matches all terms', () => {
  assert.deepEqual(filterProducts(products, filters({ query: '  asus   OLED ' })).map(p => p.id), ['zenbook-14']);
  assert.ok(filterProducts(products, filters({ query: 'peripheriques' })).some(p => p.id === 'mx-keys'));
  assert.equal(filterProducts(products, filters({ query: 'ASUS iPhone' })).length, 0);
});
test('facets combine with AND and values within each facet with OR', () => {
  const result = filterProducts(products, filters({ category: 'laptops', brands: ['ASUS', 'Lenovo'], ram: [16, 32], storage: [512, 1024], inStock: true }));
  assert.deepEqual(result.map(p => p.id), ['zenbook-14', 'legion-5']);
  assert.equal(filterProducts(products, filters({ category: 'phones', brands: ['ASUS'] })).length, 0);
});
test('price is inclusive, accepts decimal commas, and rejects invalid ranges', () => {
  assert.deepEqual(filterProducts(products, filters({ minPrice: '109', maxPrice: '109,00' })).map(p => p.id), ['ssd-990', 'mx-keys']);
  for (const patch of [{ minPrice: '-1' }, { maxPrice: 'oops' }, { minPrice: '100', maxPrice: '50' }, { maxPrice: 'Infinity' }]) {
    assert.equal(validPriceRange(filters(patch)), false);
    assert.equal(filterProducts(products, filters(patch)).length, 0);
  }
});
test('availability excludes sold out products and sorting leaves source untouched', () => {
  const ids = products.map(p => p.id);
  assert.ok(filterProducts(products, filters({ inStock: true })).every(p => p.stock > 0));
  const ascending = filterProducts(products, defaultFilters, 'price-asc');
  assert.ok(ascending.every((p, i) => i === 0 || ascending[i - 1].price <= p.price));
  assert.deepEqual(filterProducts(products, defaultFilters, 'price-desc').map(p => p.price), ascending.map(p => p.price).reverse());
  assert.deepEqual(products.map(p => p.id), ids);
});
test('disjunctive facet counts omit only their own selections', () => {
  const facets = getFacets(products, filters({ category: 'laptops', brands: ['ASUS'], ram: [16] }));
  assert.equal(facets.brands.find(f => f.value === 'Apple').count, 1);
  assert.equal(facets.brands.find(f => f.value === 'Lenovo').count, 0);
  assert.equal(facets.ram.find(f => f.value === 16).count, 1);
  assert.equal(facets.ram.find(f => f.value === 32).count, 0);
  assert.equal(facets.storage.find(f => f.value === 512).count, 1);
});

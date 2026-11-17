import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const native = require('react-native-web');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Render the actual TSX with the installed React server renderer. Only platform
// boundaries, navigation and the request hook are substituted (no new runner).
function screen(state, params = { id: 'test-slug' }, target) {
  const actions = [];
  const navigation = [];
  const buttons = [];
  const cache = new Map();
  const mocks = {
    'react-native': { ...native, Pressable: props => {
      buttons.push(props);
      return React.createElement(native.Pressable, props);
    } },
    'react-native-safe-area-context': { SafeAreaView: native.View },
    'expo-image': { Image: native.Image },
    'expo-router': { useLocalSearchParams: () => params, router: {
      replace: path => navigation.push(['replace', path]), push: path => navigation.push(['push', path]),
    } },
  };
  function load(path) {
    if (path.endsWith('/use-api') || path.endsWith('\\use-api')) return { useApi: () => null };
    if (path.endsWith('/use-product') || path.endsWith('\\use-product')) return { useProduct: slug => {
      actions.push(['load', slug]);
      return { ...state, retry: () => actions.push(['retry']) };
    } };
    const filename = ['', '.tsx', '.ts'].map(ext => path + ext).find(existsSync);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const js = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
    const localRequire = name => {
      if (name.endsWith('.css')) return {};
      if (mocks[name]) return mocks[name];
      if (name.startsWith('@/')) return load(resolve(root, 'src', name.slice(2)));
      if (name.startsWith('.')) return load(resolve(dirname(filename), name));
      return require(name);
    };
    runInThisContext(`(function(require,module,exports){${js}\n})`, { filename })(localRequire, module, module.exports);
    return module.exports;
  }
  const Route = target ? load(resolve(root, target.file))[target.name] : load(resolve(root, 'src/app/product/[id].tsx')).default;
  const html = renderToStaticMarkup(React.createElement(Route, target?.props));
  function press(label) {
    const button = buttons.find(p => renderToStaticMarkup(p.children).includes(label));
    assert.ok(button, `Missing control ${label}`);
    button.onPress();
  }
  return { html, actions, navigation, press };
}

test('route passes its slug to the loader and renders loading state', () => {
  const result = screen({ loading: true });
  assert.deepEqual(result.actions, [['load', 'test-slug']]);
  assert.match(result.html, /Chargement du produit/);
});

test('HTTP errors and missing products display their own state and a working retry action', () => {
  const error = screen({ error: 'Service indisponible' });
  assert.match(error.html, /Service indisponible/);
  error.press('Réessayer');
  assert.deepEqual(error.actions.at(-1), ['retry']);
  const missing = screen({ notFound: true, error: 'Erreur HTTP' });
  assert.match(missing.html, /Produit introuvable/);
  assert.doesNotMatch(missing.html, /Erreur HTTP/);
});

test('catalogue and existing cart controls use Expo Router destinations', () => {
  const result = screen({ loading: true });
  result.press('Retour au catalogue');
  result.press('Voir mon panier');
  assert.deepEqual(result.navigation, [['replace', '/catalog'], ['push', '/cart']]);
});

test('successful product renders backend content, promotion and all empty sections', () => {
  const result = screen({ data: {
    id: 1, title: 'Produit de test', brand: { name: 'Marque' }, category: { name: 'Catégorie' }, description: '<p>Description sûre</p><script>alert(1)</script>',
    variants: [{ id: 9, sku: 'SKU-9', values: { Couleur: 'Noir' }, priceInclTax: 100, regularPriceInclTax: 120, ecoTaxInclTax: null, available: true, lowStock: true, images: [] }],
    attributes: [{ name: 'Couleur', values: ['Noir'] }], specifications: [{ key: 'Poids', value: '100 g' }],
  } });
  for (const text of ['Produit de test', 'Marque', 'Catégorie', 'Description sûre', '100,00', '120,00', 'Stock faible', 'SKU-9', 'Poids', '100 g', 'Aucune image disponible', 'Les avis clients ne sont pas encore disponibles', 'Les accessoires associés ne sont pas encore disponibles']) assert.ok(result.html.includes(text), text);
  assert.doesNotMatch(result.html, /alert\(1\)|<script/);
});

test('catalogue card displays real prices and opens the product by slug, not numeric ID', () => {
  const product = { id: 72, slug: 'slug-produit', title: 'Article test', brand: { name: 'Marque' }, category: { name: 'Catégorie' }, priceInclTax: 25, regularPriceInclTax: 30, imageUrl: null, available: false, variantCount: 2 };
  const result = screen({}, {}, { file: 'src/components/shared/catalog/catalog-products.tsx', name: 'ProductLink', props: { product } });
  for (const text of ['Article test', '25,00', '30,00', 'À partir de', 'Indisponible', 'Image indisponible']) assert.ok(result.html.includes(text), text);
  result.press('Article test');
  assert.deepEqual(result.navigation, [['push', { pathname: '/product/[id]', params: { id: 'slug-produit' } }]]);
});

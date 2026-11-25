/// <reference types="node" />
import { test, expect, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';

test.beforeEach(() => {
  execFileSync(process.execPath, ['scripts/e2e/backend.mjs', 'reset'], { stdio: 'inherit' });
});

async function catalog(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Explorer le catalogue/ }).click();
  await expect(page.getByRole('heading', { name: 'Catalogue', exact: true })).toBeVisible();
}

test('Accueil → catalogue → fiche, variantes et navigation', async ({ page }) => {
  await catalog(page);
  await page.getByRole('button', { name: 'Voir Station d’accueil', exact: true }).click();
  await expect(page.getByTestId('product-title')).toHaveText('Station d’accueil');
  await expect(page.getByTestId('product-price')).toHaveText('106,80 € TTC');
  await expect(page.getByTestId('product-availability')).toHaveText('Disponible');
  await page.getByRole('button', { name: 'E2E-STATION-PLUS', exact: true }).click();
  await expect(page.getByTestId('product-price')).toHaveText('118,80 € TTC');
  await page.getByRole('button', { name: 'Retour au catalogue' }).click();
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.getByRole('button', { name: 'Panier', exact: true }).click();
  await expect(page.getByText('Votre panier est vide.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.getByRole('button', { name: 'Accueil', exact: true }).click();
  await expect(page.getByRole('button', { name: /Explorer le catalogue/ })).toBeVisible();
});

test('Filtres catégorie, marque, univers et réinitialisation', async ({ page }) => {
  await catalog(page);
  await expect(page.getByTestId('catalog-result-count')).toHaveText('4 articles');
  for (const [kind, label, count] of [
    ['categories', 'Catégories : E2E Accessoires', '3 articles'],
    ['brands', 'Marques : E2E Alpha', '2 articles'],
    ['universes', 'Univers : E2E Bureau', '1 article'],
  ]) {
    await page.getByTestId(`filter-${kind}`).click();
    await page.getByRole('button', { name: label, exact: true }).click();
    await page.getByTestId(`filter-${kind}`).click();
    await expect(page.getByTestId('catalog-result-count')).toHaveText(count);
  }
  await expect(page.getByRole('button', { name: 'Voir Station d’accueil', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Réinitialiser les filtres' }).click();
  await expect(page.getByTestId('catalog-result-count')).toHaveText('4 articles');
});

test('Recherche, autocomplétion, fiche et aucun résultat', async ({ page }) => {
  await catalog(page);
  await page.getByRole('button', { name: 'Rechercher des produits', exact: true }).click();
  await page.getByRole('textbox', { name: 'Nom du produit', exact: true }).fill('Station');
  await expect(page.getByRole('button', { name: 'Rechercher Station d’accueil', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Rechercher', exact: true }).click();
  await page.getByRole('button', { name: 'Voir Station d’accueil', exact: true }).click();
  await expect(page.getByTestId('product-title')).toHaveText('Station d’accueil');
  await page.getByRole('button', { name: 'Retour au catalogue' }).click();
  await page.getByRole('button', { name: 'Rechercher des produits', exact: true }).click();
  await page.getByRole('textbox', { name: 'Nom du produit', exact: true }).fill('zzze2eabsent');
  await page.getByRole('button', { name: 'Rechercher', exact: true }).click();
  await expect(page.getByText('Aucun produit trouvé. Essayez un autre nom.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Retour', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Catalogue', exact: true })).toBeVisible();
});

test('Panier : ajouter, augmenter, diminuer et supprimer', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.getByText('Votre panier est vide.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ajouter E2E Sac', exact: true }).click();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('46,80 €');
  await expect(page.getByTestId(/^cart-quantity-/)).toHaveText('1');
  await page.getByRole('button', { name: 'Ajouter 1 E2E Sac', exact: true }).click();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('93,60 €');
  await expect(page.getByTestId(/^cart-quantity-/)).toHaveText('2');
  await page.getByRole('button', { name: 'Retirer 1 E2E Sac', exact: true }).click();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('46,80 €');
  await expect(page.getByTestId(/^cart-quantity-/)).toHaveText('1');
  await page.getByRole('button', { name: 'Supprimer E2E Sac', exact: true }).click();
  await expect(page.getByText('Votre panier est vide.', { exact: true })).toBeVisible();
  await expect(page.getByTestId('cart-subtotal')).toHaveCount(0);
});

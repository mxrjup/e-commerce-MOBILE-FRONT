import assert from 'node:assert/strict';
import test from 'node:test';

import { createApiClient } from '../src/services/api-client.ts';
import {
  createCatalogAlert,
  deleteCatalogAlert,
  fetchCatalogAlerts,
  fetchNotifications,
  fetchUnreadNotificationsCount,
  mapCatalogAlertListResponse,
  mapNotificationListResponse,
  mapUnreadCountResponse,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  parsePositivePrice,
  updateCatalogAlert,
  validateCreateAlertInput,
  validateUpdateAlertPrice,
} from '../src/services/notifications-api.ts';

test('mapNotificationListResponse normalizes variant alerts and sorts newest first', () => {
  const notifications = mapNotificationListResponse([
    {
      id: 1,
      type: 'ORDER_UPDATE',
      title: 'Commande expédiée',
      message: 'Votre colis est en route.',
      read: true,
      readAt: '2026-11-20T10:00:00Z',
      createdAt: '2026-11-20T09:00:00Z',
      variantAlert: null,
    },
    {
      id: 3,
      type: 'VARIANT_ALERT',
      title: 'Baisse de prix détectée',
      message: 'Le produit est passé sous votre seuil.',
      read: false,
      readAt: null,
      createdAt: '2026-11-22T12:00:00Z',
      variantAlert: {
        id: 14,
        variantId: 77,
        sku: 'GPU-4070-OC',
        productName: 'Carte Graphique RTX 4070',
        alertType: 'PRICE_DROP',
        currentStock: 8,
        threshold: 3,
        resolved: false,
      },
    },
  ]);

  assert.equal(notifications.length, 2);
  assert.equal(notifications[0].id, 3);
  assert.equal(notifications[0].read, false);
  assert.equal(notifications[0].variantAlert?.sku, 'GPU-4070-OC');
  assert.equal(notifications[1].id, 1);
  assert.equal(mapUnreadCountResponse({ unreadCount: 1 }), 1);
});

test('mapCatalogAlertListResponse sorts active alerts before inactive ones', () => {
  const alerts = mapCatalogAlertListResponse([
    {
      id: 2,
      productId: 10,
      variantId: 21,
      alertType: 'BACK_IN_STOCK',
      targetPriceExclTax: null,
      active: false,
      triggeredAt: '2026-11-21T15:00:00Z',
      createdAt: '2026-11-20T10:00:00Z',
    },
    {
      id: 5,
      productId: 12,
      variantId: 35,
      alertType: 'PRICE_DROP',
      targetPriceExclTax: 249.9,
      active: true,
      triggeredAt: null,
      createdAt: '2026-11-19T10:00:00Z',
    },
  ]);

  assert.equal(alerts.length, 2);
  assert.equal(alerts[0].id, 5);
  assert.equal(alerts[0].active, true);
  assert.equal(alerts[0].targetPriceExclTax, 249.9);
  assert.equal(alerts[1].id, 2);
  assert.equal(alerts[1].active, false);
});

test('price parser and alert form validators enforce required fields', () => {
  assert.equal(parsePositivePrice('199,90'), 199.9);
  assert.equal(parsePositivePrice('0'), null);
  assert.equal(parsePositivePrice('-12'), null);
  assert.equal(validateUpdateAlertPrice('0,00'), 'Saisissez un prix cible HT supérieur ou égal à 0,01 €.');
  assert.equal(validateUpdateAlertPrice('49.50'), undefined);

  const invalidPriceAlert = validateCreateAlertInput({
    variantId: 'abc',
    productId: '-1',
    alertType: 'PRICE_DROP',
    targetPriceExclTax: '',
  });
  assert.ok(invalidPriceAlert.variantId);
  assert.ok(invalidPriceAlert.productId);
  assert.ok(invalidPriceAlert.targetPriceExclTax);

  const validStockAlert = validateCreateAlertInput({
    variantId: '42',
    productId: '',
    alertType: 'BACK_IN_STOCK',
    targetPriceExclTax: '',
  });
  assert.deepEqual(validStockAlert, {});
});

test('notification and catalog alert API helpers call expected endpoints', async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, init) => {
    const parsedUrl = new URL(String(url));
    calls.push({
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: init?.method ?? 'GET',
      auth: new Headers(init?.headers).get('Authorization'),
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });

    if (parsedUrl.pathname === '/api/v1/notifications/unread-count') {
      return new Response(JSON.stringify({ unreadCount: 2 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (parsedUrl.pathname === '/api/v1/notifications/read-all' || init?.method === 'DELETE') {
      return new Response(null, { status: 204 });
    }

    if (parsedUrl.pathname.endsWith('/read')) {
      return new Response(
        JSON.stringify({
          id: 7,
          type: 'SYSTEM',
          title: 'Bienvenue',
          message: 'Compte actif',
          read: true,
          readAt: '2026-11-22T12:00:00Z',
          createdAt: '2026-11-22T11:00:00Z',
          variantAlert: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (parsedUrl.pathname === '/api/v1/notifications' || parsedUrl.pathname === '/api/v1/notifications/alerts' && init?.method === 'GET') {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        id: 11,
        productId: 4,
        variantId: 18,
        alertType: 'PRICE_DROP',
        targetPriceExclTax: 149.99,
        active: true,
        triggeredAt: null,
        createdAt: '2026-11-22T12:00:00Z',
      }),
      { status: init?.method === 'POST' ? 201 : 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const api = createApiClient('http://localhost:8080', async () => 'jwt-notif-token');

    await fetchNotifications(api, { unreadOnly: true });
    assert.equal(await fetchUnreadNotificationsCount(api), 2);
    await markNotificationAsRead(api, 7);
    await markAllNotificationsAsRead(api);
    await fetchCatalogAlerts(api, { activeOnly: true });
    const created = await createCatalogAlert(api, {
      productId: 4,
      variantId: 18,
      alertType: 'PRICE_DROP',
      targetPriceExclTax: 149.99,
    });
    assert.equal(created.id, 11);
    await updateCatalogAlert(api, 11, { targetPriceExclTax: 129.99, active: false });
    await deleteCatalogAlert(api, 11);

    assert.equal(calls.length, 8);
    assert.ok(calls.every((call) => call.auth === 'Bearer jwt-notif-token'));
    assert.deepEqual(
      calls.map((c) => `${c.method} ${c.path}`),
      [
        'GET /api/v1/notifications?unreadOnly=true',
        'GET /api/v1/notifications/unread-count',
        'PATCH /api/v1/notifications/7/read',
        'PATCH /api/v1/notifications/read-all',
        'GET /api/v1/notifications/alerts?activeOnly=true',
        'POST /api/v1/notifications/alerts',
        'PATCH /api/v1/notifications/alerts/11',
        'DELETE /api/v1/notifications/alerts/11',
      ]
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
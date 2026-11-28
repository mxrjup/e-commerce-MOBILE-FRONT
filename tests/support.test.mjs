import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError, createApiClient } from '../src/services/api-client.ts';
import {
  addSupportTicketMessage,
  createSupportTicket,
  fetchMySupportTickets,
  fetchSupportTicketDetail,
  getSupportApiErrorMessage,
  getTicketCategoryLabel,
  getTicketStatusLabel,
  isOrderEligibleForSupport,
  isOrderRequiredCategory,
  isTicketActiveStatus,
  mapTicketDetailResponse,
  mapTicketSummaryListResponse,
  parsePositiveTicketId,
  validateCreateTicketInput,
  validateTicketReply,
} from '../src/services/support-api.ts';

test('mapTicketSummaryListResponse normalizes DTOs and sorts most recently updated first', () => {
  const tickets = mapTicketSummaryListResponse([
    {
      id: 2,
      subject: 'Question facture',
      category: 'ACCOUNT',
      status: 'CLOSED',
      orderId: null,
      orderNumber: null,
      messageCount: 3,
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-19T14:00:00Z',
    },
    {
      id: 5,
      subject: 'Colis endommagé à la réception',
      category: 'DELIVERY',
      status: 'WAITING_CUSTOMER',
      orderId: 41,
      orderNumber: 'CMD-2026-0041',
      messageCount: 2,
      createdAt: '2026-11-21T09:00:00Z',
      updatedAt: '2026-11-22T11:30:00Z',
    },
  ]);

  assert.equal(tickets.length, 2);
  assert.equal(tickets[0].id, 5);
  assert.equal(tickets[0].orderNumber, 'CMD-2026-0041');
  assert.equal(isTicketActiveStatus(tickets[0].status), true);
  assert.equal(tickets[1].id, 2);
  assert.equal(isTicketActiveStatus(tickets[1].status), false);
});

test('mapTicketDetailResponse orders discussion messages chronologically', () => {
  const detail = mapTicketDetailResponse({
    id: 9,
    subject: 'Demande de retour produit',
    category: 'RETURN_REFUND',
    status: 'IN_PROGRESS',
    orderId: 18,
    orderNumber: 'CMD-2026-0018',
    createdAt: '2026-11-20T08:00:00Z',
    updatedAt: '2026-11-20T12:00:00Z',
    messages: [
      {
        id: 22,
        authorRole: 'AGENT',
        content: 'Bonjour, nous avons généré votre bon de retour.',
        createdAt: '2026-11-20T10:15:00Z',
      },
      {
        id: 21,
        authorRole: 'CUSTOMER',
        content: 'Bonjour, je souhaite retourner cet article.',
        createdAt: '2026-11-20T08:00:00Z',
      },
    ],
  });

  assert.equal(detail.messages.length, 2);
  assert.equal(detail.messages[0].id, 21);
  assert.equal(detail.messages[0].authorRole, 'CUSTOMER');
  assert.equal(detail.messages[1].id, 22);
  assert.equal(detail.messages[1].authorRole, 'AGENT');
});

test('ticket validators and labels enforce required fields, order requirement, and 14-day window', () => {
  assert.equal(getTicketCategoryLabel('RETURN_REFUND'), 'Retour & remboursement');
  assert.equal(getTicketStatusLabel('WAITING_CUSTOMER'), 'Réponse attendue');
  assert.equal(parsePositiveTicketId('42'), 42);
  assert.equal(parsePositiveTicketId('abc'), null);

  assert.equal(isOrderRequiredCategory('ORDER'), true);
  assert.equal(isOrderRequiredCategory('DELIVERY'), true);
  assert.equal(isOrderRequiredCategory('RETURN_REFUND'), true);
  assert.equal(isOrderRequiredCategory('PRODUCT'), false);
  assert.equal(isOrderRequiredCategory('ACCOUNT'), false);
  assert.equal(isOrderRequiredCategory('OTHER'), false);

  const invalid = validateCreateTicketInput({
    subject: '   ',
    message: '',
    category: 'ORDER',
  });
  assert.ok(invalid.subject);
  assert.ok(invalid.message);
  assert.ok(invalid.order);
  assert.ok(invalid.category);

  // Catégorie nécessitant une commande sans commande sélectionnée
  const missingOrder = validateCreateTicketInput({
    subject: 'Article manquant',
    message: 'Il manque un câble dans mon colis.',
    category: 'DELIVERY',
  });
  assert.ok(missingOrder.order);
  assert.ok(missingOrder.category);

  // Même catégorie avec une commande valide (< 14 jours)
  const now = new Date('2026-11-28T12:00:00Z');
  assert.deepEqual(
    validateCreateTicketInput({
      subject: 'Article manquant',
      message: 'Il manque un câble dans mon colis.',
      category: 'ORDER',
      orderId: 12,
      orderNumber: 'CMD-2026-0012',
      orderCreatedAt: '2026-11-20T12:00:00Z',
      now,
    }),
    {}
  );

  // Commande de plus de 14 jours
  assert.equal(isOrderEligibleForSupport('2026-11-10T12:00:00Z', now), false);
  assert.equal(isOrderEligibleForSupport('2026-11-20T12:00:00Z', now), true);

  const expiredOrder = validateCreateTicketInput({
    subject: 'Demande de retour',
    message: 'Je souhaite retourner ma commande.',
    category: 'RETURN_REFUND',
    orderId: 9,
    orderNumber: 'CMD-2026-0009',
    orderCreatedAt: '2026-11-10T12:00:00Z',
    now,
  });
  assert.ok(expiredOrder.order);

  // Catégorie sans commande autorisée
  assert.deepEqual(
    validateCreateTicketInput({
      subject: 'Question produit',
      message: 'Cet écran est-il compatible VESA ?',
      category: 'PRODUCT',
    }),
    {}
  );

  // Extraction du message métier du serveur sur 400 / 409
  assert.equal(
    getSupportApiErrorMessage(
      new ApiError('http_error', 'La requête a échoué (409).', 409, {
        message: 'Le délai de 14 jours pour ouvrir un ticket SAV sur cette commande est dépassé.',
      })
    ),
    'Le délai de 14 jours pour ouvrir un ticket SAV sur cette commande est dépassé.'
  );

  assert.ok(validateTicketReply('   '));
  assert.equal(validateTicketReply('Voici la photo demandée.'), undefined);
});

test('support API helpers call expected endpoints with bearer token', async () => {
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

    if (parsedUrl.pathname === '/api/v1/support/tickets' && (init?.method ?? 'GET') === 'GET') {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (parsedUrl.pathname === '/api/v1/support/tickets' && init?.method === 'POST') {
      return new Response(
        JSON.stringify({
          id: 14,
          subject: 'Problème livraison',
          category: 'DELIVERY',
          status: 'OPEN',
          orderId: 7,
          orderNumber: 'CMD-2026-0007',
          createdAt: '2026-11-22T15:00:00Z',
          updatedAt: '2026-11-22T15:00:00Z',
          messages: [
            {
              id: 31,
              authorRole: 'CUSTOMER',
              content: 'Le suivi est bloqué depuis 4 jours.',
              createdAt: '2026-11-22T15:00:00Z',
            },
          ],
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (parsedUrl.pathname === '/api/v1/support/tickets/14' && (init?.method ?? 'GET') === 'GET') {
      return new Response(
        JSON.stringify({
          id: 14,
          subject: 'Problème livraison',
          category: 'DELIVERY',
          status: 'OPEN',
          orderId: 7,
          orderNumber: 'CMD-2026-0007',
          createdAt: '2026-11-22T15:00:00Z',
          updatedAt: '2026-11-22T15:00:00Z',
          messages: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        id: 32,
        authorRole: 'CUSTOMER',
        content: 'Merci pour votre retour.',
        createdAt: '2026-11-22T15:05:00Z',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const api = createApiClient('http://localhost:8080', async () => 'jwt-support-token');

    await fetchMySupportTickets(api, { status: 'OPEN' });
    const created = await createSupportTicket(api, {
      subject: 'Problème livraison',
      message: 'Le suivi est bloqué depuis 4 jours.',
      category: 'DELIVERY',
      orderId: 7,
      orderNumber: 'CMD-2026-0007',
    });
    assert.equal(created.id, 14);
    await fetchSupportTicketDetail(api, 14);
    const reply = await addSupportTicketMessage(api, 14, { content: 'Merci pour votre retour.' });
    assert.equal(reply.id, 32);

    assert.equal(calls.length, 4);
    assert.ok(calls.every((call) => call.auth === 'Bearer jwt-support-token'));
    assert.deepEqual(
      calls.map((c) => `${c.method} ${c.path}`),
      [
        'GET /api/v1/support/tickets?status=OPEN',
        'POST /api/v1/support/tickets',
        'GET /api/v1/support/tickets/14',
        'POST /api/v1/support/tickets/14/messages',
      ]
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
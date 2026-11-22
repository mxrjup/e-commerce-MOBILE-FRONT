import assert from 'node:assert/strict';
import test from 'node:test';

import { createApiClient } from '../src/services/api-client.ts';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchUserProfile,
  mapAddressListResponse,
  mapAddressResponse,
  mapUserProfileResponse,
  setDefaultAddress,
  updateAddress,
  updateUserProfile,
  validateAddress,
  validateUserProfile,
} from '../src/services/user-profile-api.ts';

test('mapUserProfileResponse normalizes nullable fields safely', () => {
  const profile = mapUserProfileResponse({
    id: 42,
    authProviderId: 'sub-123',
    email: 'client@log.fr',
    firstName: null,
    lastName: 'Martin',
    phone: undefined,
  });

  assert.deepEqual(profile, {
    id: 42,
    authProviderId: 'sub-123',
    email: 'client@log.fr',
    firstName: '',
    lastName: 'Martin',
    phone: '',
  });
});

test('mapAddressResponse and mapAddressListResponse handle default flag and sort default first', () => {
  const secondary = mapAddressResponse({
    id: 2,
    label: 'Bureau',
    recipient: 'Alice Martin',
    street: '10 rue de la Paix',
    complement: 'Étage 3',
    zipCode: '75002',
    city: 'Paris',
    country: 'France',
    default: false,
  });

  assert.equal(secondary.isDefault, false);

  const list = mapAddressListResponse([
    secondary,
    {
      id: 5,
      label: 'Domicile',
      recipient: 'Alice Martin',
      street: '4 avenue Jean Jaurès',
      zipCode: '30900',
      city: 'Nîmes',
      country: 'France',
      isDefault: true,
    },
  ]);

  assert.equal(list.length, 2);
  assert.equal(list[0].id, 5);
  assert.equal(list[0].isDefault, true);
  assert.equal(list[1].id, 2);
});

test('validateUserProfile requires non-blank firstName and lastName', () => {
  assert.deepEqual(validateUserProfile({ firstName: '  ', lastName: '', phone: '' }), {
    firstName: 'Le prénom est obligatoire.',
    lastName: 'Le nom est obligatoire.',
  });

  assert.deepEqual(validateUserProfile({ firstName: 'Camille', lastName: 'Durand', phone: '0612345678' }), {});
});

test('validateAddress validates required postal fields', () => {
  const invalid = validateAddress({
    label: '',
    recipient: ' ',
    street: '',
    complement: '',
    zipCode: '',
    city: 'Lyon',
    country: 'France',
    isDefault: false,
  });

  assert.equal(invalid.recipient, 'Le nom du destinataire est obligatoire.');
  assert.equal(invalid.street, 'L’adresse est obligatoire.');
  assert.equal(invalid.zipCode, 'Le code postal est obligatoire.');
  assert.equal(invalid.city, undefined);
  assert.equal(invalid.country, undefined);
});

test('profile and address API helpers call expected endpoints with bearer token', async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, init) => {
    calls.push({
      url: String(url),
      method: init?.method ?? 'GET',
      auth: new Headers(init?.headers).get('Authorization'),
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });

    if (String(url).endsWith('/api/v1/users/me')) {
      return new Response(
        JSON.stringify({
          id: 1,
          authProviderId: 'kc-1',
          email: 'camille@log.fr',
          firstName: 'Camille',
          lastName: 'Durand',
          phone: '0601020304',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (String(url).endsWith('/api/v1/addresses') && init?.method === 'GET') {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (init?.method === 'DELETE') {
      return new Response(null, { status: 204 });
    }

    return new Response(
      JSON.stringify({
        id: 9,
        label: 'Maison',
        recipient: 'Camille Durand',
        street: '12 rue Victor Hugo',
        complement: '',
        zipCode: '69002',
        city: 'Lyon',
        country: 'France',
        isDefault: true,
      }),
      { status: init?.method === 'POST' ? 201 : 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const api = createApiClient('http://localhost:8080', async () => 'test-jwt-token');

    const profile = await fetchUserProfile(api);
    assert.equal(profile.email, 'camille@log.fr');

    await updateUserProfile(api, { firstName: ' Camille ', lastName: ' Durand ', phone: ' 0601020304 ' });
    await fetchAddresses(api);

    const created = await createAddress(api, {
      label: ' Maison ',
      recipient: ' Camille Durand ',
      street: ' 12 rue Victor Hugo ',
      complement: '',
      zipCode: ' 69002 ',
      city: ' Lyon ',
      country: ' France ',
      isDefault: true,
    });
    assert.equal(created.id, 9);

    await updateAddress(api, 9, {
      label: 'Maison',
      recipient: 'Camille Durand',
      street: '14 rue Victor Hugo',
      complement: '',
      zipCode: '69002',
      city: 'Lyon',
      country: 'France',
      isDefault: true,
    });
    await setDefaultAddress(api, 9);
    await deleteAddress(api, 9);

    assert.equal(calls.length, 7);
    assert.ok(calls.every((call) => call.auth === 'Bearer test-jwt-token'));
    assert.deepEqual(
      calls.map((c) => `${c.method} ${new URL(c.url).pathname}`),
      [
        'GET /api/v1/users/me',
        'PUT /api/v1/users/me',
        'GET /api/v1/addresses',
        'POST /api/v1/addresses',
        'PUT /api/v1/addresses/9',
        'PATCH /api/v1/addresses/9/default',
        'DELETE /api/v1/addresses/9',
      ]
    );
    assert.deepEqual(calls[1].body, {
      firstName: 'Camille',
      lastName: 'Durand',
      phone: '0601020304',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
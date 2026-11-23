import assert from 'node:assert/strict';
import test from 'node:test';

import { prepareCheckoutAddressPayload, selectCheckoutAddress } from '../src/services/checkout-address.ts';

const payload = {
  label: 'Maison',
  recipient: 'Camille Durand',
  street: '12 rue Victor Hugo',
  complement: '',
  zipCode: '69002',
  city: 'Lyon',
  country: 'France',
  isDefault: false,
};

test('first address created during checkout becomes the default', () => {
  assert.deepEqual(prepareCheckoutAddressPayload(payload, 0), {
    ...payload,
    isDefault: true,
  });
});

test('additional checkout addresses preserve the selected default choice', () => {
  assert.deepEqual(prepareCheckoutAddressPayload(payload, 2), payload);
  assert.equal(prepareCheckoutAddressPayload({ ...payload, isDefault: true }, 2).isDefault, true);
});

test('checkout selects the default address, otherwise the first address', () => {
  const first = { ...payload, id: 1, isDefault: false };
  const second = { ...payload, id: 2, isDefault: true };
  assert.equal(selectCheckoutAddress([first, second])?.id, 2);
  assert.equal(selectCheckoutAddress([first])?.id, 1);
  assert.equal(selectCheckoutAddress([]), undefined);
});

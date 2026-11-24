import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkoutFailureMessage,
  checkoutSessionId,
  isSafeStripeCheckoutUrl,
} from '../src/services/checkout-payment.ts';

test('only HTTP and HTTPS Stripe checkout URLs are accepted', () => {
  assert.equal(isSafeStripeCheckoutUrl('https://checkout.stripe.com/c/pay/test'), true);
  assert.equal(isSafeStripeCheckoutUrl('http://localhost/checkout'), true);
  assert.equal(isSafeStripeCheckoutUrl('javascript:alert(1)'), false);
  assert.equal(isSafeStripeCheckoutUrl('ecommerce://checkout-success'), false);
  assert.equal(isSafeStripeCheckoutUrl(undefined), false);
});

test('checkout session params reject ambiguous arrays', () => {
  assert.equal(checkoutSessionId('cs_test_123'), 'cs_test_123');
  assert.equal(checkoutSessionId(['cs_one', 'cs_two']), '');
  assert.equal(checkoutSessionId(undefined), '');
});

test('checkout failures keep useful backend or browser messages', () => {
  assert.equal(checkoutFailureMessage(new Error('Lien Stripe indisponible')), 'Lien Stripe indisponible');
  assert.equal(checkoutFailureMessage('offline'), 'Impossible d’ouvrir ou de finaliser le paiement Stripe.');
});

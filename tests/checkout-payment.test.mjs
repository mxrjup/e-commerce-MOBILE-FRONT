import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkoutFailureMessage,
  checkoutReturnRoute,
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

test('Stripe return deep links open the matching result screen', () => {
  assert.deepEqual(checkoutReturnRoute('ecommerce://checkout-success?session_id=cs_test_123'), {
    pathname: '/checkout-success',
    params: { session_id: 'cs_test_123' },
  });
  assert.deepEqual(checkoutReturnRoute('ecommerce://checkout-cancel'), { pathname: '/checkout-cancel', params: {} });
  assert.deepEqual(checkoutReturnRoute('ecommerce://checkout-success/?session_id=cs%5Fa'), {
    pathname: '/checkout-success',
    params: { session_id: 'cs_a' },
  });
});

test('Stripe return deep links ignore other links and ambiguous sessions', () => {
  assert.equal(checkoutReturnRoute('ecommerce://auth-callback?code=1'), null);
  assert.equal(checkoutReturnRoute('ecommerce://checkout-other'), null);
  assert.equal(checkoutReturnRoute('https://shop.test/checkout/success'), null);
  assert.equal(checkoutReturnRoute(undefined), null);
  assert.deepEqual(checkoutReturnRoute('ecommerce://checkout-success?session_id=a&session_id=b'), {
    pathname: '/checkout-success',
    params: {},
  });
});

export function isSafeStripeCheckoutUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function checkoutSessionId(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

export function checkoutFailureMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Impossible d’ouvrir ou de finaliser le paiement Stripe.';
}

/**
 * Stripe sends the buyer to PUBLIC_URL/checkout/success or /checkout/cancel (HTTPS, as Stripe
 * recommends). Those pages forward to these deep links, which close the payment browser.
 */
export const CHECKOUT_RETURN_PREFIX = 'ecommerce://checkout-';

export type CheckoutReturnRoute = {
  pathname: '/checkout-success' | '/checkout-cancel';
  params: { session_id?: string };
};

/** The app screen for a Stripe return deep link, or null for any other URL. */
export function checkoutReturnRoute(url: string | null | undefined): CheckoutReturnRoute | null {
  if (typeof url !== 'string' || !url.startsWith(CHECKOUT_RETURN_PREFIX)) return null;
  const [target, query = ''] = url.slice(CHECKOUT_RETURN_PREFIX.length).split('?', 2);
  const result = target.replace(/\/+$/, '');
  if (result !== 'success' && result !== 'cancel') return null;

  const sessionIds = query
    .split('&')
    .map((pair) => pair.split('='))
    .filter(([key]) => key === 'session_id')
    .map(([, value = '']) => {
      try {
        return decodeURIComponent(value);
      } catch {
        return '';
      }
    });
  const sessionId = sessionIds.length === 1 ? sessionIds[0] : '';

  return {
    pathname: result === 'success' ? '/checkout-success' : '/checkout-cancel',
    params: sessionId ? { session_id: sessionId } : {},
  };
}

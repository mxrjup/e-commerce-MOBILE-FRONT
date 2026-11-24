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

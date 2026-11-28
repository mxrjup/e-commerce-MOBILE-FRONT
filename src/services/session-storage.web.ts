// Browser tokens stay in memory and are discarded on reload.
export async function readRefreshToken(): Promise<string | null> { return null; }
export async function writeRefreshToken(_token: string | null) {}

const cartKey = 'cart.session-token';
let cartToken: string | null = null;

export async function readCartSessionToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try { cartToken = window.sessionStorage.getItem(cartKey); } catch { /* Private browsing may disable storage. */ }
  return cartToken;
}

export async function writeCartSessionToken(token: string | null) {
  if (typeof window === 'undefined') return;
  cartToken = token;
  try {
    if (token) window.sessionStorage.setItem(cartKey, token);
    else window.sessionStorage.removeItem(cartKey);
  } catch { /* Retain the session in memory when browser storage is unavailable. */ }
}

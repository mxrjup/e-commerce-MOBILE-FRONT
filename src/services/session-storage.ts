import * as SecureStore from 'expo-secure-store';

const key = 'keycloak.refresh-token';
const cartSessionTokenKey = 'cart.session-token';

export async function readRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function writeRefreshToken(token: string | null) {
  if (token) await SecureStore.setItemAsync(key, token);
  else await SecureStore.deleteItemAsync(key);
}

export async function readCartSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(cartSessionTokenKey);
}

export async function writeCartSessionToken(token: string | null) {
  if (token) await SecureStore.setItemAsync(cartSessionTokenKey, token);
  else await SecureStore.deleteItemAsync(cartSessionTokenKey);
}

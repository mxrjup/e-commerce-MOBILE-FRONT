import * as SecureStore from 'expo-secure-store';

const key = 'keycloak.refresh-token';

export async function readRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function writeRefreshToken(token: string | null) {
  if (token) await SecureStore.setItemAsync(key, token);
  else await SecureStore.deleteItemAsync(key);
}

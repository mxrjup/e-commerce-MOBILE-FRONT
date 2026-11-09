export type KeycloakConfig = { issuer: string; clientId: string };
export type Tokens = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
};
export type User = { roles?: string[]; sub: string; name?: string; preferred_username?: string; email?: string };

export class KeycloakError extends Error {
  constructor(public code: string) {
    super('La connexion a échoué. Veuillez réessayer.');
  }
}

export function endpoint(config: KeycloakConfig, path: string) {
  return `${config.issuer.replace(/\/$/, '')}/protocol/openid-connect/${path}`;
}

async function tokenRequest(config: KeycloakConfig, params: Record<string, string>): Promise<Tokens> {
  const response = await fetch(endpoint(config, 'token'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.clientId, ...params }).toString(),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new KeycloakError(typeof data.error === 'string' ? data.error : 'token_error');
  if (typeof data.access_token !== 'string' || !data.access_token ||
      typeof data.expires_in !== 'number' || data.expires_in <= 0) {
    throw new KeycloakError('invalid_response');
  }
  return data;
}

export function exchangeCode(config: KeycloakConfig, code: string, verifier: string, redirectUri: string) {
  return tokenRequest(config, {
    grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: redirectUri,
  });
}

export function refreshTokens(config: KeycloakConfig, refreshToken: string) {
  return tokenRequest(config, { grant_type: 'refresh_token', refresh_token: refreshToken });
}

export async function fetchUser(config: KeycloakConfig, accessToken: string): Promise<User> {
  const response = await fetch(endpoint(config, 'userinfo'), {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new KeycloakError('userinfo_error');
  const user = await response.json();
  if (typeof user.sub !== 'string') throw new KeycloakError('invalid_user');
  return user;
}

export async function revokeRefreshToken(config: KeycloakConfig, token: string) {
  const response = await fetch(endpoint(config, 'revoke'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.clientId, token, token_type_hint: 'refresh_token' }).toString(),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new KeycloakError('revocation_error');
}


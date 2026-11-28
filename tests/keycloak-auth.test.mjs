import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildAuthorizationUrl, endpoint } from '../src/services/keycloak.ts';

const baseAuthUrl =
  'http://localhost:8180/realms/ecommerce/protocol/openid-connect/auth?client_id=mobile-app&redirect_uri=ecommerce%3A%2F%2Fauth-callback&response_type=code&scope=openid+profile+email&code_challenge=abc123&code_challenge_method=S256&state=xyz789';

test('builds Keycloak OIDC endpoints from realm issuer', () => {
  const cfg = { issuer: 'http://localhost:8180/realms/ecommerce/', clientId: 'mobile-app' };
  assert.equal(endpoint(cfg, 'auth'), 'http://localhost:8180/realms/ecommerce/protocol/openid-connect/auth');
  assert.equal(endpoint(cfg, 'token'), 'http://localhost:8180/realms/ecommerce/protocol/openid-connect/token');
});

test('builds email login URL preserving PKCE parameters without IdP hint', () => {
  const result = new URL(buildAuthorizationUrl(baseAuthUrl, { mode: 'login', provider: 'email' }));
  assert.equal(result.pathname, '/realms/ecommerce/protocol/openid-connect/auth');
  assert.equal(result.searchParams.get('prompt'), 'login');
  assert.equal(result.searchParams.has('kc_idp_hint'), false);
  assert.equal(result.searchParams.get('code_challenge'), 'abc123');
  assert.equal(result.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(result.searchParams.get('state'), 'xyz789');
});

test('builds email registration URL targeting Keycloak registrations endpoint', () => {
  const result = new URL(buildAuthorizationUrl(baseAuthUrl, { mode: 'register', provider: 'email' }));
  assert.equal(result.pathname, '/realms/ecommerce/protocol/openid-connect/registrations');
  assert.equal(result.searchParams.get('prompt'), 'create');
  assert.equal(result.searchParams.has('kc_idp_hint'), false);
  assert.equal(result.searchParams.get('code_challenge'), 'abc123');
});

test('sets kc_idp_hint for Google and Apple in both login and register modes', () => {
  for (const provider of ['google', 'apple']) {
    for (const mode of ['login', 'register']) {
      const result = new URL(buildAuthorizationUrl(baseAuthUrl, { mode, provider }));
      assert.equal(result.pathname, '/realms/ecommerce/protocol/openid-connect/auth');
      assert.equal(result.searchParams.get('kc_idp_hint'), provider);
      assert.equal(result.searchParams.get('code_challenge'), 'abc123');
      assert.equal(result.searchParams.get('state'), 'xyz789');
    }
  }
});
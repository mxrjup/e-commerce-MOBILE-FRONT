import { CodeChallengeMethod, makeRedirectUri, Prompt, ResponseType, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { endpoint, exchangeCode, fetchUser, KeycloakError, refreshTokens, revokeRefreshToken, type Tokens, type User } from '@/services/keycloak';
import { readRefreshToken, writeRefreshToken } from '@/services/session-storage';

WebBrowser.maybeCompleteAuthSession();

// Match Keycloak's public hostname so its login requests share the same cookies.
// Android emulator: adb reverse tcp:8180 tcp:8180 forwards localhost to the PC.
const baseUrl = (process.env.EXPO_PUBLIC_KEYCLOAK_URL || 'http://localhost:8180').replace(/\/$/, '');
const config = {
  issuer: `${baseUrl}/realms/${process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'ecommerce'}`,
  clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'mobile-app',
};
const discovery = { authorizationEndpoint: endpoint(config, 'auth') };
const redirectUri = makeRedirectUri({ scheme: 'ecommerce', path: 'auth-callback' });
type Session = { tokens: Tokens; expiresAt: number; user: User };
type AuthContextValue = {
  user: User | null;
  busy: boolean;
  ready: boolean;
  error: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const current = useRef<Session | null>(null);
  const [busy, setBusy] = useState(true);
  const locked = useRef(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const refreshInFlight = useRef<Promise<string | null> | null>(null);
  const [request, , promptAsync] = useAuthRequest({
    clientId: config.clientId, redirectUri, responseType: ResponseType.Code,
    scopes: ['openid', 'profile', 'email'], usePKCE: true,
    codeChallengeMethod: CodeChallengeMethod.S256, prompt: Prompt.Login,
    extraParams: { ui_locales: 'fr', 'app_attempt': String(attempt) },
  }, discovery);

  async function accept(tokens: Tokens) {
    const user = await fetchUser(config, tokens.access_token);
    await writeRefreshToken(tokens.refresh_token || null);
    const next = { tokens, user, expiresAt: Date.now() + tokens.expires_in * 1000 };
    current.current = next;
    setSession(next);
  }

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const token = await readRefreshToken();
        if (token) {
          const tokens = await refreshTokens(config, token);
          if (active) await accept({ ...tokens, refresh_token: tokens.refresh_token || token });
        }
      } catch (cause) {
        if (cause instanceof KeycloakError && cause.code === 'invalid_grant') {
          await writeRefreshToken(null);
        }
        if (active) setError('Votre session n’a pas pu être restaurée. Veuillez vous reconnecter.');
      } finally {
        if (active) { locked.current = false; setBusy(false); }
      }
    }
    void restore();
    return () => { active = false; };
  }, []);

  async function signIn() {
    if (locked.current || !request) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      // Keep the browser prompt directly in the button event for web popup policies.
      const result = await promptAsync();
      if (result.type === 'success' && result.params.code && request.codeVerifier) {
        await accept(await exchangeCode(config, result.params.code, request.codeVerifier, redirectUri));
      } else if (result.type !== 'cancel' && result.type !== 'dismiss') {
        setError('La connexion a échoué. Veuillez réessayer.');
      }
    } catch {
      setError('Impossible de vous connecter. Vérifiez votre connexion puis réessayez.');
    } finally {
      // Generate a fresh verifier/state for the next authorization attempt.
      setAttempt(value => value + 1);
      locked.current = false;
      setBusy(false);
    }
  }

  async function signOut() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      await writeRefreshToken(null);
      const token = current.current?.tokens.refresh_token;
      current.current = null;
      setSession(null);
      if (token) await revokeRefreshToken(config, token);
    } catch {
      setError('La déconnexion n’a pas pu être terminée. Veuillez réessayer.');
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function getAccessToken(): Promise<string | null> {
    if (refreshInFlight.current) return refreshInFlight.current;
    const saved = current.current;
    if (!saved) return null;
    if (saved.expiresAt > Date.now() + 30000) return saved.tokens.access_token;
    const refreshToken = saved.tokens.refresh_token;
    if (!refreshToken) return null;
    refreshInFlight.current = (async () => {
      try {
        const tokens = await refreshTokens(config, refreshToken);
        if (current.current !== saved) return null;
        await accept({ ...tokens, refresh_token: tokens.refresh_token || refreshToken });
        return tokens.access_token;
      } catch (cause) {
        if (cause instanceof KeycloakError && cause.code === 'invalid_grant' && current.current === saved) {
          await writeRefreshToken(null);
          current.current = null;
          setSession(null);
          setError('Votre session a expiré. Veuillez vous reconnecter.');
        }
        throw cause;
      } finally { refreshInFlight.current = null; }
    })();
    return refreshInFlight.current;
  }

  return <AuthContext.Provider value={{ user: session?.user || null, busy, ready: !!request, error, signIn, signOut, getAccessToken }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth requires AuthProvider');
  return auth;
}


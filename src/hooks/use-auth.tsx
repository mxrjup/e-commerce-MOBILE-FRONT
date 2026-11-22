import { CodeChallengeMethod, makeRedirectUri, Prompt, ResponseType, useAuthRequest } from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';



import {
  buildAuthorizationUrl,
  endpoint,
  exchangeCode,
  fetchUser,
  KeycloakError,
  refreshTokens,
  revokeRefreshToken,
  type AuthMode,
  type AuthProviderId,
  type Tokens,
  type User,
} from '@/services/keycloak';
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

const hostUri = Constants.expoConfig?.hostUri;
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const redirectUri =
  isExpoGo && hostUri
    ? `exp://${hostUri}/--/auth-callback`
    : makeRedirectUri({ scheme: 'ecommerce', path: 'auth-callback' });

type Session = { tokens: Tokens; expiresAt: number; user: User };
type AuthActionOptions = { mode?: AuthMode; provider?: AuthProviderId };

type AuthContextValue = {
  user: User | null;
  busy: boolean;
  activeProvider: AuthProviderId | null;
  ready: boolean;
  error: string;
  clearError: () => void;
  signIn: (options?: AuthActionOptions) => Promise<void>;
  register: (provider?: AuthProviderId) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function formatAuthFailure(mode: AuthMode, provider: AuthProviderId): string {
  const action = mode === 'register' ? 'L’inscription' : 'La connexion';
  if (provider === 'google') return `${action} avec Google a échoué. Vérifiez que le fournisseur est activé puis réessayez.`;
  if (provider === 'apple') return `${action} avec Apple a échoué. Vérifiez que le fournisseur est activé puis réessayez.`;
  return `${action} a échoué. Veuillez réessayer.`;
}

function extractAuthCode(callbackUrl: string): string | null {
  try {
    return new URL(callbackUrl).searchParams.get('code');
  } catch {
    const match = callbackUrl.match(/[?&]code=([^&#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const current = useRef<Session | null>(null);
  const [busy, setBusy] = useState(true);
  const [activeProvider, setActiveProvider] = useState<AuthProviderId | null>(null);
  const locked = useRef(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  const [request] = useAuthRequest(
    {
      clientId: config.clientId,
      redirectUri,
      responseType: ResponseType.Code,
      scopes: ['openid', 'profile', 'email'],
      usePKCE: true,
      codeChallengeMethod: CodeChallengeMethod.S256,
      prompt: Prompt.Login,
      extraParams: { ui_locales: 'fr', app_attempt: String(attempt) },
    },
    discovery
  );

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
        if (active) {
          locked.current = false;
          setBusy(false);
        }
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);

  async function authenticate(options: AuthActionOptions = {}) {
    const mode: AuthMode = options.mode ?? 'login';
    const provider: AuthProviderId = options.provider ?? 'email';
    if (locked.current || !request) return;

    locked.current = true;
    setBusy(true);
    setActiveProvider(provider);
    setError('');

    try {
      const baseAuthUrl = request.url ?? (await request.makeAuthUrlAsync(discovery));
      const targetUrl = buildAuthorizationUrl(baseAuthUrl, { mode, provider });
      const result = await WebBrowser.openAuthSessionAsync(targetUrl, redirectUri);

      if (result.type === 'success' && result.url && request.codeVerifier) {
        const code = extractAuthCode(result.url);
        if (code) {
          await accept(await exchangeCode(config, code, request.codeVerifier, redirectUri));
        } else {
          setError(formatAuthFailure(mode, provider));
        }
      } else if (result.type !== 'cancel' && result.type !== 'dismiss') {
        setError(formatAuthFailure(mode, provider));
      }
    } catch {
      setError('Impossible de joindre le service d’authentification. Vérifiez votre connexion puis réessayez.');
    } finally {
      setAttempt(value => value + 1);
      locked.current = false;
      setActiveProvider(null);
      setBusy(false);
    }
  }

  async function signIn(options: AuthActionOptions = {}) {
    return authenticate({ mode: options.mode ?? 'login', provider: options.provider ?? 'email' });
  }

  async function register(provider: AuthProviderId = 'email') {
    return authenticate({ mode: 'register', provider });
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
      } finally {
        refreshInFlight.current = null;
      }
    })();
    return refreshInFlight.current;
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        busy,
        activeProvider,
        ready: !!request,
        error,
        clearError: () => setError(''),
        signIn,
        register,
        signOut,
        getAccessToken,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth requires AuthProvider');
  return auth;
}
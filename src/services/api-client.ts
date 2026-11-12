type ApiErrorCode = 'http_error' | 'network_error' | 'auth_required' | 'auth_refresh_failed' | 'invalid_response';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly data: unknown;

  constructor(code: ApiErrorCode, message: string, status = 0, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  auth?: boolean;
};

type Options = Omit<RequestOptions, 'method' | 'body'>;

export function getApiErrorMessage(cause: unknown, timedOut = false): string {
  if (timedOut || cause instanceof Error && cause.name === 'TimeoutError') {
    return 'Le serveur met trop de temps à répondre.';
  }
  if (cause instanceof ApiError) {
    if (cause.code === 'network_error') {
      return 'Impossible de joindre le serveur. Vérifiez votre connexion Internet.';
    }
    if (cause.code === 'invalid_response') {
      return 'Les données reçues du serveur sont invalides.';
    }
    if (cause.code === 'http_error') {
      return cause.status >= 500
        ? 'Le service est temporairement indisponible.'
        : 'Le serveur n’a pas pu traiter la demande.';
    }
  }
  return 'Impossible de charger les données pour le moment.';
}

export function createApiClient(baseUrl: string, getAccessToken: () => Promise<string | null>) {
  const base = new URL(baseUrl);

  async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, base);
    if (!path.startsWith('/') || path.startsWith('//') || url.origin !== base.origin) {
      throw new Error('Utilisez un chemin API local, par exemple /api/cart.');
    }

    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    // Authentication is owned by this client, never by individual callers.
    headers.delete('Authorization');
    if (options.auth !== false) {
      let token: string | null;
      try {
        token = await getAccessToken();
      } catch {
        throw new ApiError('auth_refresh_failed', 'Impossible de renouveler votre session.', 401);
      }
      if (!token) throw new ApiError('auth_required', 'Veuillez vous connecter.', 401);
      headers.set('Authorization', `Bearer ${token}`);
    }

    const body = options.body === undefined ? undefined : JSON.stringify(options.body);
    if (body !== undefined) headers.set('Content-Type', 'application/json');

    let response: Response;
    let text: string;
    try {
      response = await fetch(url.toString(), {
        method: options.method ?? 'GET',
        headers,
        body,
        signal: options.signal ?? AbortSignal.timeout(15000),
        credentials: 'omit',
        redirect: 'error',
      });
      text = await response.text();
    } catch (cause) {
      if (cause instanceof Error && (cause.name === 'AbortError' || cause.name === 'TimeoutError')) throw cause;
      throw new ApiError('network_error', 'Impossible de joindre le serveur. Vérifiez votre connexion.');
    }

    let data: unknown = text || undefined;
    const contentType = response.headers.get('Content-Type') ?? '';
    if (text && (contentType.includes('application/json') || contentType.includes('+json'))) {
      try {
        data = JSON.parse(text);
      } catch {
        if (response.ok) throw new ApiError('invalid_response', 'La réponse du serveur est invalide.', response.status);
      }
    }
    if (!response.ok) {
      throw new ApiError('http_error', `La requête a échoué (${response.status}).`, response.status, data);
    }
    return data as T;
  }

  return {
    request,
    get: <T = unknown>(path: string, options?: Options) => request<T>(path, { ...options, method: 'GET' }),
    post: <T = unknown>(path: string, body?: unknown, options?: Options) => request<T>(path, { ...options, method: 'POST', body }),
    put: <T = unknown>(path: string, body?: unknown, options?: Options) => request<T>(path, { ...options, method: 'PUT', body }),
    patch: <T = unknown>(path: string, body?: unknown, options?: Options) => request<T>(path, { ...options, method: 'PATCH', body }),
    delete: <T = unknown>(path: string, options?: Options) => request<T>(path, { ...options, method: 'DELETE' }),
  };
}

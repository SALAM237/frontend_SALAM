const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

let _refreshing: Promise<string | null> | null = null;
let _refreshFailures = 0;
let _nextPeriodicRefreshAt = 0;
let _sessionUncertain = false;

const BASE_REFRESH_BACKOFF_MS = 60_000;
const MAX_REFRESH_BACKOFF_MS = 5 * 60 * 1000;
const PROACTIVE_REFRESH_BEFORE_MS = 2 * 60 * 1000;

type RefreshAuthOptions = {
  reason?: 'periodic' | 'api_401';
  logoutOnFailure?: boolean;
};

class RefreshError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function canAttemptRefresh(path: string): boolean {
  return !path.includes('/auth/');
}

function jwtExpiresInMs(token?: string | null): number | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    if (typeof decoded.exp !== 'number') return null;
    return decoded.exp * 1000 - Date.now();
  } catch {
    return null;
  }
}

async function currentAccessToken(candidate?: string | null): Promise<string | null> {
  if (typeof window === 'undefined') return candidate ?? null;
  const { useAuthStore } = await import('@/store/auth.store');
  return candidate || useAuthStore.getState().accessToken;
}

async function clearLocalSessionAndRedirect() {
  if (typeof window === 'undefined') return;

  await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
  const { useAuthStore } = await import('@/store/auth.store');
  useAuthStore.getState().clearAuth();

  const path = window.location.pathname;
  window.location.href = path.startsWith('/admin') || path.startsWith('/bureau')
    ? '/bureau-executif/connexion'
    : '/auth/login';
}

export async function refreshAuthSession(options: RefreshAuthOptions = {}): Promise<string | null> {
  const { reason = 'periodic', logoutOnFailure = true } = options;
  if (reason === 'periodic' && Date.now() < _nextPeriodicRefreshAt) return null;
  if (_refreshing) return _refreshing;

  _refreshing = (async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      if (res.status === 401 || res.status === 403) throw new RefreshError('refresh_expired', res.status);
      if (!res.ok) throw new RefreshError('refresh_temporarily_unavailable', res.status);

      const json = await res.json();
      const newToken: string = json.data.accessToken;

      if (typeof window !== 'undefined') {
        const sessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ accessToken: newToken }),
        });
        if (sessionRes.status === 401 || sessionRes.status === 403) {
          throw new RefreshError('refresh_identity_expired', sessionRes.status);
        }
        if (!sessionRes.ok) throw new RefreshError('refresh_identity_temporarily_unavailable', sessionRes.status);
        const sessionJson = await sessionRes.json();

        const { useAuthStore } = await import('@/store/auth.store');
        if (sessionJson.user) {
          useAuthStore.getState().restoreAuth(sessionJson.user, newToken);
        } else {
          useAuthStore.getState().setToken(newToken);
        }
      }

      _refreshFailures = 0;
      _nextPeriodicRefreshAt = 0;
      _sessionUncertain = false;
      return newToken;
    } catch (error) {
      const status = error instanceof RefreshError ? error.status : undefined;
      const isAuthRefusal = status === 401 || status === 403;

      if (reason === 'periodic') {
        _refreshFailures += 1;
        const backoff = Math.min(
          BASE_REFRESH_BACKOFF_MS * 2 ** Math.max(0, _refreshFailures - 1),
          MAX_REFRESH_BACKOFF_MS,
        );
        _nextPeriodicRefreshAt = Date.now() + backoff;

        if (isAuthRefusal) _sessionUncertain = true;
        return null;
      }

      if (logoutOnFailure && isAuthRefusal) {
        await clearLocalSessionAndRedirect();
      }
      return null;
    } finally {
      _refreshing = null;
    }
  })();

  return _refreshing;
}

export async function apiClient<T = unknown>(
  path: string,
  init?: RequestInit & { token?: string; _retry?: boolean },
): Promise<ApiResponse<T>> {
  const { token, _retry, ...rest } = init ?? {};
  let requestToken = await currentAccessToken(token);

  if (!_retry && requestToken && canAttemptRefresh(path)) {
    const expiresIn = jwtExpiresInMs(requestToken);
    if (expiresIn !== null && expiresIn <= PROACTIVE_REFRESH_BEFORE_MS) {
      const refreshed = await refreshAuthSession({ reason: 'periodic', logoutOnFailure: false });
      if (refreshed) requestToken = refreshed;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...((rest.headers as Record<string, string>) ?? {}),
  };
  if (requestToken) headers.Authorization = `Bearer ${requestToken}`;

  const res = await fetch(`${API}${path}`, {
    ...rest,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && !_retry && canAttemptRefresh(path)) {
    const newToken = await refreshAuthSession({ reason: 'api_401', logoutOnFailure: true });
    if (newToken) {
      return apiClient<T>(path, { ...init, token: newToken, _retry: true });
    }
    throw new Error('Session expiree - veuillez vous reconnecter');
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Erreur serveur (${res.status})`);
  }
  if (!res.ok) throw new Error((json as any)?.message ?? 'Erreur serveur');
  return json;
}

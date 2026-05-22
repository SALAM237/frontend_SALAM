const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// Serialise les tentatives de refresh concurrentes (plusieurs hooks en 401 en même temps)
let _refreshing: Promise<string | null> | null = null;
let _refreshFailures = 0;
let _nextPeriodicRefreshAt = 0;
let _sessionUncertain = false;

const MAX_PERIODIC_AUTH_FAILURES = 5;
const BASE_REFRESH_BACKOFF_MS = 60_000;
const MAX_REFRESH_BACKOFF_MS = 5 * 60 * 1000;

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
        // Renouvelle le cookie httpOnly salam_access
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ accessToken: newToken }),
        }).catch(() => {});

        // Met à jour le store Zustand (sans toucher salam_space)
        const meRes = await fetch(`${API}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
          credentials: 'include',
        });
        if (meRes.status === 401 || meRes.status === 403) throw new RefreshError('refresh_identity_expired', meRes.status);
        if (!meRes.ok) throw new RefreshError('refresh_identity_temporarily_unavailable', meRes.status);
        const meJson = await meRes.json();

        const { useAuthStore } = await import('@/store/auth.store');
        useAuthStore.getState().restoreAuth(meJson.data, newToken);
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

        // Un 401 périodique (Railway redémarre, réseau instable, dev local→prod) ne déconnecte
        // pas l'utilisateur. On marque la session incertaine : le prochain appel API qui
        // retourne 401 tentera un refresh et déconnectera si ce refresh échoue aussi.
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(rest.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    ...rest,
    credentials: 'include',
    headers,
  });

  // 401 → refresh silencieux + rejeu (une seule fois, jamais sur /auth/refresh lui-même)
  if (res.status === 401 && !_retry && canAttemptRefresh(path)) {
    const newToken = await refreshAuthSession({ reason: 'api_401', logoutOnFailure: true });
    if (newToken) {
      return apiClient<T>(path, { ...init, token: newToken, _retry: true });
    }
    throw new Error('Session expirée — veuillez vous reconnecter');
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

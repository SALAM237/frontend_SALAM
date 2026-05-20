const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// Serialise les tentatives de refresh concurrentes (plusieurs hooks en 401 en même temps)
let _refreshing: Promise<string | null> | null = null;

async function silentRefresh(): Promise<string | null> {
  if (_refreshing) return _refreshing;

  _refreshing = (async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('refresh_expired');

      const json = await res.json();
      const newToken: string = json.data.accessToken;

      if (typeof window !== 'undefined') {
        // Renouvelle le cookie httpOnly salam_access
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: newToken }),
        }).catch(() => {});

        // Met à jour le store Zustand (sans toucher salam_space)
        const { useAuthStore } = await import('@/store/auth.store');
        const store = useAuthStore.getState();
        if (store.user) store.restoreAuth(store.user, newToken);
      }

      return newToken;
    } catch {
      // Refresh échoué → logout complet + redirect
      if (typeof window !== 'undefined') {
        await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
        const { useAuthStore } = await import('@/store/auth.store');
        useAuthStore.getState().clearAuth();
        // Redirige vers le bon login selon l'espace courant
        const path = window.location.pathname;
        window.location.href = path.startsWith('/admin') || path.startsWith('/bureau')
          ? '/bureau-executif/connexion'
          : '/auth/login';
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
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    ...rest,
    credentials: 'include',
    headers,
  });

  // 401 → refresh silencieux + rejeu (une seule fois, jamais sur /auth/refresh lui-même)
  if (res.status === 401 && !_retry && !path.includes('/auth/refresh')) {
    const newToken = await silentRefresh();
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

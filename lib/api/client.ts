const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export async function apiClient<T = unknown>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<ApiResponse<T>> {
  const { token, ...rest } = init ?? {};

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

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Erreur serveur (${res.status})`);
  }
  if (!res.ok) throw new Error((json as any)?.message ?? 'Erreur serveur');
  return json;
}

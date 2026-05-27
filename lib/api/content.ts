import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface ArticleDoc {
  _id: string;
  title: string;
  name?: string;
  status: 'draft' | 'pending' | 'published';
  visibility?: 'public' | 'members';
  imageUrl?: string;
  coverImage?: string;
  updatedAt?: string;
  data?: {
    excerpt?: string;
    content?: string;
    category?: string;
    imageUrl?: string;
    coverImage?: string;
    image?: string;
    visibility?: 'public' | 'members';
  };
  createdAt: string;
}

export const ARTICLE_CATEGORIES = [
  { value: 'general',      label: 'Général'         },
  { value: 'evenement',    label: 'Événement'       },
  { value: 'partenariat',  label: 'Partenariat'     },
  { value: 'solidarity',   label: 'Solidarité'      },
  { value: 'insertion',    label: 'Insertion'       },
  { value: 'vie_asso',     label: 'Vie associative' },
] as const;

/* ── Public (no auth) ──────────────────────────────────────── */
export function usePublicArticles() {
  return useQuery({
    queryKey: ['public-content'],
    queryFn:  () => apiClient<ArticleDoc[]>(`/api/v1/public/content?ts=${Date.now()}`, { cache: 'no-store' }),
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function usePublicArticle(id: string) {
  return useQuery({
    queryKey: ['public-article', id],
    queryFn:  () => apiClient<ArticleDoc>(`/api/v1/public/content/${id}?ts=${Date.now()}`, { cache: 'no-store' }),
    enabled:  !!id,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useSubmitMemberArticle() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; excerpt?: string; content: string; category?: string; imageUrl?: string; visibility?: 'public' | 'members' }) =>
      apiClient<ArticleDoc>('/api/v1/member/content', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-content'] });
      qc.invalidateQueries({ queryKey: ['public-content'] });
      toast.success((res as any).message ?? 'Actualite soumise');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Admin ─────────────────────────────────────────────────── */
export function useArticles() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-content'],
    queryFn:  () => apiClient<ArticleDoc[]>('/api/v1/admin/content', { token: token ?? '' }),
    enabled:  !!token,
  });
}

export function useCreateArticle() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; excerpt?: string; content?: string; category?: string; imageUrl?: string; status?: string; visibility?: 'public' | 'members'; data?: { excerpt?: string; content?: string; category?: string; imageUrl?: string; visibility?: 'public' | 'members' } }) =>
      apiClient<ArticleDoc>('/api/v1/admin/content', {
        method: 'POST', body: JSON.stringify(payload), token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-content'] });
      qc.invalidateQueries({ queryKey: ['public-content'] });
      toast.success((res as any).message ?? 'Article créé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateArticle(id: string) {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title?: string; status?: string; visibility?: 'public' | 'members'; data?: { excerpt?: string; content?: string; category?: string; imageUrl?: string; visibility?: 'public' | 'members' } }) =>
      apiClient<ArticleDoc>(`/api/v1/admin/content/${id}`, {
        method: 'PUT', body: JSON.stringify(payload), token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-content'] });
      qc.invalidateQueries({ queryKey: ['public-content'] });
      qc.invalidateQueries({ queryKey: ['public-article', id] });
      toast.success((res as any).message ?? 'Article mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteArticle() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/content/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-content'] });
      qc.invalidateQueries({ queryKey: ['public-content'] });
      toast.success((res as any).message ?? 'Article supprimé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

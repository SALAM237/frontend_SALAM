import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';
import { MEMBER_DASHBOARD_KPIS_QUERY_KEY } from './member-dashboard';

export interface ArticleDoc {
  _id: string;
  title: string;
  name?: string;
  slug?: string;
  status: 'draft' | 'pending' | 'published';
  visibility?: 'public' | 'members';
  imageUrl?: string;
  coverImage?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  updatedAt?: string;
  data?: {
    excerpt?: string;
    content?: string;
    category?: string;
    imageUrl?: string;
    coverImage?: string;
    image?: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    largeUrl?: string;
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

export const ARTICLE_CAT_STYLES: Record<string, { bg: string; text: string }> = {
  general:     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  evenement:   { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  partenariat: { bg: 'bg-purple-100',  text: 'text-purple-700'  },
  solidarity:  { bg: 'bg-rose-100',    text: 'text-rose-700'    },
  insertion:   { bg: 'bg-teal-100',    text: 'text-teal-700'    },
  vie_asso:    { bg: 'bg-amber-100',   text: 'text-amber-700'   },
};

export type ArticleImageUpload = {
  imageUrl: string;
  coverImage: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
};

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

export function articleHref(article: Pick<ArticleDoc, '_id' | 'slug'>) {
  return `/actualites/${article.slug || article._id}`;
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
      qc.invalidateQueries({ queryKey: ['public-article'] });
      qc.invalidateQueries({ queryKey: MEMBER_DASHBOARD_KPIS_QUERY_KEY });
      toast.success((res as any).message ?? 'Actualite soumise');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

function uploadArticleImage(file: File, token: string | null | undefined, scope: 'admin' | 'member') {
  const form = new FormData();
  form.append('image', file);
  return fetch(
    `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')}/api/v1/${scope}/content/image`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token ?? ''}` },
      credentials: 'include',
      body: form,
    },
  ).then(async response => {
    const text = await response.text();
    const json = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(json?.message ?? 'Erreur upload image actualité');
    return json as { success: boolean; message: string; data: ArticleImageUpload };
  });
}

export function useUploadAdminArticleImage() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (file: File) => uploadArticleImage(file, token, 'admin'),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUploadMemberArticleImage() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (file: File) => uploadArticleImage(file, token, 'member'),
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
    mutationFn: (payload: { title: string; excerpt?: string; content?: string; category?: string; imageUrl?: string; thumbnailUrl?: string; mediumUrl?: string; largeUrl?: string; status?: string; visibility?: 'public' | 'members'; data?: { excerpt?: string; content?: string; category?: string; imageUrl?: string; thumbnailUrl?: string; mediumUrl?: string; largeUrl?: string; visibility?: 'public' | 'members' } }) =>
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
    mutationFn: (payload: { title?: string; status?: string; visibility?: 'public' | 'members'; data?: { excerpt?: string; content?: string; category?: string; imageUrl?: string; thumbnailUrl?: string; mediumUrl?: string; largeUrl?: string; visibility?: 'public' | 'members' } }) =>
      apiClient<ArticleDoc>(`/api/v1/admin/content/${id}`, {
        method: 'PUT', body: JSON.stringify(payload), token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-content'] });
      qc.invalidateQueries({ queryKey: ['public-content'] });
      qc.invalidateQueries({ queryKey: ['public-article', id] });
      qc.invalidateQueries({ queryKey: ['public-article'] });
      qc.removeQueries({ queryKey: ['public-article', id] });
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
      qc.invalidateQueries({ queryKey: ['public-article'] });
      toast.success((res as any).message ?? 'Article supprimé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

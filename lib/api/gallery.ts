import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface AlbumImage { url: string; alt?: string; isPublished: boolean }

export interface AlbumDoc {
  _id: string;
  title: string;
  visibility: 'public' | 'members';
  tags: string[];
  images: AlbumImage[];
  createdAt: string;
}

/* ── Public (no auth) ──────────────────────────────────────── */
export function usePublicAlbums() {
  return useQuery({
    queryKey: ['public-gallery'],
    queryFn:  () => apiClient<AlbumDoc[]>('/api/v1/public/gallery'),
    staleTime: 60_000,
  });
}

/* ── Member ────────────────────────────────────────────────── */
export function useMemberAlbums() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['member-gallery'],
    queryFn:  () => apiClient<AlbumDoc[]>('/api/v1/member/gallery', { token: token ?? '' }),
    enabled:  !!token,
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

/* ── Admin ─────────────────────────────────────────────────── */
export function useAlbums() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-gallery'],
    queryFn:  () => apiClient<AlbumDoc[]>('/api/v1/admin/gallery', { token: token ?? '' }),
    enabled:  !!token,
  });
}

export function useCreateAlbum() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; visibility?: string; tags?: string[] }) =>
      apiClient<AlbumDoc>('/api/v1/admin/gallery', {
        method: 'POST', body: JSON.stringify(payload), token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-gallery'] });
      qc.invalidateQueries({ queryKey: ['public-gallery'] });
      qc.invalidateQueries({ queryKey: ['member-gallery'] });
      toast.success((res as any).message ?? 'Album créé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateAlbum(id: string) {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title?: string; visibility?: string; tags?: string[] }) =>
      apiClient<AlbumDoc>(`/api/v1/admin/gallery/${id}`, {
        method: 'PUT', body: JSON.stringify(payload), token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-gallery'] });
      qc.invalidateQueries({ queryKey: ['public-gallery'] });
      qc.invalidateQueries({ queryKey: ['member-gallery'] });
      toast.success((res as any).message ?? 'Album mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteAlbum() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/gallery/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast.success((res as any).message ?? 'Album supprimé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAddImagesToAlbum(albumId: string) {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (files: FileList | File[]) => {
      const form = new FormData();
      Array.from(files).forEach(f => form.append('images', f));
      return fetch(
        `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')}/api/v1/admin/gallery/${albumId}/images`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'include', body: form },
      ).then(async r => {
        const text = await r.text();
        const j = text ? (() => {
          try {
            return JSON.parse(text);
          } catch {
            return { message: r.ok ? undefined : 'Route d\'upload galerie introuvable sur le backend' };
          }
        })() : {};
        if (!r.ok) throw new Error(j?.message ?? 'Erreur upload');
        return j;
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-gallery'] });
      qc.invalidateQueries({ queryKey: ['public-gallery'] });
      qc.invalidateQueries({ queryKey: ['member-gallery'] });
      toast.success('Photos ajoutées');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveImageFromAlbum(albumId: string) {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (idx: number) =>
      apiClient(`/api/v1/admin/gallery/${albumId}/images/${idx}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-gallery'] });
      qc.invalidateQueries({ queryKey: ['public-gallery'] });
      qc.invalidateQueries({ queryKey: ['member-gallery'] });
      toast.success((res as any).message ?? 'Photo supprimée');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

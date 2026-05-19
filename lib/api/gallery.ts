import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface AlbumDoc {
  _id: string;
  title: string;
  visibility: 'public' | 'members';
  tags: string[];
  images: { url: string; alt?: string; isPublished: boolean }[];
  createdAt: string;
}

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
      toast.success((res as any).message ?? 'Album créé');
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

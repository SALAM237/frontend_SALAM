import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export type FeaturedDestination = { type: 'none' | 'internal' | 'external'; href: string };
export interface FeaturedItem {
  _id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrls: string[];
  videoProvider?: 'upload' | 'youtube' | 'external';
  autoplay: boolean;
  visibility: 'public' | 'members';
  status: 'draft' | 'published';
  buttonLabel: string;
  mediaDestination: FeaturedDestination;
  titleDestination: FeaturedDestination;
  textDestination: FeaturedDestination;
  buttonDestination: FeaturedDestination;
  order: number;
}
export type FeaturedPayload = Omit<FeaturedItem, '_id'>;
export interface FeaturedTarget { type: 'actualite' | 'opportunite' | 'activite'; id: string; label: string; href: string }

export function usePublicFeatured() {
  return useQuery({ queryKey: ['public-featured'], queryFn: () => apiClient<FeaturedItem[]>('/api/v1/public/featured'), staleTime: 60_000 });
}
export function useMemberFeatured() {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({
    queryKey: ['member-featured'],
    queryFn: () => apiClient<FeaturedItem[]>('/api/v1/member/featured', { token: token ?? '' }),
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}
export function useAdminFeatured() {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({ queryKey: ['admin-featured'], queryFn: () => apiClient<FeaturedItem[]>('/api/v1/admin/featured', { token: token ?? '' }), enabled: Boolean(token) });
}
export function useFeaturedTargets() {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({ queryKey: ['featured-targets'], queryFn: () => apiClient<FeaturedTarget[]>('/api/v1/admin/featured-targets', { token: token ?? '' }), enabled: Boolean(token), staleTime: 30_000 });
}
export function useSaveFeatured() {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: FeaturedPayload }) => apiClient<FeaturedItem>(id ? '/api/v1/admin/featured/' + id : '/api/v1/admin/featured', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload), token: token ?? '' }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured'] });
      queryClient.invalidateQueries({ queryKey: ['public-featured'] });
      toast.success(response.message ?? 'Information a la une enregistree');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
export function useDeleteFeatured() {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient('/api/v1/admin/featured/' + id, { method: 'DELETE', token: token ?? '' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-featured'] }); queryClient.invalidateQueries({ queryKey: ['public-featured'] }); },
    onError: (error: Error) => toast.error(error.message),
  });
}
export function useUploadFeaturedMedia() {
  const token = useAuthStore(state => state.accessToken);
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('media', file);
      return apiClient<{ url: string; mediaType: 'image' | 'video' }>('/api/v1/admin/featured-media', { method: 'POST', body: form, token: token ?? '' });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
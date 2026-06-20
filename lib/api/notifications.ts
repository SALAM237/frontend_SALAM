import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export type PortalSpace = 'admin' | 'member';
export interface PortalNotification {
  _id: string;
  kind: string;
  title: string;
  message: string;
  href: string;
  readAt: string | null;
  occurredAt: string;
}
export interface NotificationFeed { items: PortalNotification[]; unread: number }

export function useNotifications(space: PortalSpace) {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({
    queryKey: ['notifications', space],
    queryFn: () => apiClient<NotificationFeed>('/api/v1/notifications?space=' + space, { token: token ?? '' }),
    enabled: Boolean(token),
    refetchInterval: 15_000,
    staleTime: 5_000,
  });
}
export function useReadNotification(space: PortalSpace) {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient('/api/v1/notifications/' + id + '/read', { method: 'PATCH', token: token ?? '' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', space] }),
  });
}
export function useReadAllNotifications(space: PortalSpace) {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient('/api/v1/notifications/read-all', { method: 'PATCH', body: JSON.stringify({ space }), token: token ?? '' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', space] }),
  });
}
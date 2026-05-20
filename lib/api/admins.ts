import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  gender?: 'homme' | 'femme';
  email: string;
  memberStatus: string;
  bureauCategory?: 'executive' | 'commission' | 'council' | null;
  bureauGroup?: string | null;
  bureauPoste?: string | null;
  bureauNominationYear?: number | null;
  bureauPhoto?: string | null;
  roles: { name: string; slug: string; permissions: string[] }[];
  customPermissions: string[];
  deniedPermissions: string[];
  effectivePermissions: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export function useAdminUsers() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-admins'],
    queryFn: () => apiClient<AdminUser[]>('/api/v1/admin/admins', { token: token ?? '' }),
    enabled: !!token,
  });
}

export function usePromoteAdmin() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleSlug = 'admin' }: { userId: string; roleSlug?: string }) =>
      apiClient('/api/v1/admin/admins', {
        method: 'POST',
        body: JSON.stringify({ userId, roleSlug }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-admins'] });
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      toast.success((res as any).message ?? 'Administrateur ajouté');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRevokeAdmin() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/admins/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-admins'] });
      toast.success((res as any).message ?? 'Administrateur révoqué');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface GroupMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  memberStatus: string;
  bureauPoste?: string | null;
  activitySector?: string;
  avatar?: string;
}

export interface MemberGroup {
  _id: string;
  name: string;
  memberIds: string[];
  members: GroupMember[];
  createdAt: string;
}

export interface BureauMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  bureauPoste?: string;
  bureauCategory?: string;
  avatar?: string;
}

/* ── Queries ─────────────────────────────────────────────── */

export function useAdminGroups() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-groups'],
    queryFn: () => apiClient<MemberGroup[]>('/api/v1/admin/groups', { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useBureauMembers() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['bureau-members'],
    queryFn: () => apiClient<BureauMember[]>('/api/v1/admin/bureau-members', { token: token ?? '' }),
    enabled: !!token,
  });
}

/* ── Mutations ───────────────────────────────────────────── */

export function useCreateGroup() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; memberIds: string[] }) =>
      apiClient<MemberGroup>('/api/v1/admin/groups', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: () => {
      toast.success('Groupe créé avec succès.');
      qc.invalidateQueries({ queryKey: ['admin-groups'] });
    },
    onError: (err: Error) => toast.error(err.message ?? 'Erreur lors de la création du groupe.'),
  });
}

export function useDeleteGroup() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ deleted: boolean }>(`/api/v1/admin/groups/${id}`, {
        method: 'DELETE',
        token: token ?? '',
      }),
    onSuccess: () => {
      toast.success('Groupe supprimé.');
      qc.invalidateQueries({ queryKey: ['admin-groups'] });
    },
    onError: (err: Error) => toast.error(err.message ?? 'Erreur lors de la suppression.'),
  });
}

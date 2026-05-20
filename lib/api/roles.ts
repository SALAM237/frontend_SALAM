import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface BureauMember {
  _id: string;
  firstName: string;
  lastName: string;
  gender?: 'homme' | 'femme';
  bureauCategory?: 'executive' | 'commission' | 'council' | null;
  bureauGroup?: string | null;
  bureauPoste: string;
  bureauNominationYear?: number | null;
  bureauPhoto?: string | null;
  image?: string | null;
  title?: string;
  nominationYear?: number | null;
  categoryLabel?: string;
  createdAt: string;
}

export interface RoleDoc {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

export interface PermissionDoc {
  _id: string;
  key: string;
  label: string;
  module: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PermissionsResponse {
  permissions: PermissionDoc[];
  grouped: Record<string, PermissionDoc[]>;
}

/* ── Roles ─────────────────────────────────────────────────── */

export function useRoles() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => apiClient<RoleDoc[]>('/api/v1/admin/roles', { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useRole(id: string) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-role', id],
    queryFn: () => apiClient<RoleDoc>(`/api/v1/admin/roles/${id}`, { token: token ?? '' }),
    enabled: !!token && !!id,
  });
}

export function useCreateRole() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; slug: string; description?: string; permissions: string[] }) =>
      apiClient<RoleDoc>('/api/v1/admin/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success((res as any).message ?? 'Rôle créé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateRole(id: string) {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; description?: string; permissions?: string[] }) =>
      apiClient<RoleDoc>(`/api/v1/admin/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      qc.invalidateQueries({ queryKey: ['admin-role', id] });
      toast.success((res as any).message ?? 'Rôle mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteRole() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/roles/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success((res as any).message ?? 'Rôle supprimé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Permissions ───────────────────────────────────────────── */

export function usePermissionsList() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => apiClient<PermissionsResponse>('/api/v1/admin/permissions', { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useCreatePermission() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (payload: { key: string; label: string; module: string; riskLevel?: string; description?: string }) =>
      apiClient('/api/v1/admin/permissions', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-permissions'] });
      toast.success((res as any).message ?? 'Permission créée');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── User role / poste / custom-perms ──────────────────────── */

export function useAssignUserRoles() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      apiClient(`/api/v1/admin/users/${userId}/roles`, {
        method: 'PATCH',
        body: JSON.stringify({ roleIds }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-admins'] });
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      toast.success((res as any).message ?? 'Rôles mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAssignPoste() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, poste, nominationYear, category, group }: {
      userId: string;
      poste: string | null;
      nominationYear?: number | null;
      category?: 'executive' | 'commission' | 'council' | null;
      group?: string | null;
    }) =>
      apiClient(`/api/v1/admin/users/${userId}/poste`, {
        method: 'PATCH',
        body: JSON.stringify({ poste, nominationYear, category, group }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-admins'] });
      qc.invalidateQueries({ queryKey: ['public-bureau'] });
      qc.invalidateQueries({ queryKey: ['member-bureau'] });
      toast.success((res as any).message ?? 'Poste mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUploadBureauPhoto() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(`${API}/api/v1/admin/users/${userId}/bureau-photo`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: fd,
      });
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        throw new Error(res.status === 404
          ? "Route d'upload photo introuvable sur le backend"
          : `Réponse backend invalide (${res.status})`);
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Erreur upload');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-admins'] });
      qc.invalidateQueries({ queryKey: ['public-bureau'] });
      qc.invalidateQueries({ queryKey: ['member-bureau'] });
      toast.success('Photo du bureau mise à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function usePublicBureau() {
  return useQuery({
    queryKey: ['public-bureau'],
    queryFn: async (): Promise<{ data: BureauMember[] }> => {
      try {
        const res = await fetch(`${API}/api/v1/public/bureau`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return { data: [] };
        const json = await res.json();
        return { data: json?.data ?? [] };
      } catch {
        return { data: [] };
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function useMemberBureau() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['member-bureau'],
    queryFn: () => apiClient<BureauMember[]>('/api/v1/member/bureau', { token: token ?? '' }),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useUpdateCustomPerms() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, customPermissions, deniedPermissions }: {
      userId: string;
      customPermissions: string[];
      deniedPermissions: string[];
    }) =>
      apiClient(`/api/v1/admin/users/${userId}/custom-perms`, {
        method: 'PATCH',
        body: JSON.stringify({ customPermissions, deniedPermissions }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-admins'] });
      toast.success((res as any).message ?? 'Permissions mises à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

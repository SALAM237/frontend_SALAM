import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

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
    mutationFn: ({ userId, poste }: { userId: string; poste: string | null }) =>
      apiClient(`/api/v1/admin/users/${userId}/poste`, {
        method: 'PATCH',
        body: JSON.stringify({ poste }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-admins'] });
      toast.success((res as any).message ?? 'Poste mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
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

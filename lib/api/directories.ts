'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface DirectoryMemberInfo {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bureauPhoto?: string;
  gender?: 'homme' | 'femme';
  activitySector?: string;
}

export interface ContactDirectory {
  _id: string;
  name: string;
  memberIds: DirectoryMemberInfo[];
  createdAt: string;
  updatedAt: string;
}

const DIRS_KEY = ['member-directories'] as const;

/* ── GET /member/directories ─────────────────────────────── */
export function useMyDirectories() {
  const isLoggedIn = useAuthStore(s => !!s.accessToken);
  return useQuery({
    queryKey: DIRS_KEY,
    // apiClient.currentAccessToken() lit getState() directement → toujours frais
    queryFn: () => apiClient<{ directories: ContactDirectory[] }>('/api/v1/member/directories'),
    enabled: isLoggedIn,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/* ── POST /member/directories ────────────────────────────── */
export function useCreateDirectory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiClient<{ directory: ContactDirectory }>('/api/v1/member/directories', {
        method: 'POST', body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DIRS_KEY });
    },
    onError: (err: any) => toast.error(err?.message ?? 'Erreur création'),
  });
}

/* ── DELETE /member/directories/:id ──────────────────────── */
export function useDeleteDirectory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient('/api/v1/member/directories/' + id, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DIRS_KEY });
      toast.success('Répertoire supprimé');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Erreur suppression'),
  });
}

/* ── POST /member/directories/:id/members/:memberId ─────── */
export function useAddToDirectory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ directoryId, memberId }: { directoryId: string; memberId: string }) =>
      apiClient(`/api/v1/member/directories/${directoryId}/members/${memberId}`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DIRS_KEY });
    },
    onError: (err: any) => toast.error(err?.message ?? 'Erreur ajout'),
  });
}

/* ── DELETE /member/directories/:id/members/:memberId ────── */
export function useRemoveFromDirectory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ directoryId, memberId }: { directoryId: string; memberId: string }) =>
      apiClient(`/api/v1/member/directories/${directoryId}/members/${memberId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DIRS_KEY });
      toast.success('Contact retiré');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Erreur retrait'),
  });
}

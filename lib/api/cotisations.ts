import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';
import type { AuditLogDoc } from './audit-logs';

export type CotisationStatus = 'unpaid' | 'paid' | 'exempt';

export interface CotisationDoc {
  _id: string;
  userId: string;
  year: number;
  amount: number;
  status: CotisationStatus;
  paidAt?: string;
  reference?: string;
  notes?: string;
}

export interface AdminCotisationRow {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender?: 'homme' | 'femme';
    avatar?: string | null;
    bureauPhoto?: string | null;
  };
  cotisation: {
    _id?: string;
    status: CotisationStatus;
    year: number;
    amount: number;
    paidAt?: string;
    reference?: string;
    notes?: string;
  };
}

/* ── Admin ──────────────────────────────────────────────── */

export function useAdminCotisations(year: number) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-cotisations', year],
    queryFn: () =>
      apiClient<AdminCotisationRow[]>(
        `/api/v1/admin/cotisations??year=${year}`,
        { token: token ?? '' },
      ),
    enabled: !!token,
  });
}

export function useUpdateCotisationStatus() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      userId: string;
      year: number;
      status: CotisationStatus;
      paidAt?: string;
      reference?: string;
      notes?: string;
    }) =>
      apiClient(`/api/v1/admin/cotisations/${vars.userId}`, {
        method: 'PUT',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-cotisations', vars.year] });
      qc.invalidateQueries({ queryKey: ['cotisation-logs'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      qc.invalidateQueries({ queryKey: ['member-invoices'] });
      toast.success((res as any).message ?? 'Statut mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteCotisation() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, year }: { userId: string; year: number }) =>
      apiClient(`/api/v1/admin/cotisations/${userId}??year=${year}`, {
        method: 'DELETE',
        token: token ?? '',
      }),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-cotisations', vars.year] });
      qc.invalidateQueries({ queryKey: ['cotisation-logs'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      qc.invalidateQueries({ queryKey: ['member-invoices'] });
      toast.success((res as any).message ?? 'Frais supprimé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSendReminders() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (vars: { year: number; dueDate?: string; userIds?: string[] }) =>
      apiClient<{ sent: number }>('/api/v1/admin/cotisations/remind', {
        method: 'POST',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
    onSuccess: res => toast.success(`${(res.data as any)?.sent ?? 0} relance(s) envoyée(s)`),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCotisationLogs() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['cotisation-logs'],
    queryFn: () =>
      apiClient<AuditLogDoc[]>('/api/v1/admin/cotisations/logs', {
        token: token ?? '',
      }),
    enabled: !!token,
  });
}

/* ── Member ─────────────────────────────────────────────── */

export function useMemberCotisations() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['member-cotisations'],
    queryFn: () =>
      apiClient<CotisationDoc[]>('/api/v1/member/cotisations', {
        token: token ?? '',
      }),
    enabled: !!token,
  });
}

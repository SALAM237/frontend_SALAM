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
    promotionYear?: number;
    memberNumber?: string;
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
        `/api/v1/admin/cotisations?year=${year}`,
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
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['member-cotisations'] });
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
      apiClient(`/api/v1/admin/cotisations/${userId}?year=${year}`, {
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

type RelanceResult = { sent: number; failed: { name: string; email: string; reason: string; code?: string }[]; stoppedEarly?: boolean };

function buildFailedDescription(failed: RelanceResult['failed'], stoppedEarly?: boolean): string {
  const cause  = failed[0]?.reason ?? 'Erreur inconnue';
  const emails = failed.slice(0, 5).map(f => f.email).join(', ');
  const more   = failed.length > 5 ? ` +${failed.length - 5} autre(s)` : '';
  const stop   = stoppedEarly ? ' — envoi interrompu (limite atteinte)' : '';
  return `${cause} — Adresses : ${emails}${more}${stop} — Voir « Gestion Erreurs » pour les détails`;
}

function toastRelanceResult(res: { data?: RelanceResult | null }) {
  const sent        = res.data?.sent        ?? 0;
  const failed      = res.data?.failed      ?? [];
  const stoppedEarly = res.data?.stoppedEarly;
  if (failed.length === 0) {
    toast.success(`${sent} relance(s) envoyée(s) avec succès`);
  } else if (sent === 0) {
    toast.error(`Aucun email n'a pu être envoyé (${failed.length} échec(s))`, {
      description: buildFailedDescription(failed, stoppedEarly),
    });
  } else {
    toast.warning(`${sent} envoyé(s) — ${failed.length} échec(s)`, {
      description: buildFailedDescription(failed, stoppedEarly),
    });
  }
}

export function useSendReminders() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (vars: { year: number; dueDate?: string; userIds?: string[] }) =>
      apiClient<RelanceResult>('/api/v1/admin/cotisations/remind', {
        method: 'POST',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
    onSuccess: res => toastRelanceResult(res),
    onError: (err: Error) => toast.error(`Envoi impossible : ${err.message}`),
  });
}

export function useResendCotisationReceipt() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, year }: { userId: string; year: number }) =>
      apiClient(`/api/v1/admin/cotisations/${userId}/resend-receipt`, {
        method: 'POST',
        body: JSON.stringify({ year }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['cotisation-logs'] });
      toast.success((res as any).message ?? 'Recu renvoye');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSendUnpaidInvoiceRelance() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (vars: { userIds?: string[] }) =>
      apiClient<RelanceResult>('/api/v1/admin/invoices/relance', {
        method: 'POST',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
    onSuccess: res => toastRelanceResult(res),
    onError: (err: Error) => toast.error(`Envoi impossible : ${err.message}`),
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

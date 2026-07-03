import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';
import type { AuditLogDoc } from './audit-logs';

export type CotisationAnnuelleStatus = 'unpaid' | 'paid' | 'exempt';

export interface CotisationAnnuelleDoc {
  _id: string;
  userId: string;
  year: number;
  amount: number;
  status: CotisationAnnuelleStatus;
  paidAt?: string;
  reference?: string;
  notes?: string;
}

export interface AdminCotisationAnnuelleRow {
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
    status: CotisationAnnuelleStatus;
    year: number;
    amount: number;
    paidAt?: string;
    reference?: string;
    notes?: string;
  };
}

/* ── Admin ──────────────────────────────────────────────── */

export function useAdminCotisationsAnnuelles(year: number) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-cotisations-annuelles', year],
    queryFn: () =>
      apiClient<AdminCotisationAnnuelleRow[]>(
        `/api/v1/admin/cotisations-annuelles?year=${year}`,
        { token: token ?? '' },
      ),
    enabled: !!token,
  });
}

export function useUpdateCotisationAnnuelleStatus() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      userId: string;
      year: number;
      status: CotisationAnnuelleStatus;
      paidAt?: string;
      reference?: string;
      notes?: string;
    }) =>
      apiClient(`/api/v1/admin/cotisations-annuelles/${vars.userId}`, {
        method: 'PUT',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-cotisations-annuelles', vars.year] });
      qc.invalidateQueries({ queryKey: ['cotisation-annuelle-logs'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      toast.success((res as any).message ?? 'Statut mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteCotisationAnnuelle() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, year }: { userId: string; year: number }) =>
      apiClient(`/api/v1/admin/cotisations-annuelles/${userId}?year=${year}`, {
        method: 'DELETE',
        token: token ?? '',
      }),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-cotisations-annuelles', vars.year] });
      qc.invalidateQueries({ queryKey: ['cotisation-annuelle-logs'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      toast.success((res as any).message ?? 'Cotisation supprimée');
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
  const sent         = res.data?.sent         ?? 0;
  const failed       = res.data?.failed       ?? [];
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

export function useSendCotisationAnnuelleReminders() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (vars: { year: number; dueDate?: string; userIds?: string[] }) =>
      apiClient<RelanceResult>('/api/v1/admin/cotisations-annuelles/remind', {
        method: 'POST',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
    onSuccess: res => toastRelanceResult(res),
    onError: (err: Error) => toast.error(`Envoi impossible : ${err.message}`),
  });
}

export function useResendCotisationAnnuelleReceipt() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, year }: { userId: string; year: number }) =>
      apiClient(`/api/v1/admin/cotisations-annuelles/${userId}/resend-receipt`, {
        method: 'POST',
        body: JSON.stringify({ year }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['cotisation-annuelle-logs'] });
      toast.success((res as any).message ?? 'Reçu renvoyé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCotisationAnnuelleLogs() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['cotisation-annuelle-logs'],
    queryFn: () =>
      apiClient<AuditLogDoc[]>('/api/v1/admin/cotisations-annuelles/logs', {
        token: token ?? '',
      }),
    enabled: !!token,
  });
}

/* ── Member ─────────────────────────────────────────────── */

export function useMemberCotisationsAnnuelles() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['member-cotisations-annuelles'],
    queryFn: () =>
      apiClient<CotisationAnnuelleDoc[]>('/api/v1/member/cotisations-annuelles', {
        token: token ?? '',
      }),
    enabled: !!token,
  });
}

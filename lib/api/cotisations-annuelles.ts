import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient, type ApiResponse } from './client';
import { useAuthStore } from '@/store/auth.store';
import type { AuditLogDoc } from './audit-logs';

export type CotisationAnnuelleStatus = 'unpaid' | 'partiel' | 'paid' | 'exempt';
export type PaymentMethod = 'om' | 'especes' | 'mobile_money' | 'virement' | 'cb' | 'autre';
export type SettledByType = 'member' | 'non_member';

export interface Tranche {
  amount: number;
  status: 'unpaid' | 'paid' | 'exempt';
  paidAt?: string | null;
  reference?: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentMethodOther?: string | null;
  settledByType?: SettledByType | null;
  settledByUserId?: string | null;
  settledByName?: string | null;
}

export interface CotisationAnnuelleDoc {
  _id: string;
  userId: string;
  year: number;
  amount: number;
  status: CotisationAnnuelleStatus;
  paidAt?: string;
  reference?: string;
  notes?: string;
  tranches?: Tranche[];
  totalPaid?: number;
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
    tranches?: Tranche[];
    totalPaid?: number;
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
      justification?: File | null;
    }) => {
      const body = vars.justification ? new FormData() : null;
      if (body) {
        body.append('year', String(vars.year));
        body.append('status', vars.status);
        if (vars.paidAt) body.append('paidAt', vars.paidAt);
        if (vars.reference) body.append('reference', vars.reference);
        if (vars.notes) body.append('notes', vars.notes);
        if (vars.justification) body.append('justification', vars.justification);
      }
      return apiClient(`/api/v1/admin/cotisations-annuelles/${vars.userId}`, {
        method: 'PUT',
        body: body ?? JSON.stringify(vars),
        token: token ?? '',
      });
    },
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-cotisations-annuelles', vars.year] });
      qc.invalidateQueries({ queryKey: ['cotisation-annuelle-logs'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['member-cotisations-annuelles'] });
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      qc.invalidateQueries({ queryKey: ['member-invoices'] });
      qc.invalidateQueries({ queryKey: ['admin-receipts'] });
      qc.invalidateQueries({ queryKey: ['member-receipts'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-transactions'] });
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
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['member-cotisations-annuelles'] });
      qc.invalidateQueries({ queryKey: ['admin-receipts'] });
      qc.invalidateQueries({ queryKey: ['member-receipts'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-transactions'] });
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

export function useUpdateTranche() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      userId: string;
      year: number;
      trancheIndex: number;
      amount: number;
      paidAt?: string;
      status?: 'unpaid' | 'paid' | 'exempt';
      reference?: string;
      notes?: string;
      justification?: File | null;
      paymentMethod?: PaymentMethod;
      paymentMethodOther?: string;
      settledByType?: SettledByType;
      settledByUserId?: string | null;
      settledByName?: string;
    }) => {
      const body = vars.justification ? new FormData() : null;
      if (body) {
        body.append('year', String(vars.year));
        body.append('amount', String(vars.amount));
        if (vars.paidAt) body.append('paidAt', vars.paidAt);
        if (vars.status) body.append('status', vars.status);
        if (vars.reference) body.append('reference', vars.reference);
        if (vars.notes) body.append('notes', vars.notes);
        if (vars.justification) body.append('justification', vars.justification);
        if (vars.paymentMethod) body.append('paymentMethod', vars.paymentMethod);
        if (vars.paymentMethodOther) body.append('paymentMethodOther', vars.paymentMethodOther);
        if (vars.settledByType) body.append('settledByType', vars.settledByType);
        if (vars.settledByUserId) body.append('settledByUserId', vars.settledByUserId);
        if (vars.settledByName) body.append('settledByName', vars.settledByName);
      }
      return apiClient<CotisationAnnuelleDoc & { invoiceWarning?: string | null }>(
        `/api/v1/admin/cotisations-annuelles/${vars.userId}/tranche/${vars.trancheIndex}`,
        {
          method: 'PUT',
          body: body ?? JSON.stringify({
            year: vars.year, amount: vars.amount, paidAt: vars.paidAt, status: vars.status, reference: vars.reference, notes: vars.notes,
            paymentMethod: vars.paymentMethod, paymentMethodOther: vars.paymentMethodOther,
            settledByType: vars.settledByType, settledByUserId: vars.settledByUserId, settledByName: vars.settledByName,
          }),
          token: token ?? '',
        },
      );
    },
    onSuccess: (res, vars) => {
      /* Patch synchrone du cache AVANT l'invalidation : invalidateQueries ne fait que
         planifier un refetch asynchrone, ce qui laisse une fenêtre (le temps du
         round-trip réseau) où tranche/allTranches affichent encore l'ancienne donnée
         (ex. montant à 0) alors que le serveur a déjà persisté la nouvelle valeur.
         setQueryData applique immédiatement la réponse serveur (autoritative), donc
         TrancheCell (montant/date affichés) et DetteCell (solde de la dette) reflètent
         la bonne valeur dès ce même rendu, sans attendre le refetch. */
      const updatedDoc = (res as any)?.data as CotisationAnnuelleDoc | undefined;
      if (updatedDoc) {
        /* Le cache stocke l'ApiResponse complète ({success,message,data:[...]}),
           pas le tableau brut — il faut patcher `.data`, pas `old` lui-même. */
        qc.setQueryData<ApiResponse<AdminCotisationAnnuelleRow[]>>(['admin-cotisations-annuelles', vars.year], old => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map(row =>
              String(row.user._id) === String(vars.userId)
                ? {
                    ...row,
                    cotisation: {
                      ...row.cotisation,
                      tranches: updatedDoc.tranches,
                      totalPaid: updatedDoc.totalPaid,
                      status: updatedDoc.status,
                      paidAt: updatedDoc.paidAt,
                      reference: updatedDoc.reference,
                    },
                  }
                : row,
            ),
          };
        });
      }
      [
        ['admin-receipts'],
        ['member-receipts'],
        ['admin-treasury-transactions'],
        ['member-treasury-transactions'],
        ['admin-treasury-overview'],
        ['member-treasury-overview'],
      ].forEach(queryKey => qc.removeQueries({ queryKey }));
      qc.invalidateQueries({ queryKey: ['admin-cotisations-annuelles', vars.year] });
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-cotisations-annuelles'] });
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      qc.invalidateQueries({ queryKey: ['member-invoices'] });
      qc.invalidateQueries({ queryKey: ['admin-receipts'] });
      qc.invalidateQueries({ queryKey: ['member-receipts'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['cotisation-annuelle-logs'] });
      /* Le retour visuel (succès/avertissement) est géré au niveau de l'appelant
         via la popup de statut centrée (TrancheCell), pas ici, pour éviter le doublon. */
    },
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

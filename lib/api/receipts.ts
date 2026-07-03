import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export type ReceiptType = 'cotisation' | 'cotisation_annuelle';
export type ReceiptStatus = 'active' | 'cancelled';

export interface ReceiptDoc {
  _id: string;
  receiptNumber: string;
  type: ReceiptType;
  userId: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    memberNumber?: string;
    avatar?: string;
    bureauPhoto?: string;
    gender?: string;
  };
  year: number;
  trancheIndex?: number | null;
  amount: number;
  paidAt: string;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  reference?: string | null;
  notes?: string | null;
  status: ReceiptStatus;
  modifiedAt?: string | null;
  modifiedBy?: string | { _id: string; firstName?: string; lastName?: string } | null;
  cancelledAt?: string | null;
  cancelledBy?: string | { _id: string; firstName?: string; lastName?: string } | null;
  createdAt: string;
}

/* ── Admin ──────────────────────────────────────────────── */

export function useAdminReceipts(params?: { type?: ReceiptType; status?: ReceiptStatus; year?: number }) {
  const token = useAuthStore(s => s.accessToken);
  const qs = new URLSearchParams();
  if (params?.type) qs.set('type', params.type);
  if (params?.status) qs.set('status', params.status);
  if (params?.year) qs.set('year', String(params.year));
  return useQuery({
    queryKey: ['admin-receipts', params],
    queryFn: () => apiClient<ReceiptDoc[]>(`/api/v1/admin/receipts?${qs}`, { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useUpdateReceipt() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { amount?: number; paidAt?: string; notes?: string; reference?: string } }) =>
      apiClient(`/api/v1/admin/receipts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-receipts'] });
      qc.invalidateQueries({ queryKey: ['member-receipts'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-transactions'] });
      toast.success((res as any).message ?? 'Reçu mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCancelReceipt() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/receipts/${id}/cancel`, { method: 'POST', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-receipts'] });
      qc.invalidateQueries({ queryKey: ['member-receipts'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      toast.success((res as any).message ?? 'Reçu annulé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Member ─────────────────────────────────────────────── */

export function useMemberReceipts(params?: { type?: ReceiptType; year?: number }) {
  const token = useAuthStore(s => s.accessToken);
  const qs = new URLSearchParams();
  if (params?.type) qs.set('type', params.type);
  if (params?.year) qs.set('year', String(params.year));
  return useQuery({
    queryKey: ['member-receipts', params],
    queryFn: () => apiClient<ReceiptDoc[]>(`/api/v1/member/receipts?${qs}`, { token: token ?? '' }),
    enabled: !!token,
  });
}

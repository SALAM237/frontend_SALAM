import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface RecipientDoc {
  userId: string;
  invoiceNumber: string;
  status: 'pending' | 'sent' | 'paid' | 'cancelled';
  sentAt?: string;
  paidAt?: string;
}

export interface InvoiceDoc {
  _id: string;
  invoiceNumber: string;
  type: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  issuedAt: string;
  dueDate: string;
  paymentLink?: string;
  status: 'draft' | 'sent' | 'closed';
  recipients: RecipientDoc[];
  createdBy?: { firstName: string; lastName: string };
}

export interface MemberInvoiceDoc extends InvoiceDoc {
  myRecipient: RecipientDoc;
}

/* ── Admin ──────────────────────────────────────────────── */

export function useAdminInvoices() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-invoices'],
    queryFn: () =>
      apiClient<InvoiceDoc[]>('/api/v1/admin/invoices', { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useCreateInvoice() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      description?: string;
      amount: number;
      dueDate: string;
      paymentLink?: string;
      recipientIds?: string[];
    }) =>
      apiClient<InvoiceDoc>('/api/v1/admin/invoices', {
        method: 'POST',
        body: JSON.stringify(body),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success((res as any).message ?? 'Facture créée');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSendInvoice() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/invoices/${id}/send`, {
        method: 'POST',
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success((res as any).message ?? 'Factures envoyées');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Member ─────────────────────────────────────────────── */

export function useDeleteInvoice() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/invoices/${id}`, {
        method: 'DELETE',
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success((res as any).message ?? 'Facture supprimÃ©e');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMemberInvoices() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['member-invoices'],
    queryFn: () =>
      apiClient<MemberInvoiceDoc[]>('/api/v1/member/invoices', {
        token: token ?? '',
      }),
    enabled: !!token,
  });
}

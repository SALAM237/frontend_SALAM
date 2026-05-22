import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface RecipientDoc {
  recipientType?: 'member' | 'client';
  userId?: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
    residenceCity?: string;
    avatar?: string;
    bureauPhoto?: string;
    gender?: string;
  };
  clientId?: string | InvoiceClientDoc;
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

export interface InvoiceClientDoc {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  registration?: string;
  notes?: string;
  createdAt: string;
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
      type?: 'cotisation' | 'event' | 'other';
      description?: string;
      amount: number;
      dueDate: string;
      paymentLink?: string;
      recipientIds?: string[];
      clientIds?: string[];
    }) =>
      apiClient<InvoiceDoc>('/api/v1/admin/invoices', {
        method: 'POST',
        body: JSON.stringify(body),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      qc.invalidateQueries({ queryKey: ['member-invoices'] });
      qc.invalidateQueries({ queryKey: ['admin-cotisations'] });
      toast.success((res as any).message ?? 'Facture créée');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateInvoice() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: {
      title?: string;
      type?: 'cotisation' | 'event' | 'other';
      description?: string;
      amount?: number;
      dueDate?: string;
      paymentLink?: string;
    } }) =>
      apiClient<InvoiceDoc>(`/api/v1/admin/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      qc.invalidateQueries({ queryKey: ['member-invoices'] });
      qc.invalidateQueries({ queryKey: ['admin-cotisations'] });
      toast.success((res as any).message ?? 'Facture mise a jour');
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
      qc.invalidateQueries({ queryKey: ['member-invoices'] });
      qc.invalidateQueries({ queryKey: ['admin-cotisations'] });
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
      qc.invalidateQueries({ queryKey: ['cotisation-logs'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['member-invoices'] });
      qc.invalidateQueries({ queryKey: ['admin-cotisations'] });
      toast.success((res as any).message ?? 'Facture supprimÃ©e');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useInvoiceClients() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-invoice-clients'],
    queryFn: () => apiClient<InvoiceClientDoc[]>('/api/v1/admin/invoice-clients', { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useSaveInvoiceClient() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<InvoiceClientDoc> & { name: string }) =>
      apiClient<InvoiceClientDoc>(body._id ? `/api/v1/admin/invoice-clients/${body._id}` : '/api/v1/admin/invoice-clients', {
        method: body._id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-invoice-clients'] });
      toast.success((res as any).message ?? 'Client enregistré');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteInvoiceClient() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/invoice-clients/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-invoice-clients'] });
      toast.success((res as any).message ?? 'Client supprimé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useClientDocuments(clientId?: string) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-invoice-client-documents', clientId],
    queryFn: () => apiClient<InvoiceDoc[]>(`/api/v1/admin/invoice-clients/${clientId}/documents`, { token: token ?? '' }),
    enabled: !!token && !!clientId,
  });
}

export function useResendClientDocument() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: ({ clientId, invoiceId }: { clientId: string; invoiceId: string }) =>
      apiClient(`/api/v1/admin/invoice-clients/${clientId}/documents/${invoiceId}/resend`, {
        method: 'POST',
        token: token ?? '',
      }),
    onSuccess: res => toast.success((res as any).message ?? 'Document renvoyé'),
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

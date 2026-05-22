import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export type TreasuryKind = 'income' | 'expense';
export type TreasurySource = 'adhesion' | 'don' | 'crowdfunding' | 'activity' | 'subvention' | 'partner' | 'other';

export interface TreasuryTransaction {
  _id: string;
  kind: TreasuryKind;
  source: TreasurySource;
  category?: string;
  label: string;
  description?: string;
  amount: number;
  currency: 'XAF';
  occurredAt: string;
  paymentMode?: string;
  reference?: string;
  counterparty?: string;
  visibility: 'members' | 'private';
}

export interface TreasuryAsset {
  _id: string;
  name: string;
  category?: string;
  condition: 'good' | 'used' | 'damaged' | 'sold' | 'discarded' | 'lost';
  estimatedValue?: number;
  acquiredAt?: string;
  location?: string;
  responsible?: string;
  notes?: string;
}

export interface TreasuryOverview {
  kpis: {
    balance: number;
    income: number;
    expense: number;
    pendingAdhesions: number;
    activeMembers: number;
    expectedAdhesions: number;
    paidAdhesions: number;
    recoveryRate: number;
    membershipFee: number;
    donations: number;
    partners: number;
    assetsCount: number;
    assetsValue: number;
  };
  chart: { label: string; income: number; expense: number }[];
  sources: { source: TreasurySource; amount: number }[];
  recentTransactions: TreasuryTransaction[];
  assets: TreasuryAsset[];
}

export interface MembershipFeeProposal {
  _id: string;
  key: 'membership_fee';
  oldAmount: number;
  newAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approvals: { role: 'president' | 'auditor' | 'treasurer'; userId: unknown; approvedAt: string }[];
  createdAt: string;
}

export function formatFcfa(value: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value || 0) + ' F.CFA';
}

export function useTreasuryOverview(admin = false) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: [admin ? 'admin-treasury-overview' : 'member-treasury-overview'],
    queryFn: () => apiClient<TreasuryOverview>(`/api/v1/${admin ? 'admin' : 'member'}/treasury/overview`, { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useTreasuryTransactions(kind?: TreasuryKind, admin = false, source?: TreasurySource) {
  const token = useAuthStore(s => s.accessToken);
  const params = new URLSearchParams();
  if (kind) params.set('kind', kind);
  if (source) params.set('source', source);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return useQuery({
    queryKey: [admin ? 'admin-treasury-transactions' : 'member-treasury-transactions', kind, source],
    queryFn: () => apiClient<{ items: TreasuryTransaction[]; total: number }>(`/api/v1/${admin ? 'admin' : 'member'}/treasury/transactions${qs}`, { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useTreasuryAssets(admin = false) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: [admin ? 'admin-treasury-assets' : 'member-treasury-assets'],
    queryFn: () => apiClient<{ items: TreasuryAsset[]; total: number }>(`/api/v1/${admin ? 'admin' : 'member'}/treasury/assets`, { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useCreateTreasuryTransaction() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TreasuryTransaction>) =>
      apiClient('/api/v1/admin/treasury/transactions', { method: 'POST', body: JSON.stringify(payload), token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-transactions'] });
      toast.success((res as any).message ?? 'Ecriture ajoutee');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateTreasuryAsset() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TreasuryAsset>) =>
      apiClient('/api/v1/admin/treasury/assets', { method: 'POST', body: JSON.stringify(payload), token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-assets'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-assets'] });
      toast.success((res as any).message ?? 'Patrimoine ajoute');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTreasuryTransaction() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/treasury/transactions/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-transactions'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-transactions'] });
      toast.success((res as any).message ?? 'Ecriture supprimee');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTreasuryAsset() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/treasury/assets/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-assets'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-assets'] });
      toast.success((res as any).message ?? 'Patrimoine supprime');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMembershipFeeProposals(admin = false) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: [admin ? 'admin-membership-fee-proposals' : 'member-membership-fee-proposals'],
    queryFn: () => apiClient<{ items: MembershipFeeProposal[]; total: number; approvalRole: 'president' | 'auditor' | 'treasurer' | null }>(
      `/api/v1/${admin ? 'admin' : 'member'}/treasury/membership-fee/proposals`,
      { token: token ?? '' },
    ),
    enabled: !!token,
  });
}

export function useCreateMembershipFeeProposal() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { amount: number; reason?: string }) =>
      apiClient('/api/v1/admin/treasury/membership-fee/proposals', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-membership-fee-proposals'] });
      qc.invalidateQueries({ queryKey: ['member-membership-fee-proposals'] });
      toast.success((res as any).message ?? 'Validation en attente');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useReviewMembershipFeeProposal(admin = false) {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'approve' | 'reject'; reason?: string }) =>
      apiClient(`/api/v1/${admin ? 'admin' : 'member'}/treasury/membership-fee/proposals/${id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-membership-fee-proposals'] });
      qc.invalidateQueries({ queryKey: ['member-membership-fee-proposals'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      toast.success((res as any).message ?? 'Validation enregistree');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUploadTreasuryDocument() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('document', file);
      const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${API}/api/v1/admin/treasury/documents`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Erreur upload');
      return json;
    },
    onSuccess: res => toast.success((res as any).message ?? 'Document importe'),
    onError: (err: Error) => toast.error(err.message),
  });
}

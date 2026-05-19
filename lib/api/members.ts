import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export type MemberStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface MemberListItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  memberStatus: MemberStatus;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  memberId: string;
  cotisationStatus: 'paid' | 'unpaid' | 'exempt';
}

export interface MemberDetail extends MemberListItem {
  cotisations: {
    _id: string;
    year: number;
    status: string;
    amount: number;
    paidAt?: string;
    reference?: string;
  }[];
  invoiceCount: number;
}

export interface MembersListResponse {
  data: MemberListItem[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateMemberPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  memberStatus?: MemberStatus;
}

export interface UpdateMemberPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  memberStatus?: MemberStatus;
}

/* ── Admin ──────────────────────────────────────────────── */

export function useAdminMembers(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const token = useAuthStore(s => s.accessToken);
  const qs = new URLSearchParams();
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  if (params.page)   qs.set('page', String(params.page));
  if (params.limit)  qs.set('limit', String(params.limit));

  return useQuery({
    queryKey: ['admin-members', params],
    queryFn: () =>
      apiClient<MembersListResponse>(`/api/v1/admin/members?${qs}`, {
        token: token ?? '',
      }),
    enabled: !!token,
  });
}

export function useAdminMember(id: string) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-member', id],
    queryFn: () =>
      apiClient<MemberDetail>(`/api/v1/admin/members/${id}`, {
        token: token ?? '',
      }),
    enabled: !!token && !!id,
  });
}

export function useCreateMember() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMemberPayload) =>
      apiClient('/api/v1/admin/members', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success((res as any).message ?? 'Membre créé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateMember(id: string) {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMemberPayload) =>
      apiClient(`/api/v1/admin/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['admin-member', id] });
      toast.success((res as any).message ?? 'Membre mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSuspendMember() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/members/${id}`, {
        method: 'DELETE',
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success((res as any).message ?? 'Membre suspendu');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── CSV bulk import ──────────────────────────────────────── */

export interface CsvImportMember {
  firstName:   string;
  lastName:    string;
  email:       string;
  phone?:      string;
  bureauPoste?: string;
}

export interface ImportResult {
  created: number;
  skipped: number;
  emailed: number;
  errors:  { row: number; reason: string }[];
}

export function useImportMembersCSV() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (members: CsvImportMember[]) =>
      apiClient<ImportResult>('/api/v1/admin/members/bulk-import', {
        method: 'POST',
        body:   JSON.stringify({ members }),
        token:  token ?? '',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Member self-service ──────────────────────────────────── */

export function useUpdateProfile() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { firstName?: string; lastName?: string; phone?: string }) =>
      apiClient('/api/v1/member/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['member-profile'] });
      toast.success((res as any).message ?? 'Profil mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

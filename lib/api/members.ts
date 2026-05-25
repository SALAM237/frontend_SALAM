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
  bureauPhoto?: string;
  createdAt: string;
  lastLoginAt?: string;
  memberId: string;
  cotisationStatus: 'paid' | 'unpaid' | 'exempt';
  profileComplete?: boolean;
  missingProfileFields?: string[];
  gender?: 'homme' | 'femme';
  promotionYear?: number;
  city?: string;
  country?: string;
  residenceCity?: string;
  antenne?: string;
  activitySector?: string;
  skills?: string[];
  expertiseDomains?: string[];
  bio?: string;
}

export interface DirectoryMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bureauPhoto?: string;
  gender?: 'homme' | 'femme';
  promotionYear?: number;
  city?: string;
  country?: string;
  residenceCity?: string;
  antenne?: string;
  activitySector?: string;
  skills?: string[];
  expertiseDomains?: string[];
  bio?: string;
  memberId: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  country?: string;
  residenceCity?: string;
  antenne?: string;
  motivation?: string;
  bio?: string;
  activitySector?: string;
  activitySectorProposal?: string;
  recoveryContact?: string;
  skills?: string[];
  expertiseDomains?: string[];
  birthDate?: string;
  promotionYear?: number;
}

export function useChangeMemberPassword() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      apiClient('/api/v1/member/profile/password', {
        method: 'PUT',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => toast.success((res as any).message ?? 'Mot de passe mis à jour'),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSubmitActivitySectorProposal() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (payload: { label: string }) =>
      apiClient('/api/v1/member/activity-sector-proposals', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => toast.success((res as any).message ?? 'Secteur proposé'),
    onError: (err: Error) => toast.error(err.message),
  });
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
  firstName:     string;
  lastName:      string;
  email:         string;
  phone?:        string;
  memberStatus?: MemberStatus;
  gender?:       'homme' | 'femme';
  promotionYear?: number;
}

export interface UpdateMemberPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  memberStatus?: MemberStatus;
  gender?: 'homme' | 'femme';
  promotionYear?: number;
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

export function useMemberDirectorySearch(search: string, limit = 20) {
  const token = useAuthStore(s => s.accessToken);
  const trimmed = search.trim();
  const qs = new URLSearchParams();
  qs.set('search', trimmed);
  qs.set('limit', String(limit));

  return useQuery({
    queryKey: ['member-directory', trimmed, limit],
    queryFn: () =>
      apiClient<{ data: DirectoryMember[]; total: number; page: number; pages: number }>(`/api/v1/member/directory?${qs}`, {
        token: token ?? '',
      }),
    enabled: !!token && trimmed.length >= 2,
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
  firstName:     string;
  lastName:      string;
  email:         string;
  phone?:        string;
  bureauPoste?:  string;
  gender?:       'homme' | 'femme';
  promotionYear?: number;
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

export function useHardDeleteMember() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/members/${id}/hard`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success((res as any).message ?? 'Membre supprimé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useResendInvitation() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/members/${id}/resend-invitation`, { method: 'POST', token: token ?? '' }),
    onSuccess: res => toast.success((res as any).message ?? 'Invitation renvoyée'),
    onError:   (err: Error) => toast.error(err.message),
  });
}

/* ── Member self-service ──────────────────────────────────── */

export function useUpdateProfile() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
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

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
  memberNumber?: string;
  cardVerifyToken?: string | null;
  cotisationStatus: 'paid' | 'unpaid' | 'exempt';
  cotisationAnnuelleStatus: 'paid' | 'partiel' | 'unpaid' | 'exempt';
  cotisationAnnuelleReste: number;
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
  memberNumber?: string;
  cardVerifyToken?: string | null;
  savedCount?: number;
}

export interface UpdateProfilePayload {
  gender?: 'homme' | 'femme';
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
    onSuccess: res => toast.success((res as any).message ?? 'Mot de passe mis Ã  jour'),
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

/* â”€â”€ Admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
      apiClient<{ id: string; email: string; memberId: string; memberNumber: string; cardVerifyToken?: string | null; emailSent: boolean }>('/api/v1/admin/members', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
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
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      toast.success((res as any).message ?? 'Membre mis Ã  jour');
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
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
      toast.success((res as any).message ?? 'Membre suspendu');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* â”€â”€ CSV bulk import â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

export interface MemberCardChangeRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender?: 'homme' | 'femme';
    promotionYear?: number;
    memberNumber?: string;
  cardVerifyToken?: string | null;
    avatar?: string | null;
    bureauPhoto?: string | null;
  };
  requestedBy?: { _id: string; firstName: string; lastName: string; email: string };
  currentGender?: 'homme' | 'femme' | null;
  requestedGender?: 'homme' | 'femme' | null;
  currentPromotionYear?: number | null;
  requestedPromotionYear?: number | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string | null;
  changes?: { field: string; previousValue: unknown; requestedValue: unknown }[];
}

export interface MemberProfileValidationField {
  key: string;
  label: string;
  group: string;
  required?: boolean;
}

export interface MemberProfileValidationPolicy {
  fields: string[];
  availableFields: MemberProfileValidationField[];
  requiredFields: string[];
}

export function useMemberProfileValidationPolicy() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['member-profile-validation-policy'],
    queryFn: () =>
      apiClient<MemberProfileValidationPolicy>('/api/v1/admin/member-profile-validation-policy', {
        token: token ?? '',
      }),
    enabled: !!token,
    refetchInterval: 5000,
  });
}

export function useUpdateMemberProfileValidationPolicy() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fields: string[]) =>
      apiClient<MemberProfileValidationPolicy>('/api/v1/admin/member-profile-validation-policy', {
        method: 'PUT',
        body: JSON.stringify({ fields }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.setQueryData(['member-profile-validation-policy'], res);
      qc.invalidateQueries({ queryKey: ['member-profile-validation-policy'] });
      toast.success((res as any).message ?? 'Validations mises Ã  jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
export function useMemberCardChangeRequests(status = 'pending') {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['member-card-change-requests', status],
    queryFn: () =>
      apiClient<{ data: MemberCardChangeRequest[]; pending: number }>(`/api/v1/admin/member-card-change-requests?status=${encodeURIComponent(status)}`, {
        token: token ?? '',
      }),
    enabled: !!token,
    refetchInterval: 5000,
  });
}

export function useReviewMemberCardChangeRequest() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) =>
      apiClient(`/api/v1/admin/member-card-change-requests/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, note }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['member-card-change-requests'] });
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['admin-member'] });
      toast.success((res as any).message ?? 'Demande traitée');
    },
    onError: (err: Error) => toast.error(err.message),
  });
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
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
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
      qc.invalidateQueries({ queryKey: ['admin-treasury-overview'] });
      qc.invalidateQueries({ queryKey: ['member-treasury-overview'] });
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

/* â”€â”€ Member self-service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function useSubmitMemberCardChangeRequest() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { gender: 'homme' | 'femme'; promotionYear: number }) =>
      apiClient('/api/v1/member/profile/card-change-request', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['member-card-change-requests'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['member-profile'] });
      qc.invalidateQueries({ queryKey: ['member-cauris'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRequestAccountDeletion() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { reason?: string }) =>
      apiClient('/api/v1/member/profile/deletion-request', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-pending-validations'] });
      toast.success((res as any).message ?? 'Demande de suppression envoyee');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

type RelanceResult = { sent: number; failed: { name: string; email: string; reason: string; code?: string }[]; stoppedEarly?: boolean };

function buildFailedDescription(failed: RelanceResult['failed'], stoppedEarly?: boolean): string {
  const cause = failed[0]?.reason ?? 'Erreur inconnue';
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

export function useRemindIncompleteProfiles() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (vars: { userIds?: string[] }) =>
      apiClient<RelanceResult>('/api/v1/admin/members/remind-profile', {
        method: 'POST',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
    onSuccess: res => toastRelanceResult(res),
    onError: (err: Error) => toast.error(`Envoi impossible : ${err.message}`),
  });
}

export function useRemindPendingInscriptions() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (vars: { userIds?: string[] }) =>
      apiClient<RelanceResult>('/api/v1/admin/members/remind-inscriptions', {
        method: 'POST',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
    onSuccess: res => {
      const sent        = res.data?.sent        ?? 0;
      const failed      = res.data?.failed      ?? [];
      const stoppedEarly = res.data?.stoppedEarly;
      if (failed.length === 0) {
        toast.success(`${sent} invitation(s) renvoyée(s) avec succès`);
      } else if (sent === 0) {
        toast.error(`Aucune invitation n'a pu être envoyée (${failed.length} échec(s))`, {
          description: buildFailedDescription(failed, stoppedEarly),
        });
      } else {
        toast.warning(`${sent} envoyée(s) — ${failed.length} échec(s)`, {
          description: buildFailedDescription(failed, stoppedEarly),
        });
      }
    },
    onError: (err: Error) => toast.error(`Envoi impossible : ${err.message}`),
  });
}

export function useBackfillLastLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<{ updated: number }>('/api/v1/admin/members/backfill-last-login', { method: 'POST' }),
    onSuccess: res => {
      toast.success(`${res.data?.updated ?? 0} membre(s) mis à jour`);
      qc.invalidateQueries({ queryKey: ['admin-members'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSendInternalMessageBulk() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (vars: { userIds: string[]; subject: string; content: string }) =>
      apiClient<{ sent: number }>('/api/v1/admin/messages/bulk', {
        method: 'POST',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
    onSuccess: res => toast.success(`${(res.data as any)?.sent ?? 0} message(s) envoyé(s)`),
    onError: (err: Error) => toast.error(err.message),
  });
}

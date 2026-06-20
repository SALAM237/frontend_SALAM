import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';
import { MEMBER_DASHBOARD_KPIS_QUERY_KEY } from './member-dashboard';

export type OpportunityType = 'emploi' | 'stage' | 'partenariat' | 'associe' | 'appel_projet' | 'business' | 'benevolat' | 'autre';
export type OpportunityStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

export interface OpportunityDoc {
  _id: string;
  title: string;
  slug?: string;
  type: OpportunityType;
  organization?: string;
  location?: string;
  remote?: boolean;
  description: string;
  skills?: string[];
  deadline?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactUrl?: string;
  status: OpportunityStatus;
  visibility: 'members' | 'public';
  submittedBy?: { firstName?: string; lastName?: string; email?: string };
  createdAt: string;
  publishedAt?: string;
}

export interface OpportunityPayload {
  title: string;
  type: OpportunityType;
  organization?: string;
  location?: string;
  remote?: boolean;
  description: string;
  skills?: string[];
  deadline?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactUrl?: string;
  visibility?: 'members' | 'public';
}

export const OPPORTUNITY_TYPES: { value: OpportunityType; label: string }[] = [
  { value: 'emploi', label: 'Offre d’emploi' },
  { value: 'stage', label: 'Stage' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'associe', label: 'Recherche d’associe' },
  { value: 'appel_projet', label: 'Appel a projet' },
  { value: 'business', label: 'Opportunite business' },
  { value: 'benevolat', label: 'Benevolat' },
  { value: 'autre', label: 'Autre' },
];

export function usePublicOpportunities() {
  return useQuery({
    queryKey: ['public-opportunities'],
    queryFn: () => apiClient<{ items: OpportunityDoc[]; total: number }>('/api/v1/public/opportunities'),
    staleTime: 60_000,
  });
}

export function usePublicOpportunity(slug: string) {
  return useQuery({
    queryKey: ['public-opportunity', slug],
    queryFn: () => apiClient<OpportunityDoc>(`/api/v1/public/opportunities/${slug}`),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function opportunityHref(item: Pick<OpportunityDoc, '_id' | 'slug'>) {
  return `/opportunites/${item.slug || item._id}`;
}

export function useMemberOpportunities(status?: 'published' | 'mine') {
  const token = useAuthStore(s => s.accessToken);
  const qs = status === 'mine' ? '?status=mine' : '';
  return useQuery({
    queryKey: ['member-opportunities', status],
    queryFn: () => apiClient<{ items: OpportunityDoc[]; total: number }>(`/api/v1/member/opportunities${qs}`, { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useSubmitOpportunity() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpportunityPayload) =>
      apiClient<OpportunityDoc>('/api/v1/member/opportunities', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['member-opportunities'] });
      qc.invalidateQueries({ queryKey: ['public-opportunities'] });
      qc.invalidateQueries({ queryKey: ['admin-pending-validations'] });
      qc.invalidateQueries({ queryKey: MEMBER_DASHBOARD_KPIS_QUERY_KEY });
      toast.success((res as any).message ?? 'Opportunite soumise');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateOpportunity() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OpportunityPayload }) =>
      apiClient<OpportunityDoc>(`/api/v1/member/opportunities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['member-opportunities'] });
      qc.invalidateQueries({ queryKey: ['public-opportunities'] });
      qc.invalidateQueries({ queryKey: ['admin-pending-validations'] });
      qc.invalidateQueries({ queryKey: ['admin-opportunities'] });
      qc.invalidateQueries({ queryKey: MEMBER_DASHBOARD_KPIS_QUERY_KEY });
      toast.success((res as any).message ?? 'Opportunite mise a jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useReplyOpportunity() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { message?: string; contactEmail?: string; contactPhone?: string } }) =>
      apiClient(`/api/v1/member/opportunities/${id}/replies`, {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: res => toast.success((res as any).message ?? 'Reponse envoyee'),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminOpportunities(status?: string) {
  const token = useAuthStore(s => s.accessToken);
  const qs = status && status !== 'all' ? `?status=${status}` : '';
  return useQuery({
    queryKey: ['admin-opportunities', status],
    queryFn: () => apiClient<{ items: OpportunityDoc[]; total: number }>(`/api/v1/admin/opportunities${qs}`, { token: token ?? '' }),
    enabled: !!token,
  });
}

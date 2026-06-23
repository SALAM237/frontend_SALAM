import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { MEMBER_DASHBOARD_KPIS_QUERY_KEY } from './member-dashboard';
import { useAuthStore } from '@/store/auth.store';

export type PendingValidationType = 'content' | 'gallery' | 'sector' | 'opportunity' | 'memberDeletion';

export interface PendingValidationItem {
  type: PendingValidationType;
  permission: string;
  title: string;
  createdAt: string;
  submitter?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string | null;
    bureauPhoto?: string | null;
    gender?: string | null;
  } | null;
  item: { _id?: string } & Record<string, unknown>;
}

export interface PendingValidationsResponse {
  total: number;
  items: PendingValidationItem[];
}

export function usePendingValidations() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-pending-validations'],
    queryFn: () => apiClient<PendingValidationsResponse>('/api/v1/admin/pending-validations', { token: token ?? '' }),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useReviewPendingValidation() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id, action }: { type: PendingValidationType; id: string; action: 'approve' | 'reject' }) =>
      apiClient(`/api/v1/admin/pending-validations/${type}/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action }),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-pending-validations'] });
      qc.invalidateQueries({ queryKey: ['admin-content'] });
      qc.invalidateQueries({ queryKey: ['admin-gallery'] });
      qc.invalidateQueries({ queryKey: ['public-content'] });
      qc.invalidateQueries({ queryKey: ['public-gallery'] });
      qc.invalidateQueries({ queryKey: ['activity-sector-proposals'] });
      qc.invalidateQueries({ queryKey: ['member-opportunities'] });
      qc.invalidateQueries({ queryKey: ['public-opportunities'] });
      qc.invalidateQueries({ queryKey: ['admin-opportunities'] });
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      qc.invalidateQueries({ queryKey: MEMBER_DASHBOARD_KPIS_QUERY_KEY });
      toast.success((res as any).message ?? 'Validation mise a jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}


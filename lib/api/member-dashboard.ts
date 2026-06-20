import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export type MemberDashboardKpis = {
  unreadOpportunities: number;
  unreadNews: number;
  unreadMessages: number;
  submissions: {
    pending: number;
    accepted: number;
    rejected: number;
    details: {
      opportunities: { pending: number; accepted: number; rejected: number };
      news: { pending: number; accepted: number; rejected: number };
      activities: { pending: number; accepted: number; rejected: number };
    };
  };
  readMarkers: {
    opportunitiesAt: string | null;
    newsAt: string | null;
  };
};

export const MEMBER_DASHBOARD_KPIS_QUERY_KEY = ['member-dashboard-kpis'] as const;

export function useMemberDashboardKpis() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: MEMBER_DASHBOARD_KPIS_QUERY_KEY,
    queryFn: () => apiClient<MemberDashboardKpis>('/api/v1/member/dashboard-kpis', { token: token ?? '' }),
    enabled: !!token,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 5_000,
  });
}

export function useMarkMemberDashboardSectionRead() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (section: 'opportunities' | 'news' | 'messages') =>
      apiClient<null>(`/api/v1/member/dashboard-kpis/read/${section}`, {
        method: 'POST',
        token: token ?? '',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEMBER_DASHBOARD_KPIS_QUERY_KEY });
    },
  });
}

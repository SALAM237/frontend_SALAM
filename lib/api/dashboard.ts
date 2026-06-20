import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface AdminStats {
  members: {
    active: number;
    pending: number;
    suspended: number;
    total: number;
  };
  requests: { pending: number };
  cotisations: {
    year: number;
    paid: number;
    unpaid: number;
    pendingInvoices: number;
    overdueInvoices: number;
  };
  messages: { unread: number };
  activities: { upcoming: number };
  recommendations: { unread: number };
  recentMembers: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    memberStatus: string;
    gender?: 'homme' | 'femme';
    avatar?: string | null;
    bureauPhoto?: string | null;
    createdAt: string;
    memberId: string;
  }[];
}

export function useAdminStats() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () =>
      apiClient<AdminStats>('/api/v1/admin/stats', {
        token: token ?? '',
      }),
    enabled: !!token,
    staleTime: 60_000,
  });
}

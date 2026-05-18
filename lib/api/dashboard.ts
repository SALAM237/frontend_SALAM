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
  cotisations: {
    year: number;
    paid: number;
    unpaid: number;
  };
  recentMembers: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    memberStatus: string;
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

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface AuditLogDoc {
  _id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  targetModel?: string;
  targetId?: string;
  details: Record<string, unknown>;
  ip: string;
  createdAt: string;
}

interface AuditLogsPage {
  logs: AuditLogDoc[];
  total: number;
  page: number;
  pages: number;
}

export function useAuditLogs(page = 1) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () =>
      apiClient<AuditLogsPage>(`/api/v1/admin/audit-logs?page=${page}`, {
        token: token ?? '',
      }),
    enabled: !!token,
  });
}

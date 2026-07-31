import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface UserActivityLogDoc {
  _id: string;
  sessionId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  eventType: 'page_view' | 'login' | 'logout';
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  ip?: string;
  geo?: { country?: string; region?: string; city?: string; ll?: [number, number] };
  device?: { type: string; browser?: string; browserVersion?: string; os?: string; osVersion?: string };
  userAgent?: string;
  createdAt: string;
}

export interface UserAuditLogDoc {
  _id: string;
  adminId?: string;
  adminName?: string;
  adminRole?: string;
  userId?: string;
  action: string;
  targetModel?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

interface PagedResult<T> {
  logs: T[];
  total: number;
  page: number;
  pages: number;
}

export function useUserActivityLogs(params: { page: number; limit: number; search?: string; eventType?: string; userIds?: string[] }) {
  const token = useAuthStore(s => s.accessToken);
  const qs = new URLSearchParams();
  qs.set('page', String(params.page));
  qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.eventType && params.eventType !== 'all') qs.set('eventType', params.eventType);
  if (params.userIds?.length) qs.set('userIds', params.userIds.join(','));

  return useQuery({
    queryKey: ['user-logs-activity', params.page, params.limit, params.search, params.eventType, params.userIds],
    queryFn: () => apiClient<PagedResult<UserActivityLogDoc>>(`/api/v1/admin/user-logs/activity?${qs.toString()}`, { token: token ?? '' }),
    enabled: !!token,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useUserAuditLogs(params: { page: number; limit: number; search?: string; userIds?: string[] }) {
  const token = useAuthStore(s => s.accessToken);
  const qs = new URLSearchParams();
  qs.set('page', String(params.page));
  qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.userIds?.length) qs.set('userIds', params.userIds.join(','));

  return useQuery({
    queryKey: ['user-logs-audit', params.page, params.limit, params.search, params.userIds],
    queryFn: () => apiClient<PagedResult<UserAuditLogDoc>>(`/api/v1/admin/user-logs/audit?${qs.toString()}`, { token: token ?? '' }),
    enabled: !!token,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface AnalyticsOverview {
  days: number;
  totals: { events: number; sessions: number; users: number };
  topPages: { path: string; count: number }[];
  byDevice: { type: string; count: number }[];
  byBrowser: { browser: string; count: number }[];
  trend: { date: string; count: number }[];
}

export interface AnalyticsActivityRow {
  _id: string;
  path?: string;
  eventType: string;
  userName?: string;
  device?: { type?: string; browser?: string };
  createdAt: string;
}

interface PagedResult<T> {
  logs: T[];
  total: number;
  page: number;
  pages: number;
}

export function useAnalyticsOverview(days = 30) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['analytics-overview', days],
    queryFn: () => apiClient<AnalyticsOverview>(`/api/v1/admin/analytics/overview?days=${days}`, { token: token ?? '' }),
    enabled: !!token,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useAnalyticsActivity(
  params: { page: number; limit: number; search?: string; eventType?: string },
  options: { enabled?: boolean } = {},
) {
  const token = useAuthStore(s => s.accessToken);
  const qs = new URLSearchParams();
  qs.set('page', String(params.page));
  qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.eventType && params.eventType !== 'all') qs.set('eventType', params.eventType);

  return useQuery({
    queryKey: ['analytics-activity', params.page, params.limit, params.search, params.eventType],
    queryFn: () => apiClient<PagedResult<AnalyticsActivityRow>>(`/api/v1/admin/analytics/activity?${qs.toString()}`, { token: token ?? '' }),
    enabled: !!token && (options.enabled ?? true),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

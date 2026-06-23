import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface ScannedMember {
  kind?: 'member' | 'activityInvitation';
  _id?: string;
  invitationId?: string;
  activityId?: string;
  activityTitle?: string;
  guestType?: 'member' | 'client' | 'external';
  firstName: string;
  lastName: string;
  memberNumber: string;
  memberStatus: 'pending' | 'active' | 'suspended' | 'rejected';
  avatar?: string;
  bureauPoste?: string;
  gender?: string;
  promotionYear?: number;
  antenne?: string;
  city?: string;
}

export interface ScanRecord {
  _id: string;
  memberId: { _id: string; firstName: string; lastName: string; memberNumber: string; avatar?: string } | null;
  activityId: { _id: string; title: string; startDate?: string } | null;
  scannedBy:  { _id: string; firstName: string; lastName: string } | null;
  context: 'activity' | 'general' | 'manual';
  note?: string;
  createdAt: string;
}

export interface ScanActivity {
  _id: string;
  title: string;
  startDate?: string;
  location?: string;
  status: string;
}

export interface ScanStats { total: number; today: number; }

export function useScanLookup() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (code: string) =>
      apiClient<ScannedMember>('/api/v1/admin/scans/lookup', {
        method: 'POST',
        body: JSON.stringify({ code }),
        token: token ?? '',
      }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useScanCheckin() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { memberId?: string; invitationId?: string; activityId?: string; note?: string; context?: string }) =>
      apiClient('/api/v1/admin/scans/checkin', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scan-history'] });
      qc.invalidateQueries({ queryKey: ['scan-stats'] });
      toast.success('Présence enregistrée');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useScanHistory(activityId?: string, page = 1) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['scan-history', activityId ?? 'all', page],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50', page: String(page) });
      if (activityId) params.set('activityId', activityId);
      return apiClient<{ scans: ScanRecord[]; total: number; page: number; perPage: number }>(
        `/api/v1/admin/scans/history?${params}`,
        { token: token ?? '' },
      );
    },
    enabled: Boolean(token),
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

export function useScanActivities() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['scan-activities'],
    queryFn: () => apiClient<ScanActivity[]>('/api/v1/admin/scans/activities', { token: token ?? '' }),
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}

export function useScanStats(activityId?: string) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['scan-stats', activityId ?? 'all'],
    queryFn: () =>
      apiClient<ScanStats>(
        `/api/v1/admin/scans/stats${activityId ? `?activityId=${activityId}` : ''}`,
        { token: token ?? '' },
      ),
    enabled: Boolean(token),
    refetchInterval: 15_000,
  });
}

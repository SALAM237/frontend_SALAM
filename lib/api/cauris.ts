import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface CauriTransaction {
  _id: string;
  amount: number;
  type: 'earn' | 'spend' | 'refund' | 'adjustment';
  reason: string;
  label: string;
  createdAt: string;
}

export interface CauriRedemption {
  _id: string;
  activityId: string | { _id: string; title: string; startDate?: string; location?: string };
  activityTitle: string;
  amount: number;
  status: 'reserved' | 'redeemed' | 'expired' | 'cancelled';
  expiresAt: string;
  shortCode?: string;
  redeemedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  redeemedBy?: { _id: string; firstName: string; lastName: string } | null;
}

export interface CauriWallet {
  balance: number;
  rules: Record<string, number>;
  redemption: { minimum: number; maximum: number; expiresInMinutes: number };
  transactions: CauriTransaction[];
  redemptions: CauriRedemption[];
  recentRedeemed?: CauriRedemption[];
}

export function useCauriWallet(space: 'member' | 'admin' = 'member') {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({
    queryKey: ['member-cauris', space],
    queryFn: () => apiClient<CauriWallet>(space === 'admin' ? '/api/v1/admin/cauris/me' : '/api/v1/member/cauris', { token: token ?? '' }),
    enabled: Boolean(token),
    staleTime: 0,
  });
}

export function useCreateCauriRedemption() {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { activityId: string; amount: number }) =>
      apiClient<{ redemption: CauriRedemption; qrDataUrl: string; validationUrl: string; balance: number }>('/api/v1/member/cauris/redemptions', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['member-cauris'] });
      toast.success(response.message);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCancelCauriRedemption() {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient('/api/v1/member/cauris/redemptions/' + id, { method: 'DELETE', token: token ?? '' }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['member-cauris'] });
      toast.success(response.message);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useInspectCauriRedemption(tokenValue: string) {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({
    queryKey: ['admin-cori-redemption', tokenValue],
    queryFn: () => apiClient<any>('/api/v1/admin/cauris/redemptions/inspect', { method: 'POST', body: JSON.stringify({ token: tokenValue }), token: token ?? '' }),
    // min 6 : accepte le code court (6 chars) ET le token JWT long
    enabled: Boolean(token && tokenValue && tokenValue.length >= 6),
    retry: false,
  });
}

export function useRedeemCauris() {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tokenValue: string) => apiClient('/api/v1/admin/cauris/redemptions/redeem', {
      method: 'POST',
      body: JSON.stringify({ token: tokenValue }),
      token: token ?? '',
    }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['admin-cori-redemption'] });
      toast.success(response.message);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
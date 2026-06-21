import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface CoriTransaction {
  _id: string;
  amount: number;
  type: 'earn' | 'spend' | 'refund' | 'adjustment';
  reason: string;
  label: string;
  createdAt: string;
}

export interface CoriRedemption {
  _id: string;
  activityId: string;
  activityTitle: string;
  amount: number;
  status: 'reserved' | 'redeemed' | 'expired' | 'cancelled';
  expiresAt: string;
}

export interface CoriWallet {
  balance: number;
  rules: Record<string, number>;
  redemption: { minimum: number; maximum: number; expiresInMinutes: number };
  transactions: CoriTransaction[];
  redemptions: CoriRedemption[];
}

export function useCoriWallet(space: 'member' | 'admin' = 'member') {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({
    queryKey: ['member-coris', space],
    queryFn: () => apiClient<CoriWallet>(space === 'admin' ? '/api/v1/admin/coris/me' : '/api/v1/member/coris', { token: token ?? '' }),
    enabled: Boolean(token),
    staleTime: 0,
  });
}

export function useCreateCoriRedemption() {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { activityId: string; amount: number }) =>
      apiClient<{ redemption: CoriRedemption; qrDataUrl: string; validationUrl: string; balance: number }>('/api/v1/member/coris/redemptions', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: token ?? '',
      }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['member-coris'] });
      toast.success(response.message);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCancelCoriRedemption() {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient('/api/v1/member/coris/redemptions/' + id, { method: 'DELETE', token: token ?? '' }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['member-coris'] });
      toast.success(response.message);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useInspectCoriRedemption(tokenValue: string) {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({
    queryKey: ['admin-cori-redemption', tokenValue],
    queryFn: () => apiClient<any>('/api/v1/admin/coris/redemptions/inspect', { method: 'POST', body: JSON.stringify({ token: tokenValue }), token: token ?? '' }),
    enabled: Boolean(token && tokenValue),
    retry: false,
  });
}

export function useRedeemCoris() {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tokenValue: string) => apiClient('/api/v1/admin/coris/redemptions/redeem', {
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
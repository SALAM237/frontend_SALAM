'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface MailErrorFailure {
  name: string;
  email: string;
  reason: string;
  code: string;
}

export interface MailErrorLog {
  _id: string;
  action: string;
  actionLabel: string;
  adminId?: string;
  adminName?: string;
  totalTargeted: number;
  totalSent: number;
  totalFailed: number;
  stoppedEarly: boolean;
  failures: MailErrorFailure[];
  createdAt: string;
}

export function useMailErrorLogs(page = 1) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['mail-error-logs', page],
    queryFn: () =>
      apiClient<{ logs: MailErrorLog[]; total: number; page: number; pages: number }>(
        `/api/v1/admin/mail-errors?page=${page}&limit=20`,
        { token: token ?? '' },
      ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useDeleteMailError() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/mail-errors/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mail-error-logs'] });
      toast.success('Entrée supprimée');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useClearMailErrors() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient('/api/v1/admin/mail-errors', { method: 'DELETE', token: token ?? '' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mail-error-logs'] });
      toast.success('Historique des erreurs vidé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

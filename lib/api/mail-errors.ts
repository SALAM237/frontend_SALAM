'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export type AppErrorCategory =
  | 'email' | 'upload' | 'auth' | 'validation' | 'database' | 'pdf'
  | 'qr_scan' | 'cauris' | 'config' | 'csv_import' | 'notification' | 'other';

export interface AppErrorLog {
  _id: string;
  category: AppErrorCategory;
  severity: 'critical' | 'major' | 'minor';
  code: string;
  message: string;
  source?: string;
  action?: string;
  userId?: string;
  userName?: string;
  ip?: string;
  requestPath?: string;
  requestMethod?: string;
  details?: Record<string, unknown>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

// Backward-compat alias
export type MailErrorLog = AppErrorLog;

export function useAppErrorLogs(page = 1, category?: AppErrorCategory) {
  const token = useAuthStore(s => s.accessToken);
  const qs    = new URLSearchParams({ page: String(page), limit: '20' });
  if (category) qs.set('category', category);
  return useQuery({
    queryKey: ['app-error-logs', page, category ?? 'all'],
    queryFn:  () =>
      apiClient<{ logs: AppErrorLog[]; total: number; page: number; pages: number }>(
        `/api/v1/admin/app-errors?${qs}`,
        { token: token ?? '' },
      ),
    enabled:   !!token,
    staleTime: 30_000,
  });
}

export function useMailErrorLogs(page = 1) {
  return useAppErrorLogs(page);
}

export function useDeleteAppError() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/app-errors/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-error-logs'] });
      toast.success('Entrée supprimée');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteMailError() {
  return useDeleteAppError();
}

export function useClearAppErrors() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient('/api/v1/admin/app-errors', { method: 'DELETE', token: token ?? '' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-error-logs'] });
      toast.success('Historique vidé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useClearMailErrors() {
  return useClearAppErrors();
}

export function useResolveAppError() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/app-errors/${id}/resolve`, { method: 'PATCH', token: token ?? '' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-error-logs'] });
      toast.success('Erreur marquée comme résolue');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface AttestationTemplate {
  _id?: string;
  title: string;
  bodyHtml: string;
}

/* ── Admin ──────────────────────────────────────────────── */
export function useAdminAttestationTemplate() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-attestation-template'],
    queryFn:  () => apiClient<AttestationTemplate>('/api/v1/admin/attestation-template', { token: token ?? '' }),
    enabled:  !!token,
  });
}

export function useSaveAttestationTemplate() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; bodyHtml: string }) =>
      apiClient<AttestationTemplate>('/api/v1/admin/attestation-template', {
        method: 'PUT',
        body: JSON.stringify(body),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-attestation-template'] });
      toast.success((res as any).message ?? 'Modèle enregistré');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Member ─────────────────────────────────────────────── */
export function useGenerateMemberAttestation() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: () => apiClient<{ title: string; bodyHtml: string }>('/api/v1/member/attestation', { token: token ?? '' }),
    onError: (err: Error) => toast.error(err.message),
  });
}

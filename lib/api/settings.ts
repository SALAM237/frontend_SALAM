import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

/* Public — lu par l'admin ET le membre pour générer leurs PDF avec le même logo. */
export function usePdfLogo() {
  return useQuery({
    queryKey: ['pdf-logo'],
    queryFn: () => apiClient<{ logoUrl: string }>('/api/v1/settings/pdf-logo'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUploadPdfLogo() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('logo', file);
      return apiClient<{ logoUrl: string }>('/api/v1/admin/settings/pdf-logo', {
        method: 'POST',
        body: form,
        token: token ?? '',
      });
    },
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['pdf-logo'] });
      toast.success(res.message ?? 'Logo mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

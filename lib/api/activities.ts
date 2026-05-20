import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface ActivityDoc {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  visibility: 'public' | 'members' | 'office';
  status: 'draft' | 'published' | 'finished' | 'cancelled';
  createdAt: string;
}

export const ACTIVITY_CATEGORIES = [
  { value: 'sport',              label: 'Sport'              },
  { value: 'culture',            label: 'Culture'            },
  { value: 'etude',              label: 'Études'             },
  { value: 'reseau',             label: 'Réseau'             },
  { value: 'insertion',          label: 'Insertion'          },
  { value: 'orientation',        label: 'Orientation'        },
  { value: 'atelier',            label: 'Atelier'            },
  { value: 'conference',         label: 'Conférence'         },
  { value: 'entraide',           label: 'Entraide'           },
  { value: 'benevolat',          label: 'Bénévolat'         },
  { value: 'assemblee_generale', label: 'Assemblée Générale' },
  { value: 'divers',             label: 'Divers'             },
] as const;

/* ── Public (no auth) ──────────────────────────────────────── */
export function usePublicActivities(category?: string) {
  const qs = category && category !== 'all' ? `?category=${category}` : '';
  return useQuery({
    queryKey: ['public-activities', category],
    queryFn:  () => apiClient<{ activities: ActivityDoc[]; total: number }>(`/api/v1/public/activities${qs}`),
    staleTime: 60_000,
  });
}

/* ── Member ────────────────────────────────────────────────── */
export function useMemberActivities(category?: string) {
  const token = useAuthStore(s => s.accessToken);
  const qs = category && category !== 'all' ? `?category=${category}` : '';
  return useQuery({
    queryKey: ['member-activities', category],
    queryFn:  () => apiClient<{ activities: ActivityDoc[]; total: number }>(`/api/v1/member/activities${qs}`, { token: token ?? '' }),
    enabled:  !!token,
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

/* ── Admin ─────────────────────────────────────────────────── */
export function useActivities(params?: { status?: string; category?: string }) {
  const token = useAuthStore(s => s.accessToken);
  const qs = new URLSearchParams();
  if (params?.status)   qs.set('status',   params.status);
  if (params?.category) qs.set('category', params.category);
  return useQuery({
    queryKey: ['admin-activities', params],
    queryFn:  () => apiClient<{ activities: ActivityDoc[]; total: number }>(`/api/v1/admin/activities?${qs}`, { token: token ?? '' }),
    enabled:  !!token,
  });
}

export function useCreateActivity() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string; category: string; description?: string;
      startDate?: string; endDate?: string; location?: string;
      capacity?: number; visibility?: string; status?: string;
    }) => apiClient<ActivityDoc>('/api/v1/admin/activities', {
      method: 'POST', body: JSON.stringify(payload), token: token ?? '',
    }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-activities'] });
      toast.success((res as any).message ?? 'Activité créée');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateActivity(id: string) {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ActivityDoc>) =>
      apiClient<ActivityDoc>(`/api/v1/admin/activities/${id}`, {
        method: 'PUT', body: JSON.stringify(payload), token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-activities'] });
      toast.success((res as any).message ?? 'Activité mise à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteActivity() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/activities/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-activities'] });
      toast.success((res as any).message ?? 'Activité supprimée');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

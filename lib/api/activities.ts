import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface ActivityInvitationSummary { total: number; pending: number; present: number; absent: number; unsure: number; scanned: number; }

export interface ActivityInvitationDoc {
  _id: string;
  activityId: string;
  guestType: 'member' | 'client' | 'external';
  memberId?: string | { _id: string; firstName?: string; lastName?: string; email?: string; phone?: string; memberNumber?: string; avatar?: string };
  clientId?: string | { _id: string; name?: string; email?: string; phone?: string };
  externalGuest?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  email?: string;
  name?: string;
  phone?: string;
  rsvpRequired: boolean;
  rsvpDeadline?: string;
  rsvpStatus: 'pending' | 'present' | 'unsure' | 'absent';
  rsvpAt?: string;
  shortCode?: string;
  qrExpiresAt?: string;
  scanStatus?: 'unused' | 'used' | 'expired';
  scannedAt?: string;
  scannedBy?: { firstName?: string; lastName?: string } | null;
  qrDataUrl?: string;
  scanValue?: string;
}
export interface ActivityProgramStep { time: string; title: string; }

export interface ActivityDoc {
  _id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  venue?: string;
  location?: string;
  capacity?: number;
  registeredCount?: number;
  price?: number;
  program?: ActivityProgramStep[];
  practicalInfo?: string;
  contactEmail?: string;
  contactPhone?: string;
  visibility: 'public' | 'members' | 'office';
  status: 'draft' | 'published' | 'finished' | 'cancelled';
  createdAt: string;
  invitationSummary?: ActivityInvitationSummary;
  myInvitation?: ActivityInvitationDoc | null;
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

export function usePublicActivity(slug: string) {
  return useQuery({
    queryKey: ['public-activity', slug],
    queryFn:  () => apiClient<ActivityDoc>(`/api/v1/public/activities/${slug}`),
    enabled:  !!slug,
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

export function useMemberActivity(slug: string) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['member-activity', slug],
    queryFn: () => apiClient<ActivityDoc>(`/api/v1/member/activities/${slug}`, { token: token ?? '' }),
    enabled: !!token && !!slug,
    staleTime: 60_000,
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
    queryFn:  () => apiClient<{ activities: ActivityDoc[]; total: number }>(`/api/v1/admin/activities??${qs}`, { token: token ?? '' }),
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

export function useUploadActivityImage() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('image', file);
      return fetch(
        `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')}/api/v1/admin/content/image`,
        { method: 'POST', headers: { Authorization: `Bearer ${token ?? ''}` }, credentials: 'include', body: form },
      ).then(async r => {
        const json = await r.json();
        if (!r.ok) throw new Error(json?.message ?? 'Erreur upload image');
        return json as { data: { imageUrl: string; thumbnailUrl: string; mediumUrl: string; largeUrl: string } };
      });
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

export function useActivityInvitations(activityId?: string) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['activity-invitations', activityId],
    queryFn: () => apiClient<{ invitations: ActivityInvitationDoc[] }>(`/api/v1/admin/activities/${activityId}/invitations`, { token: token ?? '' }),
    enabled: Boolean(token && activityId),
    refetchInterval: 15_000,
  });
}

export function useRespondActivityInvitation(activityId: string, slug?: string) {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: 'present' | 'unsure' | 'absent') =>
      apiClient<{ invitation: ActivityInvitationDoc; qrDataUrl?: string; scanValue?: string }>(`/api/v1/member/activities/${activityId}/rsvp`, {
        method: 'POST',
        body: JSON.stringify({ status }),
        token: token ?? '',
      }),
    onMutate: async (status) => {
      await qc.cancelQueries({ queryKey: ['member-activities'] });
      if (slug) await qc.cancelQueries({ queryKey: ['member-activity', slug] });

      const prevList   = qc.getQueriesData<any>({ queryKey: ['member-activities'] });
      const prevDetail = slug ? qc.getQueryData<any>(['member-activity', slug]) : undefined;

      // Mise à jour optimiste de la liste
      qc.setQueriesData<any>({ queryKey: ['member-activities'] }, (old: any) => {
        if (!old?.data?.activities) return old;
        return {
          ...old,
          data: {
            ...old.data,
            activities: old.data.activities.map((a: any) =>
              a._id === activityId
                ? { ...a, myInvitation: { ...(a.myInvitation ?? {}), rsvpStatus: status } }
                : a
            ),
          },
        };
      });

      // Mise à jour optimiste de la fiche détail
      if (slug) {
        qc.setQueryData<any>(['member-activity', slug], (old: any) => {
          if (!old?.data?.myInvitation) return old;
          return {
            ...old,
            data: { ...old.data, myInvitation: { ...old.data.myInvitation, rsvpStatus: status } },
          };
        });
      }

      return { prevList, prevDetail };
    },
    onError: (err: Error, _status, ctx: any) => {
      ctx?.prevList?.forEach(([key, val]: [any, any]) => qc.setQueryData(key, val));
      if (slug && ctx?.prevDetail) qc.setQueryData(['member-activity', slug], ctx.prevDetail);
      toast.error(err.message);
    },
    onSuccess: (res, status) => {
      const inv = (res as any)?.data?.invitation as ActivityInvitationDoc | undefined;

      // Consolider avec la réponse serveur (évite le race condition du invalidateQueries+refetch)
      qc.setQueriesData<any>({ queryKey: ['member-activities'] }, (old: any) => {
        if (!old?.data?.activities) return old;
        return {
          ...old,
          data: {
            ...old.data,
            activities: old.data.activities.map((a: any) =>
              a._id === activityId
                ? { ...a, myInvitation: inv ?? { ...(a.myInvitation ?? {}), rsvpStatus: status } }
                : a
            ),
          },
        };
      });

      if (slug) {
        qc.setQueryData<any>(['member-activity', slug], (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: { ...old.data, myInvitation: inv ?? { ...(old.data.myInvitation ?? {}), rsvpStatus: status } },
          };
        });
      }

      toast.success((res as any).message ?? 'Présence confirmée');
    },
  });
}

export function useRemindActivityInvitations() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => apiClient<{ sent: number; total: number }>(`/api/v1/admin/activities/${activityId}/invitations/remind`, {
      method: 'POST',
      token: token ?? '',
    }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-activities'] });
      qc.invalidateQueries({ queryKey: ['activity-invitations'] });
      toast.success((res as any).message ?? 'Relance envoyee');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
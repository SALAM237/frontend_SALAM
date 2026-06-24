import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface SharedDocument {
  _id: string;
  title: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  mimeLabel: string;
  /** Fourni par la liste admin uniquement (sentTo n'est pas populé côté backend pour garder la réponse légère) */
  sentToCount?: number;
  sentTo: { _id: string; firstName?: string; lastName?: string }[];
  sentAll: boolean;
  sentAt: string | null;
  sendByEmail: boolean;
  uploadedBy: { _id: string; firstName?: string; lastName?: string } | null;
  createdAt: string;
}

/* ── Admin ──────────────────────────────────────────────── */
export function useAdminDocuments() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-documents'],
    queryFn:  () => apiClient<{ documents: SharedDocument[] }>('/api/v1/admin/documents', { token: token ?? '' }),
    enabled:  !!token,
    staleTime: 30_000,
  });
}

export function useUploadDocument() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) => {
      const form = new FormData();
      form.append('file', file);
      if (title) form.append('title', title);
      const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
      return fetch(`${base}/api/v1/admin/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        credentials: 'include',
        body: form,
      }).then(async r => {
        const json = await r.json();
        if (!r.ok) throw new Error(json?.message ?? 'Erreur upload');
        return json as { data: SharedDocument };
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-documents'] });
      toast.success('Document importé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSendDocument() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: ({ id, memberIds, sendAll, sendByEmail }: { id: string; memberIds?: string[]; sendAll?: boolean; sendByEmail?: boolean }) =>
      apiClient<{ sent: number }>(`/api/v1/admin/documents/${id}/send`, {
        method: 'POST',
        body:   JSON.stringify({ memberIds, sendAll, sendByEmail }),
        token:  token ?? '',
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-documents'] });
      toast.success((res as any).message ?? 'Document partagé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRenameDocument() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiClient<SharedDocument>(`/api/v1/admin/documents/${id}/rename`, {
        method: 'PATCH',
        body:   JSON.stringify({ title }),
        token:  token ?? '',
      }),
    onSuccess: (res) => {
      qc.setQueryData<{ data: { documents: SharedDocument[] } } | undefined>(
        ['admin-documents'],
        old => {
          if (!old?.data?.documents) return old;
          return {
            ...old,
            data: {
              ...old.data,
              documents: old.data.documents.map(d =>
                d._id === (res as any).data?._id ? { ...d, title: (res as any).data.title } : d
              ),
            },
          };
        },
      );
      toast.success('Document renommé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteDocument() {
  const token = useAuthStore(s => s.accessToken);
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/v1/admin/documents/${id}`, { method: 'DELETE', token: token ?? '' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-documents'] });
      toast.success('Document supprimé');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Member ─────────────────────────────────────────────── */
export function useMemberSharedDocuments() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['member-shared-documents'],
    queryFn:  () => apiClient<{ documents: SharedDocument[] }>('/api/v1/member/documents/shared', { token: token ?? '' }),
    enabled:  !!token,
    staleTime: 60_000,
  });
}

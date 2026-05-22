'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export type ChatLeadStatus = 'new' | 'contacted' | 'in_progress' | 'resolved' | 'closed';
export type ChatLeadTemperature = 'froid' | 'tiède' | 'chaud';
export type ChatLeadRequestType = 'adhesion' | 'orientation' | 'don' | 'partenariat' | 'benevolat' | 'evenement' | 'espace_membre' | 'contact' | 'autre';

export interface SalamChatLead {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  requestType: ChatLeadRequestType;
  profileType: string;
  score: number;
  temperature: ChatLeadTemperature;
  summary?: string;
  lastMessage?: string;
  conversation?: { role: 'user' | 'assistant'; content: string; sentAt?: string }[];
  status: ChatLeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SalamChatLeadFilters {
  status?: ChatLeadStatus | '';
  temperature?: ChatLeadTemperature | '';
  requestType?: ChatLeadRequestType | '';
  q?: string;
}

export function useAdminChatLeads(filters: SalamChatLeadFilters = {}) {
  const token = useAuthStore(s => s.accessToken);
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.temperature) params.set('temperature', filters.temperature);
  if (filters.requestType) params.set('requestType', filters.requestType);
  if (filters.q?.trim()) params.set('q', filters.q.trim());
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: ['admin-chat-leads', filters],
    queryFn: () => apiClient<{ items: SalamChatLead[]; total: number; page: number; pages: number }>(`/api/v1/admin/chat-leads${qs}`, { token: token ?? '' }),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useUpdateChatLeadStatus() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ChatLeadStatus }) =>
      apiClient<SalamChatLead>(`/api/v1/admin/chat-leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        token: token ?? '',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-chat-leads'] });
      toast.success('Lead chatbot mis à jour');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

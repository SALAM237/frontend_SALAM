'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export type AdminAiRole = 'user' | 'assistant';

export interface AdminAiMessagePayload {
  role: AdminAiRole;
  content: string;
}

export interface AdminAiAction {
  id: string;
  kind: 'cotisation_reminder' | 'navigation' | string;
  label: string;
  payload?: Record<string, unknown>;
}

export interface AdminAiResponse {
  reply: string;
  actions: AdminAiAction[];
  insights?: Record<string, unknown>;
}

export function useAdminAiAssistant() {
  const token = useAuthStore(s => s.accessToken);

  return useMutation({
    mutationFn: (vars: { messages: AdminAiMessagePayload[]; year?: number }) =>
      apiClient<AdminAiResponse>('/api/v1/admin/ai-assistant', {
        method: 'POST',
        body: JSON.stringify(vars),
        token: token ?? '',
      }),
  });
}

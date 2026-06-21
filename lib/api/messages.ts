import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export type MessageUser = { _id: string; firstName: string; lastName: string; avatar?: string };
export type InternalMessage = { _id: string; content: string; createdAt: string; read: boolean; sender: MessageUser | null };
export type Conversation = { _id: string; subject: string; updatedAt: string; participants: MessageUser[]; messages: InternalMessage[] };
export type MessageSpace = 'member' | 'admin';
const path = (space: MessageSpace) => `/api/v1/${space}/messages`;

export function useConversations(space: MessageSpace) {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({ queryKey: ['messages', space], queryFn: () => apiClient<Conversation[]>(path(space), { token: token ?? '' }), enabled: Boolean(token), refetchInterval: 20_000 });
}
export function useSendInternalMessage(space: MessageSpace) {
  const token = useAuthStore(s => s.accessToken); const qc = useQueryClient();
  return useMutation({ mutationFn: (body: { recipientIds: string[]; subject: string; content: string }) => apiClient(path(space), { method: 'POST', token: token ?? '', body: JSON.stringify(body) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', space] }) });
}
export function useReplyInternalMessage(space: MessageSpace) {
  const token = useAuthStore(s => s.accessToken); const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, content }: { id: string; content: string }) => apiClient(`${path(space)}/${id}/reply`, { method: 'POST', token: token ?? '', body: JSON.stringify({ content }) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', space] }) });
}
export function useMarkConversationRead(space: MessageSpace) {
  const token = useAuthStore(s => s.accessToken); const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient(`${path(space)}/${id}/read`, { method: 'PATCH', token: token ?? '' }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['messages', space] }); qc.invalidateQueries({ queryKey: ['notifications'] }); } });
}
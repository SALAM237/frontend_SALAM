import { useMutation } from '@tanstack/react-query';
import { apiClient }   from './client';

/* ── Contact ─────────────────────────────────────────────────── */
interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  _honey?: string;
}

export function useContactForm() {
  return useMutation({
    mutationFn: (data: ContactPayload) =>
      apiClient('/api/v1/public/contact', { method: 'POST', body: JSON.stringify(data) }),
  });
}

/* ── Adhésion ────────────────────────────────────────────────── */
interface AdhesionPayload {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  type: string;
  motivation: string;
  phone?: string;
  _honey?: string;
}

export function useAdhesionForm() {
  return useMutation({
    mutationFn: (data: AdhesionPayload) =>
      apiClient('/api/v1/public/adhesion', { method: 'POST', body: JSON.stringify(data) }),
  });
}

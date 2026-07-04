import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface CampaignRecipientDoc {
  userId: string;
  email: string;
  status: 'sent' | 'failed';
  reason?: string;
  /* true si ce destinataire remplissait déjà les 2 conditions (inscrit + profil
     complet) au moment de l'envoi — il a reçu directement le mail de
     confirmation de crédit plutôt que le mail d'invitation. */
  giftCreditedImmediately?: boolean;
}

export interface CampaignDoc {
  _id: string;
  type: 'cadeau_salam';
  title: string;
  giftName: string;
  packageCount: number;
  /* Montant de cauris crédité automatiquement dès que le membre remplit les 2
     conditions (inscrit + profil complet) avant la date limite. */
  cauriAmount: number;
  deadline: string;
  imageUrl?: string;
  recipients: CampaignRecipientDoc[];
  sentCount: number;
  failedCount: number;
  stoppedEarly: boolean;
  createdBy?: { firstName: string; lastName: string };
  createdAt: string;
}

export function useAdminCampaigns() {
  const token = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => apiClient<CampaignDoc[]>('/api/v1/admin/marketing/campaigns', { token: token ?? '' }),
    enabled: !!token,
  });
}

export function useCreateCampaign() {
  const token = useAuthStore(s => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      giftName: string;
      packageCount: number;
      cauriAmount: number;
      deadline: string;
      imageUrl?: string;
      recipientIds: string[];
    }) =>
      apiClient<{ campaign: CampaignDoc; sent: number; failed: number; stoppedEarly: boolean }>('/api/v1/admin/marketing/campaigns', {
        method: 'POST',
        body: JSON.stringify(body),
        token: token ?? '',
      }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['admin-campaigns'] });
      const data = res.data;
      if (data && data.failed > 0) {
        toast.warning(`${data.sent} email(s) envoyé(s), ${data.failed} échec(s)${data.stoppedEarly ? ' — limite d\'envoi atteinte' : ''}. Voir Gestion Erreurs pour le détail.`);
      } else {
        toast.success(res.message ?? 'Campagne envoyée');
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUploadCampaignImage() {
  const token = useAuthStore(s => s.accessToken);
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('image', file);
      return apiClient<{ imageUrl: string }>('/api/v1/admin/marketing/image', {
        method: 'POST',
        body: form,
        token: token ?? '',
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

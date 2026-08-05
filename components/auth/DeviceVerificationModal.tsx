'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MailWarning, ShieldX, X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import type { AuthUser } from '@/store/auth.store';

type ChallengeStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export function DeviceVerificationModal({ challengeId, onApproved, onClose }: {
  challengeId: string;
  onApproved: (user: AuthUser, accessToken: string) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<ChallengeStatus>('pending');
  const [message, setMessage] = useState("Un email de verification vient d'etre envoye. Consultez votre boite mail, puis cliquez sur le bouton d'autorisation pour finaliser la connexion sur cet appareil.");

  useEffect(() => {
    if (!challengeId || status !== 'pending') return;
    let cancelled = false;
    let busy = false;
    const poll = async () => {
      if (busy || cancelled) return;
      busy = true;
      try {
        const res = await apiClient<{ status: ChallengeStatus; accessToken?: string }>(`/api/v1/auth/device-challenge/${encodeURIComponent(challengeId)}/status`, { method: 'GET' });
        if (cancelled) return;
        if (res.data.status === 'pending') return;
        setStatus(res.data.status);
        if (res.data.status === 'approved') {
          if (!res.data.accessToken) throw new Error('Session manquante apres autorisation.');
          const sessionRes = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ accessToken: res.data.accessToken }),
          });
          if (!sessionRes.ok) throw new Error('Impossible de finaliser la session.');
          const sessionJson: { user?: AuthUser } = await sessionRes.json();
          if (!sessionJson.user) throw new Error('Utilisateur introuvable apres autorisation.');
          setMessage('Connexion autorisee. Redirection en cours...');
          onApproved(sessionJson.user, res.data.accessToken);
          return;
        }
        setMessage(res.data.status === 'rejected'
          ? 'Connexion refusee depuis votre email. La demande est annulee.'
          : 'Le delai de verification est expire. Relancez la connexion.');
      } catch (err) {
        if (!cancelled) {
          setStatus('expired');
          setMessage(err instanceof Error ? err.message : 'Verification impossible. Relancez la connexion.');
        }
      } finally {
        busy = false;
      }
    };
    poll();
    const timer = window.setInterval(poll, 3000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [challengeId, onApproved, status]);

  const Icon = status === 'approved' ? CheckCircle2 : status === 'rejected' || status === 'expired' ? ShieldX : MailWarning;
  const tone = status === 'approved' ? 'emerald' : status === 'rejected' || status === 'expired' ? 'red' : 'amber';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-verification-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={onClose}
      onTouchStart={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onMouseDown={event => event.stopPropagation()}
        onTouchStart={event => event.stopPropagation()}
      >
        <div className={`flex items-start justify-between gap-4 border-b p-5 ${tone === 'red' ? 'border-red-100 bg-red-50/70' : tone === 'emerald' ? 'border-emerald-100 bg-emerald-50/70' : 'border-amber-100 bg-amber-50/70'}`}>
          <div className="flex min-w-0 items-start gap-3">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tone === 'red' ? 'bg-red-100 text-red-700' : tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <Icon size={19} />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${tone === 'red' ? 'text-red-700' : tone === 'emerald' ? 'text-emerald-700' : 'text-amber-700'}`}>Verification de connexion</p>
              <h2 id="device-verification-title" className="mt-1 text-lg font-black leading-tight text-neutral-900">
                {status === 'pending' ? 'Email de verification envoye' : status === 'approved' ? 'Connexion autorisee' : 'Demande terminee'}
              </h2>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-white hover:text-neutral-700">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <p className="text-sm leading-6 text-neutral-600">{message}</p>
          {status === 'pending' && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs font-semibold leading-5 text-amber-800">
              <Loader2 size={13} className="shrink-0 animate-spin" />
              En attente de validation...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
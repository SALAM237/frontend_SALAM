'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, MailWarning, RefreshCw, ShieldX, X } from 'lucide-react';
import type { AuthUser } from '@/store/auth.store';
import {
  clearDeviceChallenge,
  finalizeDeviceChallengeSession,
  type DeviceChallengeStatus,
} from '@/lib/auth/device-verification';

const DEVICE_VERIFY_EVENT_KEY = 'salam:device-verification:event';

export function notifyDeviceVerificationEvent(status: 'approved' | 'rejected') {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DEVICE_VERIFY_EVENT_KEY, JSON.stringify({ status, at: Date.now() }));
  } catch { /* localStorage peut etre bloque, le polling/focus restent actifs */ }
}

export function DeviceVerificationModal({ challengeId, onApproved, onClose }: {
  challengeId: string;
  onApproved: (user: AuthUser, accessToken: string) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<DeviceChallengeStatus>('pending');
  const [message, setMessage] = useState("Un email de verification vient d'etre envoye. Consultez votre boite mail, puis cliquez sur le bouton d'autorisation pour finaliser la connexion sur cet appareil.");
  const [checking, setChecking] = useState(false);
  const busyRef = useRef(false);
  const doneRef = useRef(false);
  const onApprovedRef = useRef(onApproved);

  useEffect(() => { onApprovedRef.current = onApproved; }, [onApproved]);

  const poll = useCallback(async () => {
    if (!challengeId || busyRef.current || doneRef.current) return;
    busyRef.current = true;
    setChecking(true);
    try {
      const result = await finalizeDeviceChallengeSession(challengeId);
      if (doneRef.current) return;
      if (result.status === 'pending') return;
      doneRef.current = true;
      setStatus(result.status);
      if (result.status === 'approved') {
        if (!result.accessToken || !result.user) throw new Error('Session manquante apres autorisation.');
        setMessage('Connexion autorisee. Redirection en cours...');
        onApprovedRef.current(result.user, result.accessToken);
        return;
      }
      clearDeviceChallenge(challengeId);
      setMessage(result.status === 'rejected'
        ? 'Connexion refusee depuis votre email. La demande est annulee.'
        : 'Le delai de verification est expire. Relancez la connexion.');
    } catch (err) {
      if (!doneRef.current) {
        doneRef.current = true;
        setStatus('expired');
        setMessage(err instanceof Error ? err.message : 'Verification impossible. Relancez la connexion.');
      }
    } finally {
      busyRef.current = false;
      setChecking(false);
    }
  }, [challengeId]);

  useEffect(() => {
    doneRef.current = false;
    setStatus('pending');
    setMessage("Un email de verification vient d'etre envoye. Consultez votre boite mail, puis cliquez sur le bouton d'autorisation pour finaliser la connexion sur cet appareil.");
    void poll();
    const timer = window.setInterval(() => { void poll(); }, 3000);
    const verifyNow = () => { if (!document.hidden) void poll(); };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DEVICE_VERIFY_EVENT_KEY) return;
      try {
        const payload = event.newValue ? JSON.parse(event.newValue) as { status?: string } : null;
        if (payload?.status === 'approved') {
          doneRef.current = true;
          setStatus('approved');
          setMessage('Connexion autorisee et finalisee dans un autre onglet de ce navigateur.');
          clearDeviceChallenge(challengeId);
          return;
        }
        if (payload?.status === 'rejected') {
          doneRef.current = true;
          setStatus('rejected');
          setMessage('Connexion refusee depuis votre email. La demande est annulee.');
          clearDeviceChallenge(challengeId);
          return;
        }
      } catch {
        // Ancien signal local : on retombe sur la verification serveur.
      }
      void poll();
    };
    window.addEventListener('focus', verifyNow);
    document.addEventListener('visibilitychange', verifyNow);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', verifyNow);
      document.removeEventListener('visibilitychange', verifyNow);
      window.removeEventListener('storage', handleStorage);
    };
  }, [challengeId, poll]);

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
            <>
              <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs font-semibold leading-5 text-amber-800">
                <Loader2 size={13} className="shrink-0 animate-spin" />
                En attente de validation...
              </div>
              <button
                type="button"
                onClick={() => { void poll(); }}
                disabled={checking}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-3 text-xs font-black text-amber-700 transition hover:bg-amber-50 disabled:opacity-60"
              >
                {checking ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                J'ai autorise, verifier maintenant
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


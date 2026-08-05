'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore, type AuthUser } from '@/store/auth.store';

function VerifyDeviceContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'approved' | 'rejected' | 'error'>('loading');
  const [message, setMessage] = useState('Validation de la connexion en cours...');
  const [count, setCount] = useState(4);

  useEffect(() => {
    let cancelled = false;
    const token = params.get('token') ?? '';
    const action = params.get('action') === 'reject' ? 'reject' : 'approve';

    async function run() {
      if (!token) {
        setStatus('error');
        setMessage('Lien de validation invalide.');
        return;
      }

      try {
        const res = await apiClient<{ action: 'approved' | 'rejected'; accessToken?: string; nextUrl?: string }>(
          `/api/v1/auth/verify-device?token=${encodeURIComponent(token)}&action=${action}`,
          { method: 'GET' },
        );
        if (cancelled) return;

        if (res.data.action === 'rejected') {
          setStatus('rejected');
          setMessage(res.message || 'Connexion refusee. Votre compte a ete securise.');
          return;
        }

        if (!res.data.accessToken) throw new Error('Token de session manquant apres validation.');
        const sessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ accessToken: res.data.accessToken }),
        });
        if (!sessionRes.ok) throw new Error('Impossible de finaliser la session.');
        const sessionJson: { user?: AuthUser } = await sessionRes.json();
        if (!sessionJson.user) throw new Error('Utilisateur introuvable apres validation.');

        setAuth(sessionJson.user, res.data.accessToken);
        setStatus('approved');
        setMessage('Appareil verifie. Redirection vers votre espace...');
        const target = res.data.nextUrl || '/choisir-espace';
        let remaining = 4;
        const timer = window.setInterval(() => {
          remaining -= 1;
          setCount(remaining);
          if (remaining <= 0) {
            window.clearInterval(timer);
            router.replace(target);
          }
        }, 1000);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Lien expire ou deja utilise.');
      }
    }

    run();
    return () => { cancelled = true; };
  }, [params, router, setAuth]);

  const Icon = status === 'approved' ? CheckCircle2 : status === 'rejected' ? ShieldX : status === 'loading' ? Loader2 : ShieldX;
  const iconClass = status === 'approved' ? 'text-emerald-600' : status === 'rejected' || status === 'error' ? 'text-red-600' : 'animate-spin text-emerald-600';

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f6] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-50">
          <Icon size={28} className={iconClass} />
        </div>
        <h1 className="text-xl font-black text-neutral-900">Validation de connexion</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">{message}</p>
        {status === 'approved' && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            Acces dans {count}...
          </p>
        )}
        {(status === 'rejected' || status === 'error') && (
          <Link href="/auth/login" className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700">
            Retour a la connexion
          </Link>
        )}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-semibold text-neutral-400">
          <ShieldCheck size={13} /> Verification securisee SALAM
        </div>
      </section>
    </main>
  );
}

export default function VerifyDevicePage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#f7f8f6]"><Loader2 className="animate-spin text-emerald-600" /></div>}>
      <VerifyDeviceContent />
    </Suspense>
  );
}
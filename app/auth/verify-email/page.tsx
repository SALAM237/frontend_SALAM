'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien de vérification manquant ou invalide.');
      return;
    }

    apiClient(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Lien invalide ou expiré.');
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-5 py-8">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="text-sm text-neutral-500">Vérification en cours…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <CheckCircle size={28} className="text-emerald-600" />
        </div>
        <div>
          <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
            Email confirmé<span className="text-emerald-600"> !</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Votre adresse e-mail a été vérifiée avec succès. Vous pouvez maintenant vous connecter à votre espace membre.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
          <p className="text-xs leading-relaxed text-emerald-700">
            Votre compte est en cours de validation par le bureau de SALAM. Vous recevrez un e-mail dès qu&apos;il sera activé.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
        <XCircle size={28} className="text-red-500" />
      </div>
      <div>
        <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
          Lien invalide<span className="text-red-500"> !</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          {message}
        </p>
      </div>
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3.5">
        <p className="text-xs leading-relaxed text-red-700">
          Le lien de vérification expire après <strong>24 heures</strong>. Si votre lien a expiré, créez un nouveau compte ou contactez-nous.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/auth/register"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          Créer un nouveau compte
        </Link>
        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center gap-5 py-8">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="text-sm text-neutral-500">Chargement…</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

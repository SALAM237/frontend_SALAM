'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Mail } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Veuillez saisir votre adresse e-mail.'); return; }
    setError('');
    setLoading(true);

    try {
      await apiClient('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <Mail size={24} className="text-emerald-700" />
        </div>
        <div>
          <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
            E-mail envoyé<span className="text-emerald-600"> !</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Un lien de réinitialisation a été envoyé à{' '}
            <span className="font-bold text-neutral-700">{email}</span>.
            Vérifiez votre boîte de réception et vos spams.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
          <p className="text-xs leading-relaxed text-emerald-700">
            Le lien expire dans <strong>15 minutes</strong>. Si vous ne recevez rien, vérifiez l&apos;adresse saisie et réessayez.
          </p>
        </div>
        <button onClick={() => { setSent(false); setEmail(''); }}
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-600">
          Réessayer avec une autre adresse
        </button>
        <div className="pt-2">
          <Link href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-neutral-600">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
          Mot de passe<span className="text-emerald-600"> oublié ?</span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Saisissez l&apos;adresse e-mail associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
            Adresse e-mail
          </label>
          <input
            id="email" type="email" autoComplete="email" required
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:ring-2 ${
              error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15'
                    : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'
            }`}
          />
          {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : (
            <>Envoyer le lien <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
          )}
        </button>
      </form>

      <Link href="/auth/login"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-neutral-600">
        <ArrowLeft size={14} /> Retour à la connexion
      </Link>
    </div>
  );
}

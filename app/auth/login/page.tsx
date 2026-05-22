'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, MailWarning, RefreshCw, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore, type AuthUser } from '@/store/auth.store';
import { getPostLoginRedirect } from '@/lib/auth/roles';

/* Refuse les redirections vers des URLs externes (open-redirect guard) */
function safeRedirect(url: string | null, fallback: string): string {
  if (!url || !url.startsWith('/') || url.startsWith('//')) return fallback;
  return url;
}

const PENDING_MSG = 'Veuillez vérifier votre email avant de vous connecter';

function LoginForm() {
  const router          = useRouter();
  const searchParams    = useSearchParams();
  const { setAuth } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [needsVerify, setNeedsVerify]   = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerify(false);
    setResendStatus('idle');
    setLoading(true);

    try {
      const res = await apiClient<{ accessToken: string; requires2FA: boolean }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );

      if (res.data.requires2FA) {
        setError('Authentification 2FA requise — fonctionnalité disponible prochainement.');
        return;
      }

      const me = await apiClient<AuthUser>('/api/v1/auth/me', {
        token: res.data.accessToken,
      });

      // Poser les cookies httpOnly sécurisés (salam_access + salam_role)
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ accessToken: res.data.accessToken }),
      });

      setAuth(me.data, res.data.accessToken);
      const fallback   = getPostLoginRedirect(me.data);
      const redirectTo = safeRedirect(searchParams.get('redirect'), fallback);
      router.push(redirectTo);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      if (msg === PENDING_MSG) {
        setNeedsVerify(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('loading');
    try {
      await apiClient('/api/v1/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch {
      // réponse silencieuse côté backend — on affiche "envoyé" dans tous les cas
    }
    setResendStatus('sent');
  };

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
          Bon retour<span className="text-emerald-600"> !</span>
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Connectez-vous à votre espace membre SALAM.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
            Adresse e-mail <span className="text-red-500">*</span>
          </label>
          <input
            id="email" type="email" autoComplete="email" required
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <Link href="/auth/forgot-password" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password" type={showPwd ? 'text' : 'password'}
              autoComplete="current-password" required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-11 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Erreur générique */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <p className="text-xs leading-relaxed text-red-700">{error}</p>
          </div>
        )}

        {/* Erreur email non vérifié + option de renvoi */}
        {needsVerify && (
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <p className="text-xs leading-relaxed text-red-700">{PENDING_MSG}</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-3">
              <div className="flex items-start gap-2.5">
                <MailWarning size={15} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-800">
                  Vous n&apos;avez pas reçu l&apos;email de confirmation ?? Cliquez sur le bouton ci-dessous pour recevoir un nouveau lien.
                </p>
              </div>

              {resendStatus === 'sent' ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2.5">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-700">
                    Email renvoyé ! Vérifiez votre boîte mail (et les spams).
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === 'loading'}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2.5 text-xs font-black text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                >
                  {resendStatus === 'loading'
                    ? <Loader2 size={12} className="animate-spin" />
                    : <RefreshCw size={12} />
                  }
                  Renvoyer le lien de vérification
                </button>
              )}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : (
            <>Se connecter <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
        <div className="relative flex justify-center">
          <span className="bg-[#f7f8f6] px-3 text-[11px] font-semibold text-neutral-400">ou</span>
        </div>
      </div>

      <p className="text-center text-sm text-neutral-500">
        Pas encore membre ??{' '}
        <Link href="/auth/register" className="font-black text-emerald-700 hover:text-emerald-600">
          Créer mon compte
        </Link>
      </p>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-9 w-48 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded bg-neutral-50 animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-12 rounded-xl bg-neutral-100 animate-pulse" />
        <div className="h-12 rounded-xl bg-neutral-100 animate-pulse" />
        <div className="h-12 rounded-xl bg-emerald-100 animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

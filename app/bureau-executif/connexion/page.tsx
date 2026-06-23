'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, ShieldAlert, MailWarning, RefreshCw, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';
import { useAuthStore, type AuthUser } from '@/store/auth.store';
import { hasAdminRole } from '@/lib/auth/roles';

const PENDING_MSG = 'Veuillez vérifier votre email avant de vous connecter';

export default function BureauConnexionPage() {
  const router = useRouter();
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
        setError('Authentification 2FA requise - fonctionnalit?? disponible prochainement.');
        return;
      }

      const me = await apiClient<AuthUser>('/api/v1/auth/me', { token: res.data.accessToken });

      if (!hasAdminRole(me.data)) {
        setError('Accès refusé. Cette page est réservée aux membres du Bureau Exécutif.');
        return;
      }

      // Poser les cookies httpOnly sécurisés (salam_access + salam_role)
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ accessToken: res.data.accessToken }),
      });

      setAuth(me.data, res.data.accessToken);
      router.push('/admin/dashboard');
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
    } catch { /* réponse silencieuse */ }
    setResendStatus('sent');
  };

  return (
    <div className="flex min-h-screen">

      {/* Panneau gauche - identite Bureau */}
      <div className="relative hidden w-[480px] shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#030a05] via-[#05120b] to-[#030a05] lg:flex xl:w-[520px]">

        {/* Texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        {/* Motif ndop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.15] lg:opacity-[0.12]"
          style={{
            backgroundImage: "url('/images/placeholders/ndop motif WBG.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Lueur centrale ambrée/or */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600/5 blur-[80px]" />

        {/* Flag stripe */}
        <div className="h-[4px] w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />

        <div className="relative flex flex-1 flex-col px-10 py-10 xl:px-12">

          {/* Logo */}
          <Link href="/" className="group flex w-fit items-center gap-3">
            <Image src="/images/logo/logo_salam_96.webp" alt="SALAM" width={40} height={40}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-emerald-500/30 transition group-hover:ring-emerald-400/60" priority />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-white">SALAM</p>
              <p className="text-[9px] font-semibold tracking-[0.18em] text-white/30">ASSOCIATION</p>
            </div>
          </Link>

          {/* Contenu central */}
          <div className="flex flex-1 flex-col justify-center gap-10">

            <div>
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                <ShieldAlert size={10} />
                Accès institutionnel
              </span>
              <h1 className="text-[2rem] font-black leading-[1.1] tracking-[-0.04em] text-white xl:text-[2.4rem]">
                Bureau Exécutif<br />
                <span className="text-amber-400/80">SALAM.</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/40">
                Espace sécurisé réservé aux membres du bureau. Toutes les actions sont tracées et auditées.
              </p>
            </div>

            {/* Info sécurité */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/20">Accès autorisés</p>
              <ul className="space-y-1.5 text-xs text-white/35">
                {['Président', 'Secrétaire Général', 'Trésorier', 'Membres du bureau', 'Super Administrateur'].map(role => (
                  <li key={role} className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-amber-500/50" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-white/20">
            © {new Date().getFullYear()} Association SALAM · Accès sécurisé
          </p>
        </div>
      </div>

      {/* Panneau droit - formulaire */}
      <div className="flex flex-1 flex-col bg-[#f7f8f6]">

        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b border-neutral-200/80 bg-white px-5 py-4 lg:hidden">
          <div className="h-[3px] w-6 rounded-full"
            style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo/logo_salam_96.webp" alt="SALAM" width={28} height={28} className="h-7 w-7 rounded-full object-cover" priority />
            <span className="text-sm font-black tracking-[0.15em] text-neutral-800">SALAM</span>
          </Link>
        </div>

        <div className="hidden justify-end px-8 pt-6 lg:flex">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-neutral-500 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
          >
            <span aria-hidden="true">&larr;</span>
            Retour au site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md space-y-8">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">
                  Accès sécurisé
                </span>
              </div>
              <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
                Bureau Exécutif<span className="text-amber-600"> .</span>
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Connectez-vous avec votre compte bureau pour accéder à l'espace d'administration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <label htmlFor="be-email" className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                  Adresse e-mail
                </label>
                <input
                  id="be-email" type="email" autoComplete="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="be-password" className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Mot de passe
                  </label>
                  <Link href="/auth/forgot-password" className="text-[11px] font-semibold text-amber-600 hover:text-amber-700">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="be-password" type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password" required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
                    className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-11 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Erreur générique */}
              {error && (
                <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <p className="text-xs leading-relaxed text-red-700">{error}</p>
                </div>
              )}

              {/* Email non vérifié */}
              {needsVerify && (
                <div className="space-y-2">
                  <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <p className="text-xs leading-relaxed text-red-700">{PENDING_MSG}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <MailWarning size={15} className="mt-0.5 shrink-0 text-amber-600" />
                      <p className="text-xs leading-relaxed text-amber-800">
                        Vous n&apos;avez pas reçu l&apos;email ?? Cliquez ci-dessous pour en recevoir un nouveau.
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
                      <button type="button" onClick={handleResend} disabled={resendStatus === 'loading'}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2.5 text-xs font-black text-amber-700 transition hover:bg-amber-100 disabled:opacity-60">
                        {resendStatus === 'loading' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        Renvoyer le lien de vérification
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : (
                  <>Accéder au Bureau <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs text-neutral-400">
                Vous êtes un membre ??{' '}
                <Link href="/auth/login" className="font-black text-emerald-700 hover:text-emerald-600">
                  Espace membre
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


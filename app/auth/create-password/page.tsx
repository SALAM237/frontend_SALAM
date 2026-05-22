'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle, XCircle, KeyRound } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';

function CreatePasswordContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token');
  const clearAuth    = useAuthStore(s => s.clearAuth);
  const setAuth      = useAuthStore(s => s.setAuth);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errors, setErrors]     = useState<{ password?: string; confirm?: string; global?: string }>({});

  useEffect(() => {
    clearAuth();
    fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
  }, [clearAuth]);

  const pwdStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 10)           s++;
    if (/[A-Z]/.test(password))         s++;
    if (/[0-9]/.test(password))         s++;
    if (/[^A-Za-z0-9]/.test(password))  s++;
    return s;
  })();

  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort', 'Excellent'][pwdStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-emerald-500', 'bg-emerald-600'][pwdStrength];

  if (!token) {
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
            Ce lien d&apos;invitation est incorrect ou a expiré. Contactez votre administrateur pour recevoir une nouvelle invitation.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <CheckCircle size={28} className="text-emerald-600" />
        </div>
        <div>
          <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
            Compte<span className="text-emerald-600"> activé !</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Votre mot de passe a été créé et votre compte est maintenant actif. Vous allez être redirigé vers la connexion.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
          <p className="text-xs leading-relaxed text-emerald-700">
            Un e-mail de bienvenue vous a été envoyé. Conservez vos identifiants en lieu sûr.
          </p>
        </div>
        <button
          onClick={() => router.push('/member/profil?complete=1')}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          Se connecter <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    );
  }

  const validate = () => {
    const e: typeof errors = {};
    if (password.length < 8)             e.password = 'Minimum 8 caractères';
    else if (!/[A-Z]/.test(password))    e.password = 'Doit contenir une majuscule';
    else if (!/[a-z]/.test(password))    e.password = 'Doit contenir une minuscule';
    else if (!/[0-9]/.test(password))    e.password = 'Doit contenir un chiffre';
    else if (/^[A-Za-z0-9]*$/.test(password)) e.password = 'Doit contenir un caractère spécial';
    if (password !== confirm)            e.confirm  = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    setLoading(true);

    try {
      clearAuth();
      await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
      const activated = await apiClient<{ accessToken: string; user: any; nextUrl?: string }>('/api/v1/auth/activate', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: activated.data.accessToken }),
      }).catch(() => {});
      setAuth(activated.data.user, activated.data.accessToken);
      setSuccess(true);
      setTimeout(() => router.push(activated.data.nextUrl ?? '/member/profil?complete=1'), 1200);
    } catch (err: unknown) {
      setErrors({ global: err instanceof Error ? err.message : 'Lien d\'invitation invalide ou expiré.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
        <KeyRound size={26} className="text-emerald-600" />
      </div>

      <div>
        <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
          Créez votre<span className="text-emerald-600"> mot de passe</span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Choisissez un mot de passe fort pour activer votre compte SALAM.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>

        {/* Mot de passe */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-white py-3 pl-4 pr-11 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:ring-2 ${
                errors.password
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15'
                  : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-red-500">{errors.password}</p>}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength ? strengthColor : 'bg-neutral-200'}`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-neutral-400">
                Force : <span className="font-bold text-neutral-600">{strengthLabel}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirmation */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
            Confirmer le mot de passe <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConf ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-white py-3 pl-4 pr-11 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:ring-2 ${
                errors.confirm
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15'
                  : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConf(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirm && <p className="text-[11px] text-red-500">{errors.confirm}</p>}
        </div>

        {errors.global && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <p className="text-xs leading-relaxed text-red-700">{errors.global}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>Activer mon compte <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
          )}
        </button>
      </form>

      <Link
        href="/auth/login"
        className="block text-center text-sm font-semibold text-neutral-400 hover:text-neutral-600"
      >
        Retour à la connexion
      </Link>
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center gap-5 py-8">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="text-sm text-neutral-500">Chargement…</p>
      </div>
    }>
      <CreatePasswordContent />
    </Suspense>
  );
}

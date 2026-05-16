'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [remember, setRemember]   = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Placeholder — à connecter au backend
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
  };

  return (
    <div className="space-y-8">

      {/* En-tête */}
      <div>
        <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
          Bon retour<span className="text-emerald-600"> !</span>
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Connectez-vous à votre espace membre SALAM.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
          />
        </div>

        {/* Mot de passe */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Mot de passe
            </label>
            <Link href="/auth/forgot-password" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-11 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Se souvenir */}
        <label className="flex cursor-pointer items-center gap-2.5">
          <div className="relative">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-4 w-4 rounded border border-neutral-300 bg-white transition peer-checked:border-emerald-600 peer-checked:bg-emerald-600" />
            <svg className="pointer-events-none absolute inset-0 m-auto h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 12 10">
              <path d="M1.5 5L4.5 8L10.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xs text-neutral-600">Se souvenir de moi</span>
        </label>

        {/* Message d'erreur */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <p className="text-xs leading-relaxed text-red-700">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Se connecter
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#f7f8f6] px-3 text-[11px] font-semibold text-neutral-400">ou</span>
        </div>
      </div>

      {/* Lien inscription */}
      <p className="text-center text-sm text-neutral-500">
        Pas encore membre ?{' '}
        <Link href="/auth/register" className="font-black text-emerald-700 hover:text-emerald-600">
          Créer mon compte
        </Link>
      </p>
    </div>
  );
}

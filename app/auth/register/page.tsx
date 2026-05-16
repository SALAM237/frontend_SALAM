'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2, ChevronDown } from 'lucide-react';

const PAYS = [
  'Maroc', 'Cameroun', 'France', 'Belgique', 'Canada', 'Espagne',
  'Allemagne', 'Italie', 'Sénégal', 'Côte d\'Ivoire', 'Autre',
];

const FILIERES = [
  'Informatique & Numérique', 'Ingénierie & Industrie', 'Médecine & Santé',
  'Droit & Sciences politiques', 'Commerce & Gestion', 'Architecture & BTP',
  'Sciences fondamentales', 'Lettres & Sciences humaines', 'Autre',
];

type Step = 1 | 2;

interface FormData {
  firstName: string; lastName: string;
  email: string; phone: string;
  pays: string; filiere: string;
  password: string; confirm: string;
  cgu: boolean;
}

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  pays: '', filiere: '', password: '', confirm: '', cgu: false,
};

export default function RegisterPage() {
  const [step, setStep]         = useState<Step>(1);
  const [form, setForm]         = useState<FormData>(EMPTY);
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Partial<Record<keyof FormData | 'global', string>>>({});

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = 'Champ requis';
    if (!form.lastName.trim())  e.lastName  = 'Champ requis';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'E-mail invalide';
    if (!form.pays)    e.pays    = 'Sélectionnez un pays';
    if (!form.filiere) e.filiere = 'Sélectionnez une filière';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    if (form.password.length < 8)         e.password = 'Minimum 8 caractères';
    if (form.password !== form.confirm)   e.confirm  = 'Les mots de passe ne correspondent pas';
    if (!form.cgu) e.cgu = 'Vous devez accepter les conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    // Placeholder — à connecter au backend
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
  };

  const pwdStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)         s++;
    if (/[A-Z]/.test(p))      s++;
    if (/[0-9]/.test(p))      s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort', 'Excellent'][pwdStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-emerald-500', 'bg-emerald-600'][pwdStrength];

  return (
    <div className="space-y-7">

      {/* En-tête */}
      <div>
        <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
          Rejoindre <span className="text-emerald-600">SALAM</span>
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Créez votre compte membre en quelques minutes.
        </p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2">
        {([1, 2] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-neutral-200" />}
            <div className="flex items-center gap-1.5">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                step === s
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : step > s
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-neutral-100 text-neutral-400'
              }`}>
                {step > s ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 12 10">
                    <path d="M1.5 5L4.5 8L10.5 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : s}
              </div>
              <span className={`text-[11px] font-bold ${step === s ? 'text-neutral-800' : 'text-neutral-400'}`}>
                {s === 1 ? 'Informations' : 'Sécurité'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Étape 1 — Informations personnelles ── */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4" noValidate>

          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" error={errors.firstName}>
              <input
                type="text" autoComplete="given-name" required
                value={form.firstName} onChange={e => set('firstName', e.target.value)}
                placeholder="Jean"
                className={inputCls(!!errors.firstName)}
              />
            </Field>
            <Field label="Nom" error={errors.lastName}>
              <input
                type="text" autoComplete="family-name" required
                value={form.lastName} onChange={e => set('lastName', e.target.value)}
                placeholder="Kamga"
                className={inputCls(!!errors.lastName)}
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Adresse e-mail" error={errors.email}>
            <input
              type="email" autoComplete="email" required
              value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="vous@exemple.com"
              className={inputCls(!!errors.email)}
            />
          </Field>

          {/* Téléphone */}
          <Field label="Téléphone (optionnel)">
            <input
              type="tel" autoComplete="tel"
              value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+212 6 00 00 00 00"
              className={inputCls(false)}
            />
          </Field>

          {/* Pays */}
          <Field label="Pays de résidence" error={errors.pays}>
            <div className="relative">
              <select
                value={form.pays} onChange={e => set('pays', e.target.value)}
                className={`${inputCls(!!errors.pays)} appearance-none pr-9`}
              >
                <option value="">Sélectionner…</option>
                {PAYS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </Field>

          {/* Filière */}
          <Field label="Filière / Domaine d'études" error={errors.filiere}>
            <div className="relative">
              <select
                value={form.filiere} onChange={e => set('filiere', e.target.value)}
                className={`${inputCls(!!errors.filiere)} appearance-none pr-9`}
              >
                <option value="">Sélectionner…</option>
                {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </Field>

          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            Continuer
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>
      )}

      {/* ── Étape 2 — Sécurité ── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Mot de passe */}
          <Field label="Mot de passe" error={errors.password}>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password" required
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••••"
                className={`${inputCls(!!errors.password)} pr-11`}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {/* Jauge force */}
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength ? strengthColor : 'bg-neutral-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400">Force : <span className="font-bold text-neutral-600">{strengthLabel}</span></p>
              </div>
            )}
          </Field>

          {/* Confirmation */}
          <Field label="Confirmer le mot de passe" error={errors.confirm}>
            <div className="relative">
              <input
                type={showConf ? 'text' : 'password'}
                autoComplete="new-password" required
                value={form.confirm} onChange={e => set('confirm', e.target.value)}
                placeholder="••••••••"
                className={`${inputCls(!!errors.confirm)} pr-11`}
              />
              <button type="button" onClick={() => setShowConf(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          {/* CGU */}
          <div className="space-y-1">
            <label className="flex cursor-pointer items-start gap-2.5">
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" checked={form.cgu} onChange={e => set('cgu', e.target.checked)} className="peer sr-only" />
                <div className={`h-4 w-4 rounded border bg-white transition peer-checked:border-emerald-600 peer-checked:bg-emerald-600 ${errors.cgu ? 'border-red-400' : 'border-neutral-300'}`} />
                <svg className="pointer-events-none absolute inset-0 m-auto h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 12 10">
                  <path d="M1.5 5L4.5 8L10.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs leading-relaxed text-neutral-600">
                J&apos;accepte les{' '}
                <Link href="/conditions" className="font-bold text-emerald-700 hover:underline">conditions d&apos;utilisation</Link>
                {' '}et la{' '}
                <Link href="/confidentialite" className="font-bold text-emerald-700 hover:underline">politique de confidentialité</Link>
                {' '}de SALAM.
              </span>
            </label>
            {errors.cgu && <p className="pl-6 text-[11px] text-red-500">{errors.cgu}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setStep(1); setErrors({}); }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-800"
            >
              <ArrowRight size={15} className="rotate-180" />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#f7f8f6] px-3 text-[11px] font-semibold text-neutral-400">ou</span>
        </div>
      </div>

      {/* Lien connexion */}
      <p className="text-center text-sm text-neutral-500">
        Déjà membre ?{' '}
        <Link href="/auth/login" className="font-black text-emerald-700 hover:text-emerald-600">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

// ── Helpers ──
function inputCls(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15'
      : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'
  }`;
}

function Field({
  label, error, children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

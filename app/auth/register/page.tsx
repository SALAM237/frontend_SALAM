'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2, ChevronDown, Mail } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { trackEvent, trackFormStart, trackFormSubmit, trackGenerateLead } from '@/lib/analytics';

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
  gender: '' | 'homme' | 'femme';
  firstName: string; lastName: string;
  email: string; phone: string;
  pays: string; filiere: string;
  promotionYear: string;
  password: string; confirm: string;
  cgu: boolean;
}

const EMPTY: FormData = {
  gender: '', firstName: '', lastName: '', email: '', phone: '',
  pays: '', filiere: '', promotionYear: '', password: '', confirm: '', cgu: false,
};

export default function RegisterPage() {
  const [step, setStep]         = useState<Step>(1);
  const [form, setForm]         = useState<FormData>(EMPTY);
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errors, setErrors]     = useState<Partial<Record<keyof FormData | 'global', string>>>({});
  const [pwDismiss, setPwDismiss] = useState(false);
  const [started, setStarted] = useState(false);

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.gender)           e.gender    = 'Sélectionnez votre civilité';
    if (!form.firstName.trim()) e.firstName = 'Champ requis';
    if (!form.lastName.trim())  e.lastName  = 'Champ requis';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'E-mail invalide';
    if (!form.pays)    e.pays    = 'Sélectionnez un pays';
    if (!form.filiere) e.filiere = 'Sélectionnez une filière';
    const py = Number(form.promotionYear);
    if (!form.promotionYear.trim() || isNaN(py) || py < 1970 || py > 2100)
      e.promotionYear = 'Année invalide (ex : 2022)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    if (!pwChecks.every(c => c.valid)) e.password = 'Le mot de passe ne remplit pas tous les critères';
    if (form.password !== form.confirm) e.confirm  = 'Les mots de passe ne correspondent pas';
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
    setErrors({});
    setLoading(true);

    try {
      await apiClient('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          gender:        form.gender,
          firstName:     form.firstName,
          lastName:      form.lastName,
          email:         form.email,
          password:      form.password,
          phone:         form.phone || undefined,
          promotionYear: Number(form.promotionYear),
        }),
      });
      trackFormSubmit('register', { country: form.pays, field: form.filiere });
      trackEvent('sign_up', { method: 'email' });
      trackEvent('member_registration', { method: 'email', country: form.pays, field: form.filiere });
      trackGenerateLead('member_registration', { country: form.pays });
      setSuccess(true);
    } catch (err: unknown) {
      setErrors({ global: err instanceof Error ? err.message : 'Erreur lors de l\'inscription' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormStart = () => {
    if (started) return;
    setStarted(true);
    trackFormStart('register');
  };

  const pwChecks = [
    { label: 'Au moins 8 caractères',             valid: form.password.length >= 8 },
    { label: 'Une majuscule',                      valid: /[A-Z]/.test(form.password) },
    { label: 'Une minuscule',                      valid: /[a-z]/.test(form.password) },
    { label: 'Un chiffre',                         valid: /[0-9]/.test(form.password) },
    { label: 'Un caractère spécial (-, @, !, …)',  valid: /[^A-Za-z0-9]/.test(form.password) },
  ];
  const allValid    = pwChecks.every(c => c.valid);
  const pwdStrength = pwChecks.filter(c => c.valid).length;
  const showChecks  = form.password.length > 0 && !pwDismiss;

  const strengthLabel = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Excellent'][pwdStrength];
  const strengthColor = ['', 'bg-red-500', 'bg-red-400', 'bg-orange-400', 'bg-emerald-500', 'bg-emerald-600'][pwdStrength];

  if (success) {
    return (
      <div className="space-y-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <Mail size={24} className="text-emerald-700" />
        </div>
        <div>
          <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
            Vérifiez votre<span className="text-emerald-600"> e-mail !</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Un lien d&apos;activation a été envoyé à{' '}
            <span className="font-bold text-neutral-700">{form.email}</span>.
            Cliquez sur le lien pour activer votre compte.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
          <p className="text-xs leading-relaxed text-emerald-700">
            Le lien expire dans <strong>24 heures</strong>. Vérifiez aussi vos spams.
          </p>
        </div>
        <p className="text-center text-sm text-neutral-500">
          Déjà activé ??{' '}
          <Link href="/auth/login" className="font-black text-emerald-700 hover:text-emerald-600">
            Se connecter
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      <div>
        <h2 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900">
          Rejoindre <span className="text-emerald-600">SALAM</span>
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Créez votre compte membre en quelques minutes.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {([1, 2] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-neutral-200" />}
            <div className="flex items-center gap-1.5">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                step === s ? 'bg-emerald-600 text-white shadow-sm'
                  : step > s ? 'bg-emerald-100 text-emerald-700'
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

      {step === 1 && (
        <form onSubmit={handleNext} onFocusCapture={handleFormStart} className="space-y-4" noValidate>

          {/* Civilité */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Civilité <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'homme', label: 'Monsieur' },
                { value: 'femme', label: 'Madame' },
              ] as { value: 'homme' | 'femme'; label: string }[]).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('gender', opt.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-black transition-all ${
                    form.gender === opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : errors.gender
                      ? 'border-red-300 text-neutral-500 hover:border-red-400'
                      : 'border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  {opt.value === 'homme'
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={form.gender === 'homme' ? 'text-blue-500' : 'text-neutral-400'}><circle cx="12" cy="7" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2H6z"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={form.gender === 'femme' ? 'text-pink-500' : 'text-neutral-400'}><circle cx="12" cy="7" r="4"/><path d="M12 13c-3 0-5.5 1.3-7 3.3V21h14v-4.7C17.5 14.3 15 13 12 13z"/></svg>
                  }
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-[11px] text-red-500">{errors.gender}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" error={errors.firstName} required>
              <input type="text" autoComplete="given-name" required
                value={form.firstName} onChange={e => set('firstName', e.target.value)}
                placeholder="Jean" className={inputCls(!!errors.firstName)} />
            </Field>
            <Field label="Nom" error={errors.lastName} required>
              <input type="text" autoComplete="family-name" required
                value={form.lastName} onChange={e => set('lastName', e.target.value)}
                placeholder="Kamga" className={inputCls(!!errors.lastName)} />
            </Field>
          </div>

          <Field label="Adresse e-mail" error={errors.email} required>
            <input type="email" autoComplete="email" required
              value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="vous@exemple.com" className={inputCls(!!errors.email)} />
          </Field>

          <Field label="Téléphone (optionnel)">
            <input type="tel" autoComplete="tel"
              value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+212 6 00 00 00 00" className={inputCls(false)} />
          </Field>

          <Field label="Pays de résidence" error={errors.pays} required>
            <div className="relative">
              <select value={form.pays} onChange={e => set('pays', e.target.value)}
                className={`${inputCls(!!errors.pays)} appearance-none pr-9`}>
                <option value="">Sélectionner…</option>
                {PAYS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </Field>

          <Field label="Filière / Domaine d'études" error={errors.filiere} required>
            <div className="relative">
              <select value={form.filiere} onChange={e => set('filiere', e.target.value)}
                className={`${inputCls(!!errors.filiere)} appearance-none pr-9`}>
                <option value="">Sélectionner…</option>
                {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </Field>

          <Field label="Promotionnaire (année)" error={errors.promotionYear} required>
            <input type="number" min="1970" max="2100" required
              value={form.promotionYear} onChange={e => set('promotionYear', e.target.value)}
              placeholder={String(new Date().getFullYear())}
              className={inputCls(!!errors.promotionYear)} />
          </Field>

          <button type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]">
            Continuer <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} onFocusCapture={handleFormStart} className="space-y-4" noValidate>

          <Field label="Mot de passe" error={errors.password} required>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} autoComplete="new-password" required
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••••" className={`${inputCls(!!errors.password)} pr-11`} />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength ? strengthColor : 'bg-neutral-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400">Force : <span className="font-bold text-neutral-600">{strengthLabel}</span></p>
              </div>
            )}
            {showChecks && (
              <div className={`mt-2 rounded-xl border p-3 transition-all duration-200 ${
                allValid
                  ? 'border-emerald-300 bg-emerald-50/60'
                  : 'border-neutral-200 bg-neutral-50/40'
              }`}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Critères</p>
                  {allValid && (
                    <button type="button" onClick={() => setPwDismiss(true)}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold">✕</button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {pwChecks.map((c, i) => (
                    <div key={i} className={`flex items-center gap-2 text-[11px] transition-colors duration-200 ${c.valid ? 'text-emerald-600' : 'text-neutral-400'}`}>
                      <span className="w-3 text-center font-bold">{c.valid ? '✓' : '○'}</span>
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Field>

          <Field label="Confirmer le mot de passe" error={errors.confirm} required>
            <div className="relative">
              <input type={showConf ? 'text' : 'password'} autoComplete="new-password" required
                value={form.confirm} onChange={e => set('confirm', e.target.value)}
                placeholder="••••••••" className={`${inputCls(!!errors.confirm)} pr-11`} />
              <button type="button" onClick={() => setShowConf(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

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

          {errors.global && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <p className="text-xs leading-relaxed text-red-700">{errors.global}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setStep(1); setErrors({}); }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-800">
              <ArrowRight size={15} className="rotate-180" />
            </button>
            <button type="submit" disabled={loading}
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <>Créer mon compte <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
        <div className="relative flex justify-center">
          <span className="bg-[#f7f8f6] px-3 text-[11px] font-semibold text-neutral-400">ou</span>
        </div>
      </div>

      <p className="text-center text-sm text-neutral-500">
        Déjà membre ??{' '}
        <Link href="/auth/login" className="font-black text-emerald-700 hover:text-emerald-600">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15'
      : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'
  }`;
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p role="alert" className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

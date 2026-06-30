'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useMemo, useState, type FormEvent, type ReactNode, type ComponentType } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Tag,
  User,
  XCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import { PhoneField } from '@/components/ui/PhoneField';

const ANTENNE_OPTIONS = [
  'Yaounde',
  'Douala',
  'Maroc',
  'Senegal',
  'France',
  'Europe',
  'Amerique',
  'Autre',
] as const;

const ACTIVITY_SECTORS = [
  'Administration publique',
  'Agriculture et agroalimentaire',
  'Architecture et urbanisme',
  'Arts, culture et creation',
  'Assurance',
  'Banque et finance',
  'BTP et construction',
  'Commerce et distribution',
  'Communication et marketing',
  'Conseil et strategie',
  'Droit et juridique',
  'Education et formation',
  'Energie',
  'Environnement',
  'Entrepreneuriat',
  'Hotellerie et tourisme',
  'Industrie',
  'Informatique et IT',
  'Logistique et transport',
  'Recherche',
  'Sante',
  'Social et humanitaire',
  'Sport',
  'Telecommunications',
  'Autre',
];

const PASSWORD_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
const TAG_MAX_LENGTH = 500;

type ActivationForm = {
  password: string;
  confirm: string;
  gender: '' | 'homme' | 'femme';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  recoveryContact: string;
  birthDate: string;
  residenceCity: string;
  country: string;
  promotionYear: string;
  antenne: string;
  antenneAutre: string;
  activitySector: string;
  activitySectorProposal: string;
  city: string;
  skills: string[];
  expertiseDomains: string[];
};

type FormErrors = Partial<Record<keyof ActivationForm | 'global', string>>;

type IconType = ComponentType<{ size?: number; className?: string }>;

const emptyForm: ActivationForm = {
  password: '',
  confirm: '',
  gender: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  recoveryContact: '',
  birthDate: '',
  residenceCity: '',
  country: '',
  promotionYear: '',
  antenne: '',
  antenneAutre: '',
  activitySector: '',
  activitySectorProposal: '',
  city: '',
  skills: [],
  expertiseDomains: [],
};

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const yearOk = (value: string) => /^\d{4}$/.test(value) && Number(value) >= 1970 && Number(value) <= 2100;

function CreatePasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const setAuth = useAuthStore(s => s.setAuth);

  const [form, setForm] = useState<ActivationForm>(emptyForm);
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const passwordChecks = useMemo(() => ([
    { id: 'length', label: 'Au moins 8 caracteres', ok: form.password.length >= 8 },
    { id: 'upper', label: 'Au moins une majuscule', ok: /[A-Z]/.test(form.password) },
    { id: 'lower', label: 'Au moins une minuscule', ok: /[a-z]/.test(form.password) },
    { id: 'digit', label: 'Au moins un chiffre', ok: /[0-9]/.test(form.password) },
    { id: 'special', label: 'Au moins un caractere special autorise', ok: PASSWORD_SPECIAL.test(form.password) },
    { id: 'space', label: 'Aucun espace', ok: form.password.length > 0 && !/\s/.test(form.password) },
  ]), [form.password]);

  const passwordScore = passwordChecks.filter(check => check.ok).length;
  const strength = passwordScore <= 2
    ? { label: 'Faible', color: 'bg-red-400' }
    : passwordScore <= 4
      ? { label: 'Fort', color: 'bg-orange-400' }
      : passwordScore === 5
        ? { label: 'Tres fort', color: 'bg-emerald-500' }
        : { label: 'Excellent', color: 'bg-emerald-600' };

  const setField = <K extends keyof ActivationForm>(key: K) => (value: ActivationForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined, global: undefined }));
  };

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
            Ce lien d&apos;invitation est incorrect ou a expire. Contactez votre administrateur pour recevoir une nouvelle invitation.
          </p>
        </div>
        <Link href="/auth/login" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700">
          Retour a la connexion
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
            Compte<span className="text-emerald-600"> active !</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Votre fiche membre est finalisee. Vous allez etre redirige vers votre espace membre.
          </p>
        </div>
        <button onClick={() => router.push('/member/dashboard')} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]">
          Acceder a mon espace <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    );
  }

  const validate = (): { ok: boolean; firstKey?: string } => {
    const nextErrors: FormErrors = {};
    if (!passwordChecks.every(check => check.ok)) nextErrors.password = 'Le mot de passe ne respecte pas toutes les conditions.';
    if (form.password !== form.confirm) nextErrors.confirm = 'Les mots de passe ne correspondent pas.';
    if (!form.gender) nextErrors.gender = 'Civilite obligatoire.';
    if (form.firstName.trim().length < 2) nextErrors.firstName = 'Prenom obligatoire.';
    if (form.lastName.trim().length < 2) nextErrors.lastName = 'Nom obligatoire.';
    if (!emailOk(form.email)) nextErrors.email = 'Email invalide.';
    if (form.phone.trim().length < 8) nextErrors.phone = 'Telephone obligatoire.';
    if (!form.birthDate) nextErrors.birthDate = 'Date de naissance obligatoire.';
    if (!yearOk(form.promotionYear)) nextErrors.promotionYear = 'Annee de promotion invalide.';
    if (!form.activitySector) nextErrors.activitySector = "Secteur d'activite obligatoire.";
    if (form.activitySector === 'Autre' && !form.activitySectorProposal.trim()) nextErrors.activitySectorProposal = 'Precisez le secteur.';
    if (!form.skills.length) nextErrors.skills = 'Ajoutez au moins une competence.';
    else {
      const tooLongSkill = form.skills.find(item => item.length > TAG_MAX_LENGTH);
      if (tooLongSkill) nextErrors.skills = `Une competence depasse ${TAG_MAX_LENGTH} caracteres (${tooLongSkill.length}). Raccourcissez cette entree.`;
    }
    if (!form.expertiseDomains.length) nextErrors.expertiseDomains = "Ajoutez au moins un domaine d'expertise.";
    else {
      const tooLongDomain = form.expertiseDomains.find(item => item.length > TAG_MAX_LENGTH);
      if (tooLongDomain) nextErrors.expertiseDomains = `Un domaine d'expertise depasse ${TAG_MAX_LENGTH} caracteres (${tooLongDomain.length}). Raccourcissez cette entree.`;
    }
    setErrors(nextErrors);
    const firstKey = Object.keys(nextErrors)[0];
    return { ok: Object.keys(nextErrors).length === 0, firstKey };
  };

  const submitToServer = async () => {
    setConfirming(true);
    setLoading(true);
    setErrors({});

    try {
      const activated = await apiClient<{ accessToken: string; user: any; nextUrl?: string }>('/api/v1/auth/activate', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password: form.password,
          gender: form.gender,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          recoveryContact: form.recoveryContact.trim(),
          birthDate: form.birthDate,
          residenceCity: form.residenceCity.trim(),
          country: form.country.trim(),
          promotionYear: Number(form.promotionYear),
          antenne: form.antenne === 'Autre' ? form.antenneAutre.trim() : form.antenne,
          activitySector: form.activitySector,
          activitySectorProposal: form.activitySector === 'Autre' ? form.activitySectorProposal.trim() : '',
          city: form.city.trim(),
          skills: form.skills,
          expertiseDomains: form.expertiseDomains,
        }),
      });

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ accessToken: activated.data.accessToken }),
      }).catch(() => {});
      setAuth(activated.data.user, activated.data.accessToken);
      setSuccess(true);
      setTimeout(() => router.push(activated.data.nextUrl ?? '/member/dashboard'), 1200);
    } catch (err: unknown) {
      setConfirmOpen(false);
      setErrors({ global: err instanceof Error ? err.message : "Lien d'invitation invalide ou expire." });
    } finally {
      setConfirming(false);
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const { ok, firstKey } = validate();
    if (!ok) {
      if (firstKey) {
        setTimeout(() => {
          document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      }
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-7">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
        <ShieldCheck size={27} className="text-emerald-600" />
      </div>

      <div>
        <h2 className="text-[1.65rem] font-black leading-[1.1] tracking-[-0.04em] text-neutral-900 sm:text-[1.85rem]">
          Finalisez votre<span className="text-emerald-600"> compte membre</span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Votre email d&apos;invitation valide deja l&apos;adresse. Completez vos informations avant d&apos;acceder a votre espace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7" noValidate>
        <Section title="Informations personnelles">
          <PasswordInput id="field-password" label="Mot de passe" required value={form.password} show={showPwd} onToggle={() => setShowPwd(v => !v)} onChange={value => setField('password')(value)} error={errors.password} />
          <PasswordInput id="field-confirm" label="Confirmer mot de passe" required value={form.confirm} show={showConf} onToggle={() => setShowConf(v => !v)} onChange={value => setField('confirm')(value)} error={errors.confirm} />

          {form.password && (
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 sm:col-span-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Securite du mot de passe</span>
                <span className="text-xs font-black text-neutral-700">{strength.label}</span>
              </div>
              <div className="mb-3 grid grid-cols-6 gap-1">
                {[1, 2, 3, 4, 5, 6].map(step => <div key={step} className={`h-1.5 rounded-full ${step <= passwordScore ? strength.color : 'bg-neutral-200'}`} />)}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {passwordChecks.map(check => (
                  <p key={check.id} className={`flex items-center gap-2 text-xs font-semibold ${check.ok ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    <Check size={13} className={check.ok ? 'text-emerald-600' : 'text-neutral-300'} />
                    {check.label}
                  </p>
                ))}
              </div>
            </div>
          )}

          <SelectInput id="field-gender" className="sm:col-span-2" label="Civilite" required value={form.gender} onChange={value => setField('gender')(value as ActivationForm['gender'])} error={errors.gender} options={[[ '', 'Choisir' ], [ 'homme', 'Monsieur' ], [ 'femme', 'Madame' ]]} />
          <TextInput id="field-firstName" icon={User} label="Prenom" required value={form.firstName} onChange={value => setField('firstName')(value)} error={errors.firstName} />
          <TextInput id="field-lastName" icon={User} label="Nom" required value={form.lastName} onChange={value => setField('lastName')(value)} error={errors.lastName} />
          <TextInput id="field-email" icon={Mail} label="Email" required type="email" value={form.email} onChange={value => setField('email')(value)} error={errors.email} placeholder="email utilise par l'administrateur" />
          <div id="field-phone" className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Telephone <span className="text-red-500">*</span></label>
            <PhoneField value={form.phone} onChange={setField('phone')} size="lg" required error={!!errors.phone} defaultCountry="CM" />
            {errors.phone && <p className="text-[11px] text-red-500">{errors.phone}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Contact de recuperation</label>
            <PhoneField value={form.recoveryContact} onChange={setField('recoveryContact')} size="lg" defaultCountry="CM" placeholder="+237 6 00 00 00" />
          </div>
          <TextInput id="field-birthDate" label="Date de naissance" required type="date" value={form.birthDate} onChange={value => setField('birthDate')(value)} error={errors.birthDate} />
          <TextInput icon={MapPin} label="Ville de residence" value={form.residenceCity} onChange={value => setField('residenceCity')(value)} placeholder="Test town" />
          <TextInput icon={MapPin} label="Pays" value={form.country} onChange={value => setField('country')(value)} placeholder="Country test" />
          <TextInput id="field-promotionYear" label="Promotionnaire" required inputMode="numeric" maxLength={4} value={form.promotionYear} onChange={value => setField('promotionYear')(value.replace(/\D/g, '').slice(0, 4))} error={errors.promotionYear} placeholder="2000" />
          <SelectInput label="Antenne SALAM" value={form.antenne} onChange={value => setField('antenne')(value)} options={[[ '', 'Selectionner une antenne' ], ...ANTENNE_OPTIONS.map(item => [item, item] as [string, string])]} />
          {form.antenne === 'Autre' && <TextInput label="Precisez l'antenne" value={form.antenneAutre} onChange={value => setField('antenneAutre')(value)} />}
        </Section>

        <Section title="Parcours et expertises">
          <SelectInput id="field-activitySector" label="Secteur d'activite" required value={form.activitySector} onChange={value => setField('activitySector')(value)} error={errors.activitySector} options={[[ '', 'Selectionner' ], ...ACTIVITY_SECTORS.map(item => [item, item] as [string, string])]} />
          {form.activitySector === 'Autre' && <TextInput id="field-activitySectorProposal" label="Precisez le secteur" required value={form.activitySectorProposal} onChange={value => setField('activitySectorProposal')(value)} error={errors.activitySectorProposal} />}
          <TextInput icon={MapPin} label="Ville d'origine au Maroc" value={form.city} onChange={value => setField('city')(value)} placeholder="Testtown" />
          <TagInput id="field-skills" icon={Tag} label="Competences" required help="Saisissez des mots-cles separes par une virgule." value={form.skills} onChange={value => setField('skills')(value)} error={errors.skills} placeholder="Ex: React, gestion de projet..." />
          <TagInput id="field-expertiseDomains" icon={Briefcase} label="Domaines d'expertise" required help="Saisissez des mots-cles separes par une virgule." value={form.expertiseDomains} onChange={value => setField('expertiseDomains')(value)} error={errors.expertiseDomains} placeholder="Ex: finance, communication..." />
        </Section>

        {errors.global && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <p className="text-xs leading-relaxed text-red-700">{errors.global}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Creer mon compte <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>}
        </button>
      </form>

      <Link href="/auth/login" className="block text-center text-sm font-semibold text-neutral-400 hover:text-neutral-600">
        Retour a la connexion
      </Link>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center" onClick={() => !confirming && setConfirmOpen(false)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5" onClick={event => event.stopPropagation()}>
            <div className="border-b border-amber-100 bg-amber-50 px-6 py-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Verification obligatoire</p>
              <h3 className="mt-1 text-xl font-black text-neutral-900">Confirmez vos informations</h3>
              <p className="mt-2 text-sm leading-6 text-amber-800/90">
                Verifiez attentivement les informations sensibles. Apres creation du compte, les changements sur les champs obligatoires pourront demander une validation administrateur.
              </p>
            </div>
            <div className="space-y-3 p-6 text-sm text-neutral-600">
              <p><strong className="text-neutral-900">Civilite :</strong> {form.gender === 'femme' ? 'Madame' : 'Monsieur'}</p>
              <p><strong className="text-neutral-900">Nom :</strong> {form.firstName} {form.lastName}</p>
              <p><strong className="text-neutral-900">Email :</strong> {form.email}</p>
              <p><strong className="text-neutral-900">Promotion :</strong> {form.promotionYear}</p>
            </div>
            <div className="flex flex-col gap-3 border-t border-neutral-100 p-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmOpen(false)} disabled={confirming} className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
                Je verifie
              </button>
              <button type="button" onClick={submitToServer} disabled={confirming} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-600 px-5 text-sm font-black transition ${confirming ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 hover:bg-emerald-50'}`}>
                {confirming && <Loader2 size={15} className="animate-spin" />}
                Je confirme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl border border-neutral-100 bg-white/70 p-4 shadow-sm shadow-neutral-900/5 sm:p-5">
      <h3 className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function TextInput({ id, icon: Icon, label, value, onChange, error, required, type = 'text', placeholder, min, max, inputMode, maxLength, className }: {
  id?: string;
  icon?: IconType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  className?: string;
}) {
  return (
    <div id={id} className={`space-y-1.5 ${className ?? ''}`}>
      <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="relative">
        {Icon && <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />}
        <input type={type} value={value} min={min} max={max} inputMode={inputMode} maxLength={maxLength} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={`h-11 w-full rounded-xl border bg-white ${Icon ? 'pl-9' : 'pl-3'} pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition focus:ring-2 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`} />
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function PasswordInput({ id, label, value, onChange, show, onToggle, error, required }: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div id={id} className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} autoComplete="new-password" value={value} onChange={event => onChange(event.target.value)} placeholder="••••••••" className={`h-11 w-full rounded-xl border bg-white py-3 pl-4 pr-11 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 transition-all focus:ring-2 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`} />
        <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" aria-label={show ? 'Masquer' : 'Afficher'}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function SelectInput({ id, label, value, onChange, options, error, required, className }: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  error?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div id={id} className={`space-y-1.5 ${className ?? ''}`}>
      <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="relative">
        <select value={value} onChange={event => onChange(event.target.value)} className={`h-11 w-full appearance-none rounded-xl border bg-white px-3 pr-9 text-sm text-neutral-900 outline-none transition focus:ring-2 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`}>
          {options.map(([optionValue, optionLabel]) => <option key={optionValue || optionLabel} value={optionValue}>{optionLabel}</option>)}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function TagInput({ id, icon: Icon, label, help, value, onChange, placeholder, error, required }: {
  id?: string;
  icon: IconType;
  label: string;
  help: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  error?: string;
  required?: boolean;
}) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const entries = raw.split(',').map(item => item.trim()).filter(Boolean);
    if (!entries.length) return;
    const next = Array.from(new Set([...value, ...entries])).slice(0, 30);
    onChange(next);
    setDraft('');
  };

  return (
    <div id={id} className="space-y-1.5 sm:col-span-2">
      <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label} {required && <span className="text-red-500">*</span>}</label>
      <p className="text-xs text-neutral-400">{help}</p>
      <div className={`rounded-xl border bg-white px-3 py-2 transition focus-within:ring-2 ${error ? 'border-red-300 focus-within:border-red-400 focus-within:ring-red-500/15' : 'border-neutral-200 focus-within:border-emerald-500 focus-within:ring-emerald-500/15'}`}>
        <div className="flex flex-wrap gap-2">
          {value.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
              {tag}
              <button type="button" onClick={() => onChange(value.filter(item => item !== tag))} className="text-emerald-500 hover:text-red-500">×</button>
            </span>
          ))}
          <div className="flex min-w-[180px] flex-1 items-center gap-2">
            <Icon size={14} className="text-neutral-400" />
            <input value={draft} onChange={event => {
              const input = event.target.value;
              if (input.includes(',')) addTag(input);
              else setDraft(input);
            }} onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTag(draft);
              }
            }} onBlur={() => addTag(draft)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-300" />
          </div>
        </div>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center gap-5 py-8">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="text-sm text-neutral-500">Chargement...</p>
      </div>
    }>
      <CreatePasswordContent />
    </Suspense>
  );
}
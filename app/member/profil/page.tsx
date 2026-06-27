'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Tag,
  User,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useChangeMemberPassword, useRequestAccountDeletion, useSubmitActivitySectorProposal, useUpdateProfile } from '@/lib/api/members';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { assetUrl } from '@/lib/assets';
import { displayMemberNumber } from '@/lib/member-number';
import { AvatarLightbox } from '@/components/portal/AvatarLightbox';
import { CauriBadge, CauriWalletPanel } from '@/components/member/CauriWallet';
import { PhoneField } from '@/components/ui/PhoneField';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const ANTENNE_OPTIONS = [
  'Yaoundé',
  'Douala',
  'Maroc',
  'Sénégal',
  'France',
  'Europe',
  'Amérique',
  'Autre',
] as const;

const ANTENNE_KNOWN = new Set<string>(ANTENNE_OPTIONS.filter(a => a !== 'Autre'));

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

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  promotionYear: string;
  city: string;
  country: string;
  residenceCity: string;
  antenne: string;
  antenneAutre: string;
  birthDate: string;
  activitySector: string;
  activitySectorProposal: string;
  recoveryContact: string;
  skills: string[];
  expertiseDomains: string[];
  bio: string;
  motivation: string;
};

const emptyForm: ProfileForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  promotionYear: '',
  city: '',
  country: '',
  residenceCity: '',
  antenne: '',
  antenneAutre: '',
  birthDate: '',
  activitySector: '',
  activitySectorProposal: '',
  recoveryContact: '',
  skills: [],
  expertiseDomains: [],
  bio: '',
  motivation: '',
};

function dateInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export default function ProfilPage() {
  const user = useAuthStore(s => s.user);
  const patchUser = useAuthStore(s => s.patchUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const cauriRef = useRef<HTMLElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [saved, setSaved] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deletionOpen, setDeletionOpen] = useState(false);
  const updateProfile = useUpdateProfile();
  const sectorProposal = useSubmitActivitySectorProposal();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#cauris') {
      const t = setTimeout(() => {
        cauriRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      gender: user.gender ?? '',
      promotionYear: user.promotionYear ? String(user.promotionYear) : '',
      city: user.city ?? '',
      country: user.country ?? '',
      residenceCity: user.residenceCity ?? user.city ?? '',
      antenne: ANTENNE_KNOWN.has(user.antenne ?? '') ? (user.antenne ?? '') : (user.antenne ? 'Autre' : ''),
      antenneAutre: ANTENNE_KNOWN.has(user.antenne ?? '') ? '' : (user.antenne ?? ''),
      birthDate: dateInputValue(user.birthDate),
      activitySector: user.activitySector ?? '',
      activitySectorProposal: user.activitySectorProposal ?? '',
      recoveryContact: user.recoveryContact ?? '',
      skills: user.skills ?? [],
      expertiseDomains: user.expertiseDomains ?? [],
      bio: user.bio ?? '',
      motivation: user.motivation ?? '',
    });
    setAvatarPreview(memberPhotoUrl(user) || null);
  }, [user]);

  const set = (key: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    if (!['homme', 'femme'].includes(form.gender)) {
      e.preventDefault();
      toast.error('La civilité est obligatoire.');
      return;
    }
    e.preventDefault();
    const sensitiveChanged =
      form.gender !== (user?.gender ?? '')
      || Number(form.promotionYear || 0) !== Number(user?.promotionYear || 0);

    if (sensitiveChanged && !['homme', 'femme'].includes(form.gender)) {
      toast.error('Sélectionnez une civilité valide');
      return;
    }

    try {
      const res: any = await updateProfile.mutateAsync({
        gender: form.gender as 'homme' | 'femme',
        promotionYear: form.promotionYear ? Number(form.promotionYear) : undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        residenceCity: form.residenceCity || undefined,
        antenne: form.antenne === 'Autre' ? (form.antenneAutre.trim() || undefined) : (form.antenne || undefined),
        birthDate: form.birthDate || undefined,
        activitySector: form.activitySector || undefined,
        activitySectorProposal: form.activitySector === 'Autre' ? form.activitySectorProposal || undefined : undefined,
        recoveryContact: form.recoveryContact || undefined,
        skills: form.skills,
        expertiseDomains: form.expertiseDomains,
        bio: form.bio || undefined,
        motivation: form.motivation || undefined,
      });

      patchUser(res?.data ?? {
        gender: form.gender as 'homme' | 'femme',
        promotionYear: form.promotionYear ? Number(form.promotionYear) : undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });

      const validationSubmitted = Boolean(res?.data?.cardChangeRequest);
      if (validationSubmitted) {
        toast.custom((toastId) => (
          <div className="relative w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 pr-11 shadow-lg">
            <button
              type="button"
              onClick={() => toast.dismiss(toastId)}
              aria-label="Fermer"
              className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-orange-500 transition hover:bg-orange-100 hover:text-orange-700"
            >
              <X size={15} />
            </button>
            <p className="font-black text-orange-950">Information sensible</p>
            <p className="mt-1 text-sm leading-5 text-orange-800">
              La mise à jour sera faite après validation par un administrateur.
            </p>
          </div>
        ), { duration: 15_000 });
      } else {
        toast.success('Profil mis à jour');
      }

      setSaved(true);
      if (form.activitySector === 'Autre' && form.activitySectorProposal.trim()) {
        sectorProposal.mutate({ label: form.activitySectorProposal.trim() });
      }
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // Les mutations affichent le message d'erreur de l'API.
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setUploadingAvatar(true);

    try {
      const token = useAuthStore.getState().accessToken;
      const payload = new FormData();
      payload.append('avatar', file);
      const res = await fetch(`${API}/api/v1/member/profile/avatar`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        credentials: 'include',
        body: payload,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Erreur upload');
      if (json.data?.avatar) {
        setAvatarPreview(assetUrl(json.data.avatar) || json.data.avatar);
        patchUser(json.data);
      }
    } catch (err) {
      console.error('[avatar upload]', err);
      setAvatarPreview(user ? memberPhotoUrl(user) || null : null);
    } finally {
      setUploadingAvatar(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const initials = formatInitials(form.firstName, form.lastName, '??');

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-[clamp(1.35rem,3vw,2rem)] font-black tracking-[-0.03em] text-neutral-900">Mon profil</h1>
        <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500 sm:line-clamp-none sm:text-sm">Gerez vos informations personnelles et professionnelles</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm sm:gap-4 sm:p-5">
        <div className="relative shrink-0">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <AvatarLightbox src={avatarPreview} alt={user ? formatFullName(user.firstName, user.lastName) : 'Profil'} className={'h-12 w-12 rounded-full border-2 object-cover sm:h-16 sm:w-16 ' + memberAvatarBorderClass(user?.gender)} />
          ) : (
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-black text-white sm:h-16 sm:w-16 sm:text-2xl ${memberInitialsClass(user?.gender)}`}>
              {initials}
            </div>
          )}
          {uploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <Loader2 size={16} className="animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {form.gender && (
            <p className="mb-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400 sm:text-[10px]">
              {form.gender === 'femme' ? 'Madame' : 'Monsieur'}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2"><p className="text-sm font-black text-neutral-900">{formatFullName(form.firstName, form.lastName)}</p><CauriBadge compact onScrollTo={() => { cauriRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} /></div>
          <p className="text-xs text-neutral-500">{form.activitySector || 'Membre SALAM'}</p>
          {user?._id && (
            <p className="mt-0.5 font-mono text-[11px] text-emerald-600">
              {displayMemberNumber(user)}
            </p>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploadingAvatar}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-neutral-200 px-3 text-[11px] font-semibold text-neutral-600 transition-all hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 sm:ml-auto sm:h-9 sm:w-auto sm:px-4 sm:text-xs"
        >
          <Camera size={12} /> {uploadingAvatar ? 'Envoi...' : 'Changer la photo'}
        </button>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={handleSave} className="min-w-0 space-y-4">
        <Section title="Informations personnelles">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Civilite" required value={form.gender} onChange={set('gender')} options={[['', 'Non renseignee'], ['homme', 'Monsieur'], ['femme', 'Madame']]} />
            <div className="hidden sm:block" />
            <F icon={User} label="Prenom" value={form.firstName} onChange={set('firstName')} required />
            <F icon={User} label="Nom" value={form.lastName} onChange={set('lastName')} required />
            <F icon={Mail} label="Email" value={form.email} onChange={set('email')} type="email" readOnly />
            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">
                Telephone<span className="ml-0.5 text-red-500">*</span>
              </label>
              <PhoneField
                value={form.phone}
                onChange={val => setForm(prev => ({ ...prev, phone: val }))}
                size="sm"
                required
                defaultCountry="CM"
              />
            </div>
            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">
                Contact de recuperation
              </label>
              <PhoneField
                value={form.recoveryContact}
                onChange={val => setForm(prev => ({ ...prev, recoveryContact: val }))}
                size="sm"
                defaultCountry="CM"
                placeholder="+237 6 00 00 00"
              />
            </div>
            <F icon={Calendar} label="Date de naissance" value={form.birthDate} onChange={set('birthDate')} type="date" required />
            <F icon={MapPin} label="Ville de résidence" value={form.residenceCity} onChange={set('residenceCity')} placeholder="Douala, Rabat, Dakar..." />
            <F icon={MapPin} label="Pays" value={form.country} onChange={set('country')} placeholder="Cameroun, Maroc..." />
            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">
                Promotionnaire
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={form.promotionYear}
                onChange={e => setForm(prev => ({ ...prev, promotionYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="2026"
                className="h-8 w-full rounded-xl border border-neutral-200 px-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 sm:h-9 sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Select
                label="Antenne"
                value={form.antenne}
                onChange={set('antenne')}
                options={[['', 'Sélectionner une antenne'], ...ANTENNE_OPTIONS.map(a => [a, a] as [string, string])]}
              />
              {form.antenne === 'Autre' && (
                <F
                  icon={MapPin}
                  label="Préciser l'antenne"
                  value={form.antenneAutre}
                  onChange={set('antenneAutre')}
                  placeholder="Ex : Bruxelles, Berlin, Abidjan..."
                />
              )}
            </div>
          </div>
        </Section>

        <Section title="Parcours et expertises">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Secteur d'activite" value={form.activitySector} onChange={set('activitySector')} options={[['', 'Selectionner'], ...ACTIVITY_SECTORS.map(s => [s, s] as [string, string])]} />
            <F icon={MapPin} label="Ville d'origine au Maroc" value={form.city} onChange={set('city')} placeholder="Ville d'origine au Maroc" />
          </div>
          {form.activitySector === 'Autre' && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <F icon={Briefcase} label="Nouveau secteur propose" value={form.activitySectorProposal} onChange={set('activitySectorProposal')} placeholder="Ex: Intelligence artificielle, economie sociale..." />
              <p className="mt-2 text-xs font-semibold leading-5 text-amber-700">
                Ce secteur sera soumis a validation admin avant d'etre ajoute a la liste officielle.
              </p>
            </div>
          )}
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <TagInput icon={Tag} label="Competences" help="Saisissez des mots-cles separes par une virgule." value={form.skills} onChange={skills => setForm(prev => ({ ...prev, skills }))} placeholder="Ex: React, gestion de projet..." />
            <TagInput icon={Briefcase} label="Domaines d'expertise" help="Saisissez des mots-cles separes par une virgule." value={form.expertiseDomains} onChange={expertiseDomains => setForm(prev => ({ ...prev, expertiseDomains }))} placeholder="Ex: finance, communication..." />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <TextArea label="Biographie" value={form.bio} onChange={set('bio')} placeholder="Parlez de vous en quelques mots..." />
            <TextArea label="Motivation" value={form.motivation} onChange={set('motivation')} placeholder="Ce que vous souhaitez apporter a SALAM..." />
          </div>
        </Section>

        <Section title="Securite">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={() => setPasswordOpen(true)} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300 sm:w-auto sm:justify-start">
              <Lock size={13} /> Changer le mot de passe
            </button>
            <button type="button" className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300 sm:w-auto sm:justify-start">
              <Shield size={13} /> Authentification 2FA
            </button>
          </div>
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <button type="button" onClick={() => setDeletionOpen(true)} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-red-200 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 sm:w-auto sm:justify-start">
              Supprimer mon compte
            </button>
          </div>
        </Section>

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition-all disabled:opacity-60 ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20'}`}
        >
          {saved ? <><CheckCircle2 size={15} /> Enregistre !</> : <><Save size={15} /> Enregistrer les modifications</>}
        </button>
        </form>

        <aside ref={cauriRef} id="cauris" className="min-w-0 lg:sticky lg:top-24">
          <CauriWalletPanel />
        </aside>
      </div>
      {passwordOpen && <PasswordModal onClose={() => setPasswordOpen(false)} />}
      {deletionOpen && <AccountDeletionModal onClose={() => setDeletionOpen(false)} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between bg-emerald-50/80 px-4 py-3 transition hover:bg-emerald-50 sm:px-5"
      >
        <p className="text-sm font-black text-emerald-900">{title}</p>
        <ChevronDown size={16} className={`shrink-0 text-emerald-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="bg-neutral-50/60 p-4 sm:p-5">
          {children}
        </div>
      )}
    </div>
  );
}

function F({ icon: Icon, label, value, onChange, type = 'text', readOnly, placeholder, required }: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
          className={`h-8 w-full rounded-xl border border-neutral-200 pl-8 pr-3 text-xs text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 sm:h-9 sm:pl-9 sm:text-sm ${readOnly ? 'bg-neutral-50 text-neutral-500' : 'bg-white'}`}
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, readOnly, required }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: [string, string][];
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={readOnly}
        required={required}
        className="h-8 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 disabled:bg-neutral-50 disabled:text-neutral-500 sm:h-9 sm:text-sm"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue || optionLabel} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 sm:py-2.5 sm:text-sm"
      />
    </div>
  );
}

function TagInput({ icon: Icon, label, help, value, onChange, placeholder }: {
  icon: React.ElementType;
  label: string;
  help?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const addTags = () => {
    const tags = draft
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    if (tags.length === 0) return;
    onChange([...new Set([...value, ...tags])].slice(0, 30));
    setDraft('');
  };

  return (
    <div>
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">{label}</label>
      {help && <p className="mb-1.5 text-[10px] font-semibold text-neutral-400 sm:mb-2 sm:text-[11px]">{help}</p>}
      <div className="rounded-xl border border-neutral-200 px-3 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/10">
        <div className="flex flex-wrap gap-1.5">
          {value.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
              {tag}
              <button type="button" onClick={() => onChange(value.filter(item => item !== tag))} className="text-emerald-400 hover:text-emerald-700">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Icon size={13} className="text-neutral-400" />
          <input
            value={draft}
            onChange={e => {
              const nextValue = e.target.value;
              if (nextValue.includes(',')) {
                const parts = nextValue.split(',');
                const tags = [...parts.slice(0, -1).map(tag => tag.trim()).filter(Boolean)];
                if (tags.length) onChange([...new Set([...value, ...tags])].slice(0, 30));
                setDraft(parts.at(-1) ?? '');
                return;
              }
              setDraft(nextValue);
            }}
            onBlur={addTags}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTags();
              }
            }}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
    </div>
  );
}

function AccountDeletionModal({ onClose }: { onClose: () => void }) {
  const requestDeletion = useRequestAccountDeletion();
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState('');
  const canSubmit = confirm.trim().toUpperCase() === 'SUPPRIMER';

  const submit = () => {
    if (!canSubmit || requestDeletion.isPending) return;
    requestDeletion.mutate(
      { reason: reason.trim() || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5" onClick={event => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-red-100 bg-red-50/70 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-600">Validation administrateur</p>
            <h2 className="mt-1 text-lg font-black text-neutral-900">Demander la suppression du compte</h2>
            <p className="mt-1 text-sm leading-6 text-red-700/80">Le compte ne sera pas supprime maintenant. La demande sera envoyee aux administrateurs autorises.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-white/80">
            <X size={15} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Motif optionnel</label>
            <textarea value={reason} onChange={event => setReason(event.target.value)} rows={3} maxLength={1000} placeholder="Expliquez votre demande si necessaire..." className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-500/10" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Tapez SUPPRIMER pour confirmer la demande</label>
            <input value={confirm} onChange={event => setConfirm(event.target.value)} className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-500/10" />
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-neutral-100 p-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-bold text-neutral-600 hover:border-neutral-300">Annuler</button>
          <button type="button" onClick={submit} disabled={!canSubmit || requestDeletion.isPending} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50">
            {requestDeletion.isPending && <Loader2 size={14} className="animate-spin" />}
            Envoyer la demande
          </button>
        </div>
      </div>
    </div>
  );
}
const PW_CHECKS = [
  { label: 'Au moins 8 caractères', test: (p: string) => p.length >= 8 },
  { label: 'Une majuscule',          test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une minuscule',          test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre',             test: (p: string) => /[0-9]/.test(p) },
  { label: 'Un caractère spécial',   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];
const STRENGTH_LABEL = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Excellent'];
const STRENGTH_COLOR = ['', 'bg-red-500', 'bg-red-400', 'bg-orange-400', 'bg-emerald-500', 'bg-emerald-600'];

function PasswordModal({ onClose }: { onClose: () => void }) {
  const changePassword = useChangeMemberPassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const checks   = PW_CHECKS.map(c => ({ ...c, valid: c.test(newPassword) }));
  const strength = checks.filter(c => c.valid).length;
  const valid    = currentPassword && strength === 5 && newPassword === confirmPassword;

  const submit = () => {
    if (!valid || changePassword.isPending) return;
    changePassword.mutate({ currentPassword, newPassword }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-emerald-50/40 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Sécurité</p>
            <h2 className="text-lg font-black text-neutral-900">Changer le mot de passe</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
            <X size={15} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <PasswordField label="Mot de passe actuel *" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
          <div>
            <PasswordField label="Nouveau mot de passe *" value={newPassword} onChange={setNewPassword} autoComplete="new-password" showToggle />
            {/* Strength gauge */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? STRENGTH_COLOR[strength] : 'bg-neutral-100'}`} />
                  ))}
                </div>
                <p className="text-[10px] font-semibold text-neutral-500">
                  Force : <span className={strength >= 4 ? 'text-emerald-600' : strength >= 3 ? 'text-orange-500' : 'text-red-500'}>{STRENGTH_LABEL[strength]}</span>
                </p>
                <ul className="mt-1 grid grid-cols-1 gap-0.5">
                  {checks.map(c => (
                    <li key={c.label} className={`flex items-center gap-1.5 text-[10px] ${c.valid ? 'text-emerald-600' : 'text-neutral-400'}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.valid ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <PasswordField label="Confirmer le nouveau mot de passe *" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" showToggle />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs font-semibold text-red-500">Les mots de passe ne correspondent pas.</p>
          )}
        </div>
        <div className="flex gap-3 border-t border-neutral-100 p-5">
          <button type="button" onClick={onClose} className="h-10 flex-1 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:border-neutral-300">Annuler</button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid || changePassword.isPending}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {changePassword.isPending && <Loader2 size={14} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, autoComplete, showToggle = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  showToggle?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
          style={showToggle ? { paddingRight: '2.25rem' } : undefined}
        />
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}



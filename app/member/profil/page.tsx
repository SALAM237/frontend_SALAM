'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Tag,
  User,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSubmitActivitySectorProposal, useUpdateProfile } from '@/lib/api/members';
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
const BIO_MAX_LENGTH = 500;

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

    const bioLength = form.bio.trim().length;
    if (bioLength > BIO_MAX_LENGTH) {
      toast.error(`Biographie trop longue : maximum ${BIO_MAX_LENGTH} caracteres (${bioLength} saisis).`);
      return;
    }

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

  /* Reflète exactement isProfileComplete côté backend (cauris.service.ts) —
     un champ manquant s'affiche avec une bordure rouge épaisse pour que le
     membre sache visuellement quoi compléter pour atteindre 100% de profil. */
  const missing = {
    firstName:      !form.firstName.trim(),
    lastName:       !form.lastName.trim(),
    phone:          !form.phone.trim(),
    gender:         !['homme', 'femme'].includes(form.gender),
    promotionYear:  !form.promotionYear.trim(),
    city:           !form.city.trim(),
    country:        !form.country.trim(),
    residenceCity:  !form.residenceCity.trim(),
    antenne:        !form.antenne || (form.antenne === 'Autre' && !form.antenneAutre.trim()),
    birthDate:      !form.birthDate,
    activitySector: !form.activitySector,
    recoveryContact: !form.recoveryContact.trim(),
    bio:            !form.bio.trim(),
    motivation:     !form.motivation.trim(),
    skills:         form.skills.length === 0,
    expertiseDomains: form.expertiseDomains.length === 0,
  };

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
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2"><p className="text-sm font-black text-neutral-900">{formatFullName(form.firstName, form.lastName)}</p><CauriBadge compact alwaysShowCount onScrollTo={() => { cauriRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} /></div>
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
            <Select label="Civilite" required missing={missing.gender} value={form.gender} onChange={set('gender')} options={[['', 'Non renseignee'], ['homme', 'Monsieur'], ['femme', 'Madame']]} />
            <div className="hidden sm:block" />
            <F icon={User} label="Prenom" value={form.firstName} onChange={set('firstName')} required missing={missing.firstName} />
            <F icon={User} label="Nom" value={form.lastName} onChange={set('lastName')} required missing={missing.lastName} />
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
                error={missing.phone}
                defaultCountry="CM"
              />
            </div>
            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">
                Contact de recuperation{missing.recoveryContact && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              <PhoneField
                value={form.recoveryContact}
                onChange={val => setForm(prev => ({ ...prev, recoveryContact: val }))}
                size="sm"
                error={missing.recoveryContact}
                defaultCountry="CM"
                placeholder="+237 6 00 00 00"
              />
            </div>
            <F icon={Calendar} label="Date de naissance" value={form.birthDate} onChange={set('birthDate')} type="date" required missing={missing.birthDate} />
            <F icon={MapPin} label="Ville de résidence" value={form.residenceCity} onChange={set('residenceCity')} placeholder="Douala, Rabat, Dakar..." missing={missing.residenceCity} />
            <F icon={MapPin} label="Pays" value={form.country} onChange={set('country')} placeholder="Cameroun, Maroc..." missing={missing.country} />
            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">
                Promotionnaire{missing.promotionYear && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={form.promotionYear}
                onChange={e => setForm(prev => ({ ...prev, promotionYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="2026"
                className={`h-8 w-full rounded-xl border px-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 sm:h-9 sm:text-sm ${missing.promotionYear ? 'border-2 border-red-500' : 'border-neutral-200'}`}
              />
            </div>
            <div className="space-y-2">
              <Select
                label="Antenne"
                missing={missing.antenne}
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
                  missing={!form.antenneAutre.trim()}
                />
              )}
            </div>
          </div>
        </Section>

        <Section title="Parcours et expertises">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Secteur d'activite" missing={missing.activitySector} value={form.activitySector} onChange={set('activitySector')} options={[['', 'Selectionner'], ...ACTIVITY_SECTORS.map(s => [s, s] as [string, string])]} />
            <F icon={MapPin} label="Ville d'origine au Maroc" value={form.city} onChange={set('city')} placeholder="Ville d'origine au Maroc" missing={missing.city} />
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
            <TagInput icon={Tag} label="Competences" help="Saisissez des mots-cles separes par une virgule." value={form.skills} onChange={skills => setForm(prev => ({ ...prev, skills }))} placeholder="Ex: React, gestion de projet..." missing={missing.skills} />
            <TagInput icon={Briefcase} label="Domaines d'expertise" help="Saisissez des mots-cles separes par une virgule." value={form.expertiseDomains} onChange={expertiseDomains => setForm(prev => ({ ...prev, expertiseDomains }))} placeholder="Ex: finance, communication..." missing={missing.expertiseDomains} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <TextArea label="Biographie" value={form.bio} onChange={set('bio')} placeholder="Parlez de vous en quelques mots..." limit={BIO_MAX_LENGTH} missing={missing.bio} />
            <TextArea label="Motivation" value={form.motivation} onChange={set('motivation')} placeholder="Ce que vous souhaitez apporter a SALAM..." missing={missing.motivation} />
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

function F({ icon: Icon, label, value, onChange, type = 'text', readOnly, placeholder, required, missing }: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  required?: boolean;
  missing?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">
        {label}{(required || missing) && <span className="ml-0.5 text-red-500">*</span>}
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
          className={`h-8 w-full rounded-xl border pl-8 pr-3 text-xs text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 sm:h-9 sm:pl-9 sm:text-sm ${missing ? 'border-2 border-red-500' : 'border-neutral-200'} ${readOnly ? 'bg-neutral-50 text-neutral-500' : 'bg-white'}`}
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, readOnly, required, missing }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: [string, string][];
  readOnly?: boolean;
  required?: boolean;
  missing?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">{label}{(required || missing) && <span className="ml-0.5 text-red-500">*</span>}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={readOnly}
        required={required}
        className={`h-8 w-full rounded-xl border bg-white px-3 text-xs text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 disabled:bg-neutral-50 disabled:text-neutral-500 sm:h-9 sm:text-sm ${missing ? 'border-2 border-red-500' : 'border-neutral-200'}`}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue || optionLabel} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, limit, missing }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  limit?: number;
  missing?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 sm:mb-1.5">
        <label className="block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:text-[10px]">{label}{missing && <span className="ml-0.5 text-red-500">*</span>}</label>
        {limit && <span className={`text-[10px] font-bold ${value.trim().length > limit ? 'text-red-500' : 'text-neutral-400'}`}>{value.trim().length}/{limit}</span>}
      </div>
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        className={`w-full resize-none rounded-xl border px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 sm:py-2.5 sm:text-sm ${missing ? 'border-2 border-red-500' : 'border-neutral-200'}`}
      />
    </div>
  );
}

function TagInput({ icon: Icon, label, help, value, onChange, placeholder, missing }: {
  icon: React.ElementType;
  label: string;
  help?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  missing?: boolean;
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
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500 sm:mb-1.5 sm:text-[10px]">{label}{missing && <span className="ml-0.5 text-red-500">*</span>}</label>
      {help && <p className="mb-1.5 text-[10px] font-semibold text-neutral-400 sm:mb-2 sm:text-[11px]">{help}</p>}
      <div className={`rounded-xl border px-3 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/10 ${missing ? 'border-2 border-red-500' : 'border-neutral-200'}`}>
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


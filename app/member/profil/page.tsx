'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
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
import { useChangeMemberPassword, useSubmitActivitySectorProposal, useUpdateProfile } from '@/lib/api/members';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { assetUrl } from '@/lib/assets';
import { displayMemberNumber } from '@/lib/member-number';
import { AvatarLightbox } from '@/components/portal/AvatarLightbox';
import { CoriBadge, CoriWalletPanel } from '@/components/member/CoriWallet';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [saved, setSaved] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const updateProfile = useUpdateProfile();
  const sectorProposal = useSubmitActivitySectorProposal();

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
      antenne: user.antenne ?? '',
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
      toast.error('La civilite est obligatoire.');
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
        antenne: form.antenne || undefined,
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
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-[clamp(1.55rem,3vw,2rem)] font-black tracking-[-0.03em] text-neutral-900">Mon profil</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Gerez vos informations personnelles et professionnelles</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="relative shrink-0">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <AvatarLightbox src={avatarPreview} alt={user ? formatFullName(user.firstName, user.lastName) : 'Profil'} className={'h-16 w-16 rounded-full border-2 object-cover ' + memberAvatarBorderClass(user?.gender)} />
          ) : (
            <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white ${memberInitialsClass(user?.gender)}`}>
              {initials}
            </div>
          )}
          {uploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <Loader2 size={18} className="animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {form.gender && (
            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">
              {form.gender === 'femme' ? 'Madame' : 'Monsieur'}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2"><p className="font-black text-neutral-900">{formatFullName(form.firstName, form.lastName)}</p><CoriBadge compact /></div>
          <p className="text-sm text-neutral-500">{form.activitySector || 'Membre SALAM'}</p>
          {user?._id && (
            <p className="mt-1 font-mono text-xs text-emerald-600">
              {displayMemberNumber(user)}
            </p>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploadingAvatar}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 transition-all hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 sm:ml-auto sm:w-auto"
        >
          <Camera size={13} /> {uploadingAvatar ? 'Envoi...' : 'Changer la photo'}
        </button>
      </div>

      <CoriWalletPanel />

      <form onSubmit={handleSave} className="space-y-4">
        <Section title="Informations personnelles">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Civilite" required value={form.gender} onChange={set('gender')} options={[['', 'Non renseignee'], ['homme', 'Monsieur'], ['femme', 'Madame']]} />
            <div className="hidden sm:block" />
            <F icon={User} label="Prenom" value={form.firstName} onChange={set('firstName')} required />
            <F icon={User} label="Nom" value={form.lastName} onChange={set('lastName')} required />
            <F icon={Mail} label="Email" value={form.email} onChange={set('email')} type="email" readOnly />
            <F icon={Phone} label="Telephone" value={form.phone} onChange={set('phone')} placeholder="+237 6 00 00 00 00" />
            <F icon={Phone} label="Contact de recuperation" value={form.recoveryContact} onChange={set('recoveryContact')} placeholder="Email ou numero secondaire" />
            <F icon={Calendar} label="Date de naissance" value={form.birthDate} onChange={set('birthDate')} type="date" />
            <F icon={MapPin} label="Ville de résidence" value={form.residenceCity} onChange={set('residenceCity')} placeholder="Douala, Rabat, Dakar..." />
            <F icon={MapPin} label="Pays" value={form.country} onChange={set('country')} placeholder="Cameroun, Maroc..." />
            <F icon={User} label="Promotionnaire" value={form.promotionYear} onChange={set('promotionYear')} type="number" placeholder="2026" />
            <F icon={MapPin} label="Antenne" value={form.antenne} onChange={set('antenne')} placeholder="Casablanca, Yaounde..." />
          </div>
        </Section>

        <Section title="Parcours et expertises">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Secteur d'activite" value={form.activitySector} onChange={set('activitySector')} options={[['', 'Selectionner'], ...ACTIVITY_SECTORS.map(s => [s, s] as [string, string])]} />
            <F icon={MapPin} label="Ville d'origine" value={form.city} onChange={set('city')} placeholder="Ville d'origine ou de reference" />
          </div>
          {form.activitySector === 'Autre' && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <F icon={Briefcase} label="Nouveau secteur propose" value={form.activitySectorProposal} onChange={set('activitySectorProposal')} placeholder="Ex: Intelligence artificielle, economie sociale..." />
              <p className="mt-2 text-xs font-semibold leading-5 text-amber-700">
                Ce secteur sera soumis a validation admin avant d'etre ajoute a la liste officielle.
              </p>
            </div>
          )}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <TagInput icon={Tag} label="Competences" help="Saisissez des mots-cles separes par une virgule." value={form.skills} onChange={skills => setForm(prev => ({ ...prev, skills }))} placeholder="Ex: React, gestion de projet..." />
            <TagInput icon={Briefcase} label="Domaines d'expertise" help="Saisissez des mots-cles separes par une virgule." value={form.expertiseDomains} onChange={expertiseDomains => setForm(prev => ({ ...prev, expertiseDomains }))} placeholder="Ex: finance, communication..." />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <TextArea label="Biographie" value={form.bio} onChange={set('bio')} placeholder="Parlez de vous en quelques mots..." />
            <TextArea label="Motivation" value={form.motivation} onChange={set('motivation')} placeholder="Ce que vous souhaitez apporter a SALAM..." />
          </div>
        </Section>

        <Section title="Securite">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setPasswordOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300">
              <Lock size={13} /> Changer le mot de passe
            </button>
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300">
              <Shield size={13} /> Authentification 2FA
            </button>
          </div>
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-red-200 px-4 text-xs font-semibold text-red-600 hover:bg-red-50">
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
      {passwordOpen && <PasswordModal onClose={() => setPasswordOpen(false)} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm sm:p-6">
      <p className="mb-4 text-sm font-black text-neutral-900">{title}</p>
      {children}
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
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`h-10 w-full rounded-xl border border-neutral-200 pl-9 pr-4 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 ${readOnly ? 'bg-neutral-50 text-neutral-500' : 'bg-white'}`}
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
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={readOnly}
        required={required}
        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 disabled:bg-neutral-50 disabled:text-neutral-500"
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
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={4}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
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
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</label>
      {help && <p className="mb-2 text-[11px] font-semibold text-neutral-400">{help}</p>}
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
            onChange={e => setDraft(e.target.value)}
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

function PasswordModal({ onClose }: { onClose: () => void }) {
  const changePassword = useChangeMemberPassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const valid = currentPassword && newPassword.length >= 8 && newPassword === confirmPassword;

  const submit = () => {
    if (!valid || changePassword.isPending) return;
    changePassword.mutate(
      { currentPassword, newPassword },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-neutral-100 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Securite</p>
            <h2 className="text-lg font-black text-neutral-900">Changer le mot de passe</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
            <X size={15} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <PasswordField label="Mot de passe actuel" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
          <PasswordField label="Nouveau mot de passe" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
          <PasswordField label="Confirmer le nouveau mot de passe" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          {newPassword && newPassword.length < 8 && <p className="text-xs font-semibold text-red-500">Minimum 8 caracteres.</p>}
          {confirmPassword && newPassword !== confirmPassword && <p className="text-xs font-semibold text-red-500">Les mots de passe ne correspondent pas.</p>}
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

function PasswordField({ label, value, onChange, autoComplete }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</label>
      <input
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
      />
    </div>
  );
}

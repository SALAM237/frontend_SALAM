'use client';

import { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Save, CheckCircle2, Lock, Shield, Camera, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUpdateProfile } from '@/lib/api/members';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function ProfilPage() {
  const user                            = useAuthStore(s => s.user);
  const { setUser }                     = useAuthStore();
  const fileRef                         = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    email:     user?.email     ?? '',
    phone:     '',
    city:      '',
    country:   '',
    bio:       '',
  });
  const [saved, setSaved] = useState(false);

  const updateProfile = useUpdateProfile();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { firstName: form.firstName, lastName: form.lastName, phone: form.phone || undefined },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    /* Local preview */
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    /* Upload */
    setUploadingAvatar(true);
    try {
      const token = useAuthStore.getState().accessToken;
      const form  = new FormData();
      form.append('avatar', file);
      const res = await fetch(`${API}/api/v1/member/profile/avatar`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        credentials: 'include',
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Erreur upload');
      if (json.data?.avatar) setAvatarPreview(json.data.avatar);
    } catch (err) {
      console.error('[avatar upload]', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initials = form.firstName && form.lastName
    ? `${form.firstName[0]}${form.lastName[0]}`
    : '?';

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Mon profil</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Gérez vos informations personnelles</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="relative shrink-0">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-500/30"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-2xl font-black text-white">
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
          <p className="font-black text-neutral-900">{form.firstName} {form.lastName}</p>
          <p className="text-sm text-neutral-500">Membre actif</p>
          {user?._id && (
            <p className="mt-1 font-mono text-xs text-emerald-600">
              SALAM-{new Date().getFullYear()}-{user._id.slice(-4).toUpperCase()}
            </p>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploadingAvatar}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-emerald-300 hover:text-emerald-700 transition-all disabled:opacity-50 sm:w-auto sm:ml-auto"
        >
          <Camera size={13} /> {uploadingAvatar ? 'Envoi…' : 'Changer la photo'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-black text-neutral-900">Informations personnelles</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <F icon={User}  label="Prénom"    value={form.firstName} onChange={set('firstName')} />
            <F icon={User}  label="Nom"       value={form.lastName}  onChange={set('lastName')}  />
            <F icon={Mail}  label="Email"     value={form.email}     onChange={set('email')}     type="email" readOnly />
            <F icon={Phone} label="Téléphone" value={form.phone}     onChange={set('phone')}     placeholder="+33 6 00 00 00 00" />
            <F icon={MapPin} label="Ville"    value={form.city}      onChange={set('city')}      placeholder="Paris" />
            <F icon={MapPin} label="Pays"     value={form.country}   onChange={set('country')}   placeholder="Cameroun" />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Biographie</label>
            <textarea value={form.bio} onChange={set('bio')} rows={3}
              placeholder="Parlez de vous en quelques mots…"
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-black text-neutral-900">Sécurité</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300">
              <Lock size={13} /> Changer le mot de passe
            </button>
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300">
              <Shield size={13} /> Authentification 2FA
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-black text-neutral-900">Données personnelles</p>
          <p className="mb-4 text-xs text-neutral-500">Conformément au RGPD, vous pouvez exporter ou supprimer vos données à tout moment.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300">
              Exporter mes données
            </button>
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-red-200 px-4 text-xs font-semibold text-red-600 hover:bg-red-50">
              Supprimer mon compte
            </button>
          </div>
        </div>

        <button type="submit" disabled={updateProfile.isPending}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition-all disabled:opacity-60 ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20'}`}>
          {saved ? <><CheckCircle2 size={15} /> Enregistré !</> : <><Save size={15} /> Enregistrer les modifications</>}
        </button>
      </form>
    </div>
  );
}

function F({ icon: Icon, label, value, onChange, type = 'text', readOnly, placeholder }: {
  icon: React.ElementType; label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; readOnly?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">{label}</label>
      <div className="relative">
        <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input type={type} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder}
          className={`h-10 w-full rounded-xl border border-neutral-200 pl-9 pr-4 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 ${readOnly ? 'bg-neutral-50 text-neutral-500' : 'bg-white'}`}
        />
      </div>
    </div>
  );
}

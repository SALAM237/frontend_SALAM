'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, CheckCircle2, Lock, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUpdateProfile } from '@/lib/api/members';

export default function ProfilPage() {
  const user = useAuthStore(s => s.user);

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

  const initials = form.firstName && form.lastName ? `${form.firstName[0]}${form.lastName[0]}` : '?';

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Mon profil</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Gérez vos informations personnelles</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-2xl font-black text-white">
          {initials}
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
        <button className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300 sm:w-auto sm:ml-auto">
          <User size={13} /> Changer la photo
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Infos personnelles */}
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
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              placeholder="Parlez de vous en quelques mots…"
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {/* Security */}
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

        {/* RGPD */}
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

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition-all disabled:opacity-60 ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20'}`}
        >
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

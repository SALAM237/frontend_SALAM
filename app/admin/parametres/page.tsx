'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, CheckCircle2, Shield, Bell, Globe, Lock, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { isSuperAdmin } from '@/lib/auth/roles';

export default function ParametresPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'profil';
  const user   = useAuthStore(s => s.user);
  const SA     = isSuperAdmin(user);
  const [saved, setSaved] = useState(false);
  const [assocName, setAssocName] = useState('Association SALAM Cameroun');
  const [email, setEmail] = useState('contact@salam-cameroun.com');
  const [notifNewMember, setNotifNewMember] = useState(true);
  const [notifNewMsg, setNotifNewMsg] = useState(true);
  const [notifActivite, setNotifActivite] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 700));
    setSaved(true);
    toast.success('Paramètres enregistrés');
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = () => {
    toast.info('Redirection vers la réinitialisation du mot de passe…');
    setTimeout(() => router.push('/auth/forgot-password'), 800);
  };

  const handleViewAccess = () => {
    if (SA) {
      router.push('/admin/roles');
    } else {
      toast.info('Cette section est réservée au super administrateur.');
    }
  };

  const handleMaintenanceToggle = () => {
    setMaintenanceMode(v => {
      const next = !v;
      toast[next ? 'warning' : 'success'](
        next ? 'Mode maintenance activé — site public inaccessible' : 'Mode maintenance désactivé',
      );
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Paramètres</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Configuration de l&apos;espace administrateur SALAM</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">

        {/* Association */}
        {activeTab === 'profil' && <Section icon={Globe} title="Informations de l'association">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom de l'association" value={assocName} onChange={e => setAssocName(e.target.value)} />
            <Field label="Email de contact"     value={email}     onChange={e => setEmail(e.target.value)}     type="email" />
          </div>
          <Field label="URL du site" value="https://www.association-salam.org" onChange={() => {}} disabled />
        </Section>}

        {/* Notifications */}
        {activeTab === 'preferences' && <Section icon={Bell} title="Notifications admin">
          <div className="space-y-3">
            <Toggle label="Nouvel adhérent inscrit"   checked={notifNewMember} onChange={() => setNotifNewMember(v => !v)} />
            <Toggle label="Nouveau message reçu"      checked={notifNewMsg}    onChange={() => setNotifNewMsg(v => !v)}    />
            <Toggle label="Nouvelle activité créée"   checked={notifActivite}  onChange={() => setNotifActivite(v => !v)} />
          </div>
        </Section>}

        {/* Sécurité */}
        {activeTab === 'securite' && <Section icon={Shield} title="Sécurité">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleChangePassword} className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
              <Lock size={13} /> Changer le mot de passe admin
            </button>
            <button type="button" onClick={handleViewAccess} className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
              <Shield size={13} /> Voir les accès admin
            </button>
          </div>
        </Section>}

        {/* Maintenance */}
        {activeTab === 'preferences' && <Section icon={Palette} title="Mode maintenance">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-800">Mode maintenance</p>
              <p className="text-xs text-neutral-500">Le site public affichera une page de maintenance</p>
            </div>
            <button
              type="button"
              onClick={handleMaintenanceToggle}
              className={`relative h-6 w-11 rounded-full transition-all ${maintenanceMode ? 'bg-red-500' : 'bg-neutral-200'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${maintenanceMode ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          {maintenanceMode && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-black text-red-700">⚠ Mode maintenance activé — le site public est inaccessible</p>
            </div>
          )}
        </Section>}

        <button
          type="submit"
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition-all ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {saved ? <><CheckCircle2 size={15} /> Enregistré !</> : <><Save size={15} /> Enregistrer les paramètres</>}
        </button>
      </form>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-emerald-600" />
        <p className="text-sm font-black text-neutral-900">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', disabled = false }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-neutral-700">{label}</p>
      <button type="button" onClick={onChange} className={`relative h-6 w-11 rounded-full transition-all ${checked ? 'bg-emerald-500' : 'bg-neutral-200'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

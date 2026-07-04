'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, CheckCircle2, Shield, Bell, Globe, Lock, Palette, FileText, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { isSuperAdmin, hasAnyPermission } from '@/lib/auth/roles';
import { usePdfLogo, useUploadPdfLogo } from '@/lib/api/settings';

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
          <Field label="URL du site" value="https://salam-cameroun.com" onChange={() => {}} disabled />
        </Section>}

        {/* Logo PDF */}
        {activeTab === 'profil' && hasAnyPermission(user, ['settings.update']) && <PdfLogoSection />}

        {/* Notifications */}
        {activeTab === 'preferences' && <Section icon={Bell} title="Notifications admin">
          <div className="space-y-3">
            <Toggle label="Nouvel adhérent inscrit"   checked={notifNewMember} onChange={() => setNotifNewMember(v => !v)} />
            <Toggle label="Nouveau message reçu"      checked={notifNewMsg}    onChange={() => setNotifNewMsg(v => !v)}    />
            <Toggle label="Nouvelle activité créée"   checked={notifActivite}  onChange={() => setNotifActivite(v => !v)} />
          </div>
        </Section>}

        {/* Documents */}
        {activeTab === 'documents' && <AdminDocumentsSection />}

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
              className={`relative h-5 w-9 shrink-0 rounded-full transition-all sm:h-6 sm:w-11 ${maintenanceMode ? 'bg-red-500' : 'bg-neutral-200'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all sm:h-5 sm:w-5 ${maintenanceMode ? 'left-[18px] sm:left-[22px]' : 'left-0.5'}`} />
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
      <button type="button" onClick={onChange} className={`relative h-5 w-9 shrink-0 rounded-full transition-all sm:h-6 sm:w-11 ${checked ? 'bg-emerald-500' : 'bg-neutral-200'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all sm:h-5 sm:w-5 ${checked ? 'left-[18px] sm:left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

/* Logo utilisé sur TOUS les documents PDF générés (factures, reçus), côté admin
   ET côté membre — même principe que la photo de profil d'un membre. */
function PdfLogoSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data } = usePdfLogo();
  const uploadLogo = useUploadPdfLogo();
  const logoUrl = data?.data?.logoUrl;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo.mutate(file);
    e.target.value = '';
  };

  return (
    <Section icon={Camera} title="Logo des documents PDF">
      <p className="text-sm text-neutral-500">
        Ce logo apparaît sur toutes les factures et tous les reçus générés, aussi bien depuis l&apos;espace admin que depuis l&apos;espace membre.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo PDF" className="h-16 w-16 rounded-xl border-2 border-neutral-200 object-contain bg-white p-1" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 text-neutral-300">
              <Camera size={20} />
            </div>
          )}
          {uploadLogo.isPending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
              <Loader2 size={16} className="animate-spin text-white" />
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleChange} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploadLogo.isPending}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
        >
          <Camera size={13} /> {uploadLogo.isPending ? 'Envoi…' : 'Changer le logo'}
        </button>
      </div>
    </Section>
  );
}

function AdminDocumentsSection() {
  return (
    <Section icon={FileText} title="Documents internes">
      <p className="text-sm text-neutral-500">
        Importez et partagez des documents avec les membres (statuts, règlements, guides…).
        Les membres reçoivent une notification et peuvent télécharger les fichiers depuis leur espace.
      </p>
      <a
        href="/admin/documents"
        className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white transition hover:bg-emerald-700"
      >
        <FileText size={13} /> Gérer les documents
      </a>
    </Section>
  );
}

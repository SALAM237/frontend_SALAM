'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, CheckCircle2, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';

type FormState = {
  firstName: string; lastName: string; email: string; phone: string;
  city: string; country: string; role: string; antenne: string; motivation: string;
};

const ROLES    = ['Membre actif', 'Étudiant', 'Alumni', 'Bureau', 'Conseil des sages'];
const ANTENNES = ['Paris', 'Casablanca', 'Rabat', 'Lyon', 'Bordeaux', 'Autre'];

function generateId() {
  const year = new Date().getFullYear();
  const num  = String(Math.floor(Math.random() * 900) + 100).padStart(4, '0');
  return `SALAM-${year}-${num}`;
}

export default function NouveauAdherentPage() {
  const router = useRouter();
  const [step, setStep]   = useState<'form' | 'preview' | 'done'>('form');
  const [loading, setLoading] = useState(false);
  const [generatedId] = useState(generateId);

  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', phone: '',
    city: '', country: 'Cameroun', role: 'Membre actif', antenne: 'Paris', motivation: '',
  });

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const cardData: MemberCardData = {
    id: generatedId,
    firstName: form.firstName || 'Prénom',
    lastName: form.lastName  || 'Nom',
    role: form.role,
    antenne: form.antenne,
    year: new Date().getFullYear(),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) return;
    setStep('preview');
  };

  const handleValidate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep('done');
  };

  if (step === 'done') return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
      </div>
      <h2 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Membre créé avec succès !</h2>
      <p className="mt-2 text-sm text-neutral-500">
        La fiche de <strong>{form.firstName} {form.lastName}</strong> a été enregistrée.<br />
        Numéro d&apos;adhérent : <span className="font-mono font-bold text-emerald-700">{generatedId}</span>
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex justify-center">
          <MemberCard member={cardData} />
        </div>
        <div className="flex gap-3">
          <Link href="/admin/adherents" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-300">
            <ArrowLeft size={14} /> Retour à la liste
          </Link>
          <Link href="/admin/cartes" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700">
            <CreditCard size={14} /> Gérer les cartes
          </Link>
        </div>
      </div>
    </div>
  );

  if (step === 'preview') return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Aperçu de la fiche</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Vérifiez les informations avant de créer le membre.</p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ['Prénom',   form.firstName], ['Nom',      form.lastName],
            ['Email',    form.email],     ['Téléphone',form.phone || '—'],
            ['Ville',    form.city || '—'],['Pays',    form.country],
            ['Rôle',     form.role],      ['Antenne',  form.antenne],
            ['N° membre',generatedId],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
              <p className="mt-0.5 font-semibold text-neutral-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card preview */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-black text-neutral-900">Carte de membre générée</p>
        <div className="flex justify-center overflow-x-auto">
          <MemberCard member={cardData} />
        </div>
        <p className="mt-3 text-center text-xs text-neutral-400">
          Le QR code renvoie vers <span className="font-mono text-emerald-600">association-salam.org/verify/{generatedId}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep('form')} className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-300">
          <ArrowLeft size={14} /> Modifier
        </button>
        <button
          onClick={handleValidate}
          disabled={loading}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? 'Enregistrement…' : <><CheckCircle2 size={14} /> Valider et créer la fiche</>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/adherents" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-300">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Nouveau membre</h1>
          <p className="text-sm text-neutral-500">Créer une fiche adhérent et générer la carte membre</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identité */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <p className="mb-4 flex items-center gap-2 text-sm font-black text-neutral-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">1</span>
            Identité
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom *" value={form.firstName} onChange={set('firstName')} placeholder="Jean" required />
            <Field label="Nom *"    value={form.lastName}  onChange={set('lastName')}  placeholder="Kamga" required />
            <Field label="Email *"  value={form.email}     onChange={set('email')}     placeholder="jean@email.com" type="email" required />
            <Field label="Téléphone" value={form.phone}    onChange={set('phone')}     placeholder="+33 6 00 00 00 00" />
            <Field label="Ville"    value={form.city}      onChange={set('city')}      placeholder="Paris" />
            <Field label="Pays"     value={form.country}   onChange={set('country')}   placeholder="Cameroun" />
          </div>
        </div>

        {/* Adhésion */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <p className="mb-4 flex items-center gap-2 text-sm font-black text-neutral-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">2</span>
            Adhésion
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Rôle" value={form.role} onChange={set('role')} options={ROLES} />
            <SelectField label="Antenne" value={form.antenne} onChange={set('antenne')} options={ANTENNES} />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Motivation / Notes</label>
            <textarea
              value={form.motivation}
              onChange={set('motivation')}
              rows={3}
              placeholder="Notes sur le membre, motivation d'adhésion…"
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {/* Carte preview live */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <p className="mb-4 flex items-center gap-2 text-sm font-black text-neutral-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">3</span>
            Aperçu carte membre
          </p>
          <div className="flex justify-center overflow-x-auto">
            <MemberCard member={cardData} />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20"
        >
          <UserPlus size={15} /> Prévisualiser et créer
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-10 w-full rounded-xl border border-neutral-200 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

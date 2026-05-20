'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, CheckCircle2, CreditCard, ArrowLeft, FileSpreadsheet, UserCheck } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { DemoPortalShell } from '../../../_components/DemoShell';
import { formatFirstName, formatFullName, formatLastName } from '@/lib/format-name';

type Mode = 'single' | 'csv';
type Step = 'form' | 'preview' | 'done';

const ROLES = ['Membre actif', 'Etudiant', 'Alumni', 'Bureau', 'Conseil des sages'];
const ANTENNES = ['Paris', 'Lyon', 'Bordeaux', 'Yaounde', 'Douala', 'Casablanca', 'Rabat', 'Autre'];

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className="h-10 w-full rounded-xl border border-neutral-200 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function DemoAdminNewMemberPage() {
  const [mode, setMode] = useState<Mode>('single');
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({
    gender: '', firstName: '', lastName: '', email: '', phone: '',
    city: '', country: 'Cameroun', role: 'Membre actif', antenne: 'Paris', motivation: '',
    promotionYear: '',
  });
  const generatedId = 'SALAM-2026-078';
  const set = (key: keyof typeof form) => (value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const cardData: MemberCardData = {
    id: generatedId,
    firstName: form.firstName || 'Prenom',
    lastName: form.lastName || 'Nom',
    gender: (form.gender as 'homme' | 'femme') || undefined,
    role: form.role,
    antenne: form.antenne,
    year: new Date().getFullYear(),
  };

  if (step === 'done') {
    return (
      <DemoPortalShell type="admin" title="Nouveau membre">
        <div className="mx-auto max-w-lg py-12 text-center">
          <div className="mb-6 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 size={40} className="text-emerald-600" /></div></div>
          <h2 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Membre cree avec succes !</h2>
          <p className="mt-2 text-sm text-neutral-500">La fiche de <strong>{formatFullName(form.firstName, form.lastName)}</strong> a ete enregistree en demo.<br />Numero d'adherent : <span className="font-mono font-bold text-emerald-700">{generatedId}</span></p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="mx-auto w-full max-w-[400px]"><MemberCard member={cardData} /></div>
            <div className="flex gap-3"><Link href="/demo/admin/adherents" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-300"><ArrowLeft size={14} /> Retour a la liste</Link><Link href="/demo/admin/cartes" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700"><CreditCard size={14} /> Gerer les cartes</Link></div>
          </div>
        </div>
      </DemoPortalShell>
    );
  }

  if (step === 'preview') {
    return (
      <DemoPortalShell type="admin" title="Nouveau membre">
        <div className="mx-auto max-w-2xl space-y-6">
          <div><h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Apercu de la fiche</h1><p className="mt-0.5 text-sm text-neutral-500">Verifiez les informations avant de creer le membre.</p></div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"><div className="grid gap-3 text-sm sm:grid-cols-2">{[['Civilite', form.gender === 'femme' ? 'Madame' : 'Monsieur'], ['Prenom', formatFirstName(form.firstName)], ['Nom', formatLastName(form.lastName)], ['Email', form.email], ['Telephone', form.phone || '-'], ['Promotionnaire', form.promotionYear || '-'], ['Ville', form.city || '-'], ['Pays', form.country], ['Role', form.role], ['Antenne', form.antenne], ['No membre', generatedId]].map(([label, value]) => <div key={label}><p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p><p className="mt-0.5 font-semibold text-neutral-900">{value}</p></div>)}</div></div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"><p className="mb-4 text-sm font-black text-neutral-900">Carte de membre generee</p><div className="flex justify-center overflow-x-auto"><MemberCard member={cardData} /></div></div>
          <div className="flex gap-3"><button onClick={() => setStep('form')} className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-300"><ArrowLeft size={14} /> Modifier</button><button onClick={() => setStep('done')} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700"><CheckCircle2 size={14} /> Valider et creer la fiche</button></div>
        </div>
      </DemoPortalShell>
    );
  }

  return (
    <DemoPortalShell type="admin" title="Nouveau membre">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center gap-3"><Link href="/demo/admin/adherents" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-300"><ArrowLeft size={15} /></Link><div><h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Nouveau membre</h1><p className="text-sm text-neutral-500">Saisie manuelle ou import de donnees historiques</p></div></div>
        <div className="flex gap-1 rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm"><button onClick={() => setMode('single')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition ${mode === 'single' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}><UserPlus size={14} /> Saisie manuelle</button><button onClick={() => setMode('csv')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition ${mode === 'csv' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}><FileSpreadsheet size={14} /> Importer CSV</button></div>
        {mode === 'single' ? (
          <form onSubmit={e => { e.preventDefault(); setStep('preview'); }} className="space-y-4">
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"><p className="mb-4 flex items-center gap-2 text-sm font-black text-neutral-900"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">1</span>Identite</p><div className="mb-4"><p className="mb-1.5 text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Civilite <span className="text-red-500">*</span></p><div className="flex gap-3">{([{ value: 'homme', label: 'Monsieur' }, { value: 'femme', label: 'Madame' }] as const).map(opt => <button key={opt.value} type="button" onClick={() => set('gender')(opt.value)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-black transition ${form.gender === opt.value ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:text-emerald-700'}`}><UserCheck size={14} className={form.gender === opt.value ? 'text-emerald-600' : 'text-neutral-400'} />{opt.label}</button>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Prenom *" value={form.firstName} onChange={set('firstName')} placeholder="Jean" required /><Field label="Nom *" value={form.lastName} onChange={set('lastName')} placeholder="Kamga" required /><Field label="Email *" value={form.email} onChange={set('email')} placeholder="jean@email.com" type="email" required /><Field label="Telephone" value={form.phone} onChange={set('phone')} placeholder="+33 6 00 00 00 00" /><Field label="Promotionnaire *" value={form.promotionYear} onChange={set('promotionYear')} placeholder="2026" type="number" required /><Field label="Ville" value={form.city} onChange={set('city')} placeholder="Paris" /><Field label="Pays" value={form.country} onChange={set('country')} placeholder="Cameroun" /></div></div>
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"><p className="mb-4 flex items-center gap-2 text-sm font-black text-neutral-900"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">2</span>Adhesion</p><div className="grid gap-4 sm:grid-cols-2"><SelectField label="Role" value={form.role} onChange={set('role')} options={ROLES} /><SelectField label="Antenne" value={form.antenne} onChange={set('antenne')} options={ANTENNES} /></div><div className="mt-4"><label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Motivation / Notes</label><textarea value={form.motivation} onChange={e => set('motivation')(e.target.value)} rows={3} placeholder="Notes sur le membre..." className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" /></div></div>
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"><p className="mb-4 flex items-center gap-2 text-sm font-black text-neutral-900"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">3</span>Apercu carte membre</p><div className="mx-auto w-full max-w-[400px]"><MemberCard member={cardData} /></div></div>
            <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20"><UserPlus size={15} /> Previsualiser et creer</button>
          </form>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50"><FileSpreadsheet size={28} className="text-emerald-600" /></div><h3 className="text-sm font-black text-neutral-900">Importer les adherents historiques</h3><p className="mt-1.5 text-xs leading-relaxed text-neutral-500">Chargez un fichier CSV. En demo, l'import est simule et aucune base n'est modifiee.</p><button className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-black text-white transition hover:bg-emerald-700">Choisir un fichier CSV</button></div>
        )}
      </div>
    </DemoPortalShell>
  );
}

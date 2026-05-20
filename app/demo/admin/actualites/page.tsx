'use client';

import { useState } from 'react';
import { Newspaper, Plus, X, Trash2, Edit3 } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoNews } from '@/data/demo/demo-news';

const CATEGORIES = [{ value: 'general', label: 'General' }, { value: 'communique', label: 'Communique' }, { value: 'evenement', label: 'Evenement' }];

function ArticleForm({ title, onClose }: { title: string; onClose: () => void }) {
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h3 className="font-black text-neutral-900">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label><input defaultValue="Lancement du programme mentorat" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div>
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Categorie</label><select className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15">{CATEGORIES.map(c => <option key={c.value}>{c.label}</option>)}</select></div>
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Resume</label><textarea rows={2} defaultValue="Une courte description de l'actualite demo." className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div>
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Contenu</label><textarea rows={6} defaultValue="Corps de l'article fictif. Aucune publication reelle n'est effectuee." className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div>
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Statut</label><div className="flex gap-3">{([{ v: 'draft', l: 'Brouillon' }, { v: 'published', l: 'Publier' }] as const).map(({ v, l }) => <button key={v} type="button" onClick={() => setStatus(v)} className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-black transition ${status === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>{l}</button>)}</div></div>
        </div>
        <div className="flex shrink-0 gap-3 border-t border-neutral-100 px-6 py-4"><button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600">Annuler</button><button onClick={onClose} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white"><Newspaper size={14} /> Creer l'article</button></div>
      </div>
    </div>
  );
}

export default function DemoAdminNewsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [edit, setEdit] = useState(false);
  const articles = demoNews.map(n => ({ ...n, _id: n.id, status: 'published', data: { category: 'general', excerpt: n.excerpt }, createdAt: '2026-05-18T12:00:00.000Z' }));
  return (
    <DemoPortalShell type="admin" title="Actualites">
      <div className="w-full space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Actualites</h1><p className="mt-0.5 text-sm text-neutral-500">{articles.length} article</p></div><button onClick={() => setShowCreate(true)} className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-700"><Plus size={14} /><span className="hidden sm:inline">Nouvel article</span></button></div>
        <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm"><p className="text-3xl font-black leading-none text-emerald-700">{articles.length}</p><p className="mt-1 text-xs font-semibold text-neutral-500">Publies</p></div><div className="rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm"><p className="text-3xl font-black leading-none text-yellow-700">1</p><p className="mt-1 text-xs font-semibold text-neutral-500">Brouillons</p></div></div>
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm"><div className="divide-y divide-neutral-50">{articles.map(a => <div key={a._id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50"><Newspaper size={16} className="text-blue-600" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-black text-neutral-900">{a.title}</p><span className="inline-flex shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black leading-none text-emerald-700">Publie</span></div><div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400"><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold leading-none text-neutral-600">General</span><span className="max-w-xs truncate">{a.excerpt}</span></div><p className="mt-0.5 text-[11px] text-neutral-300">18 mai 2026</p></div><div className="flex shrink-0 items-center gap-1.5"><button onClick={() => setEdit(true)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:text-emerald-700"><Edit3 size={12} /></button><button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-300 transition hover:border-red-300 hover:text-red-600"><Trash2 size={12} /></button></div></div>)}</div></div>
        {showCreate && <ArticleForm title="Nouvel article" onClose={() => setShowCreate(false)} />}
        {edit && <ArticleForm title="Modifier l'article" onClose={() => setEdit(false)} />}
      </div>
    </DemoPortalShell>
  );
}

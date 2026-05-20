'use client';

import { useState } from 'react';
import { Images, Plus, X, Eye, EyeOff, Trash2, Edit3, Upload, ImagePlus } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoGallery } from '@/data/demo/demo-gallery';

const COVERS = ['from-emerald-400 to-teal-600', 'from-blue-400 to-indigo-600', 'from-purple-400 to-pink-600', 'from-amber-400 to-orange-500'];

function AlbumForm({ title, onClose }: { title: string; onClose: () => void }) {
  const [visibility, setVisibility] = useState<'public' | 'members'>('public');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4"><h3 className="font-black text-neutral-900">{title}</h3><button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button></div>
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label><input defaultValue="Rencontre annuelle demo" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div>
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Visibilite</label><div className="flex gap-3">{([{ v: 'public', l: 'Public', icon: Eye }, { v: 'members', l: 'Membres', icon: EyeOff }] as const).map(({ v, l, icon: Icon }) => <button key={v} type="button" onClick={() => setVisibility(v)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition ${visibility === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}><Icon size={13} /> {l}</button>)}</div></div>
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Mots-cles</label><input defaultValue="sport, demo, salam" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4"><button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600">Annuler</button><button onClick={onClose} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white"><Images size={14} /> Creer l'album</button></div>
      </div>
    </div>
  );
}

function AlbumDetail({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex shrink-0 items-center gap-4 border-b border-neutral-100 px-5 py-4">
        <button onClick={onClose} className="flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50">Retour albums</button>
        <div className="min-w-0 flex-1"><h2 className="truncate font-black text-neutral-900">{title}</h2><p className="text-xs text-neutral-400">3 photos</p></div>
        <button className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-emerald-700"><ImagePlus size={13} /> Ajouter des photos</button>
      </div>
      <div className="flex-1 overflow-y-auto p-5"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{[1,2,3].map(i => <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-100 bg-gradient-to-br from-emerald-100 via-yellow-50 to-red-100 shadow-sm"><div className="grid h-full place-items-center"><Images className="text-emerald-700" /></div><button className="absolute right-1.5 top-1.5 hidden h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 transition hover:bg-red-600/90 group-hover:flex"><Trash2 size={11} /></button></div>)}</div></div>
    </div>
  );
}

export default function DemoAdminGalleryPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [edit, setEdit] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const albums = demoGallery.map((g, i) => ({ ...g, _id: g.id, visibility: i === 1 ? 'members' : 'public', images: Array(i + 1).fill(null), tags: [g.category], createdAt: '2026-05-01T00:00:00.000Z' }));
  return (
    <DemoPortalShell type="admin" title="Galerie">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Galerie</h1><p className="mt-0.5 text-sm text-neutral-500">{albums.length} albums</p></div><button onClick={() => setShowCreate(true)} className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-700"><Plus size={14} /> Nouvel album</button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button onClick={() => setShowCreate(true)} className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 transition-all hover:border-emerald-300 hover:bg-emerald-50/30 hover:text-emerald-600"><Plus size={28} className="opacity-50" /><p className="text-sm font-black">Nouvel album</p></button>
          {albums.map((a, i) => <div key={a.id} className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"><div className={`relative h-32 cursor-pointer overflow-hidden bg-gradient-to-br ${COVERS[i % COVERS.length]}`} onClick={() => setDetail(a.title)}>{a.visibility === 'members' && <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-black text-white"><EyeOff size={8} /> Membres</span>}<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20"><span className="hidden items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-neutral-900 group-hover:flex"><ImagePlus size={11} /> Gerer les photos</span></div></div><div className="p-3"><div className="flex items-start justify-between gap-2"><p className="text-xs font-black leading-tight text-neutral-900">{a.title}</p><div className="flex shrink-0 gap-1"><button onClick={() => setEdit(true)} className="flex h-6 w-6 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:text-emerald-700"><Edit3 size={10} /></button><button className="flex h-6 w-6 items-center justify-center rounded-lg border border-red-100 text-red-300 transition hover:border-red-300 hover:text-red-600"><Trash2 size={10} /></button></div></div><div className="mt-1.5 flex items-center justify-between"><span className="text-[10px] text-neutral-400">mai 2026</span><span className="flex items-center gap-1 text-[10px] text-neutral-400"><Eye size={9} /> {a.images.length} photos</span></div><div className="mt-1.5 flex flex-wrap gap-1"><span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-500">{a.category}</span></div></div></div>)}
        </div>
        {showCreate && <AlbumForm title="Nouvel album" onClose={() => setShowCreate(false)} />}
        {edit && <AlbumForm title="Modifier l'album" onClose={() => setEdit(false)} />}
        {detail && <AlbumDetail title={detail} onClose={() => setDetail(null)} />}
      </div>
    </DemoPortalShell>
  );
}

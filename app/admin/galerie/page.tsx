'use client';

import { useState } from 'react';
import { Images, Plus, X, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';
import { useAlbums, useCreateAlbum, useDeleteAlbum, type AlbumDoc } from '@/lib/api/gallery';

/* ─── Create album modal ──────────────────────────────────── */
function CreateAlbumModal({ onClose }: { onClose: () => void }) {
  const [title,      setTitle]      = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tagsInput,  setTagsInput]  = useState('');
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const create = useCreateAlbum();

  const handleSubmit = () => {
    if (!title.trim()) { setErrors({ title: 'Titre requis' }); return; }
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    create.mutate({ title: title.trim(), visibility, tags }, { onSuccess: () => onClose() });
  };

  const inp = (err?: string) =>
    `w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 placeholder:text-neutral-300 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h3 className="font-black text-neutral-900">Nouvel album</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Créer un album photo dans la galerie</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => { setTitle(e.target.value); setErrors({}); }}
              placeholder="Ex: Tournoi de football 2025" className={inp(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Visibilité</label>
            <div className="flex gap-3">
              {[{ v: 'public', l: 'Public', icon: Eye }, { v: 'members', l: 'Membres', icon: EyeOff }].map(({ v, l, icon: Icon }) => (
                <button key={v} type="button" onClick={() => setVisibility(v)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition ${visibility === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                  <Icon size={13} /> {l}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Mots-clés <span className="font-normal normal-case text-neutral-300">(séparés par des virgules)</span>
            </label>
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
              placeholder="sport, été, 2025" className={inp()} />
          </div>
        </div>

        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={handleSubmit} disabled={create.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
            {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Images size={14} />}
            Créer l&apos;album
          </button>
        </div>
      </div>
    </div>
  );
}

/* gradient palette by index */
const COVERS = [
  'from-emerald-400 to-teal-600', 'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',  'from-amber-400 to-orange-500',
  'from-red-400 to-rose-600',     'from-neutral-400 to-neutral-600',
];

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminGaleriePage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useAlbums();
  const deleteAlbum = useDeleteAlbum();

  const albums = (data?.data ?? []) as AlbumDoc[];

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Supprimer l'album "${title}" ? Toutes les photos seront perdues.`)) return;
    deleteAlbum.mutate(id);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Galerie</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{isLoading ? '…' : `${albums.length} album${albums.length > 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus size={14} /> Nouvel album
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center py-14">
          <Loader2 size={24} className="animate-spin text-neutral-300 mb-3" />
          <p className="text-sm text-neutral-400">Chargement…</p>
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add album card */}
          <button onClick={() => setShowCreate(true)}
            className="flex aspect-auto min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 transition-all hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30">
            <Plus size={28} className="opacity-50" />
            <p className="text-sm font-black">Nouvel album</p>
          </button>

          {albums.map((a: AlbumDoc, i: number) => (
            <div key={a._id} className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className={`relative h-32 bg-gradient-to-br ${COVERS[i % COVERS.length]}`}>
                {a.visibility === 'members' && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-black text-white">
                    <EyeOff size={8} /> Membres
                  </span>
                )}
                <button
                  onClick={() => handleDelete(a._id, a.title)}
                  title="Supprimer"
                  className="absolute left-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/70 transition hover:bg-red-600/80 hover:text-white group-hover:flex">
                  <Trash2 size={11} />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-black leading-tight text-neutral-900">{a.title}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">
                    {new Date(a.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <Eye size={9} /> {a.images?.length ?? 0} photo{(a.images?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                {a.tags?.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {a.tags.slice(0, 3).map(t => (
                      <span key={t} className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-500">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && albums.length === 0 && (
        <div className="flex flex-col items-center py-6 text-center">
          <Images size={32} className="mb-3 text-neutral-200" />
          <p className="text-sm font-semibold text-neutral-400">Aucun album pour le moment.</p>
          <p className="mt-1 text-xs text-neutral-300">Cliquez sur &quot;Nouvel album&quot; pour commencer.</p>
        </div>
      )}

      {showCreate && <CreateAlbumModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

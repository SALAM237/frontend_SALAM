'use client';

import { useState, useRef } from 'react';
import {
  Images, Plus, X, Eye, EyeOff, Loader2, Trash2, Edit3,
  Upload, ImagePlus, CheckSquare2, Square,
} from 'lucide-react';
import {
  useAlbums, useCreateAlbum, useUpdateAlbum, useDeleteAlbum,
  useAddImagesToAlbum, useRemoveImageFromAlbum, useReplaceImageInAlbum,
  type AlbumDoc,
} from '@/lib/api/gallery';
import { Lightbox, useLightbox } from '@/components/ui/Lightbox';
import { assetUrl } from '@/lib/assets';

const COVERS = [
  'from-emerald-400 to-teal-600', 'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',  'from-amber-400 to-orange-500',
  'from-red-400 to-rose-600',     'from-neutral-400 to-neutral-600',
];

/* ─── Album form (create / edit) ──────────────────────────── */
function AlbumForm({
  initial, onSubmit, onClose, isPending, title,
}: {
  initial?: AlbumDoc; onSubmit: (d: any) => void;
  onClose: () => void; isPending: boolean; title: string;
}) {
  const [albumTitle, setAlbumTitle] = useState(initial?.title ?? '');
  const [visibility, setVisibility] = useState(initial?.visibility ?? 'public');
  const [tagsInput,  setTagsInput]  = useState(initial?.tags?.join(', ') ?? '');
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  const inp = (err?: string) =>
    `w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 placeholder:text-neutral-300 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  const handleSubmit = () => {
    if (!albumTitle.trim()) { setErrors({ title: 'Titre requis' }); return; }
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onSubmit({ title: albumTitle.trim(), visibility, tags });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h3 className="font-black text-neutral-900">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <input value={albumTitle} onChange={e => { setAlbumTitle(e.target.value); setErrors({}); }} className={inp(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Visibilité</label>
            <div className="flex gap-3">
              {([{ v: 'public', l: 'Public', icon: Eye }, { v: 'members', l: 'Membres', icon: EyeOff }] as const).map(({ v, l, icon: Icon }) => (
                <button key={v} type="button" onClick={() => setVisibility(v)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition ${visibility === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                  <Icon size={13} /> {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Mots-clés <span className="font-normal normal-case text-neutral-300">(séparés par des virgules)</span>
            </label>
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="sport, été, 2025" className={inp()} />
          </div>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:border-neutral-300 transition">Annuler</button>
          <button onClick={handleSubmit} disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60 transition">
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Images size={14} />}
            {initial ? 'Mettre à jour' : 'Créer l\'album'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Album detail panel (manage photos) ──────────────────── */
function AlbumDetail({ albumId, onClose }: { albumId: string; onClose: () => void }) {
  const { data } = useAlbums();
  const album    = (data?.data ?? [] as AlbumDoc[]).find((a: AlbumDoc) => a._id === albumId);

  const fileRef   = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const addImages = useAddImagesToAlbum(albumId);
  const removeImg = useRemoveImageFromAlbum(albumId);
  const replaceImg = useReplaceImageInAlbum(albumId);
  const images    = album?.images ?? [];
  const lb        = useLightbox(images);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  if (!album) return null;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    e.target.value = '';
    addImages.mutate(files);
  };

  const toggleSelection = (idx: number) => {
    setSelected(prev => prev.includes(idx) ? prev.filter(item => item !== idx) : [...prev, idx]);
  };

  const toggleSelectAll = () => {
    setSelected(prev => prev.length === images.length ? [] : images.map((_, idx) => idx));
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Supprimer ${selected.length} image${selected.length > 1 ? 's' : ''} sélectionnée${selected.length > 1 ? 's' : ''} ?`)) return;
    for (const idx of [...selected].sort((a, b) => b - a)) {
      await removeImg.mutateAsync(idx);
    }
    setSelected([]);
    setSelectMode(false);
  };

  const handleReplaceClick = () => {
    if (selected.length !== 1) return;
    if (!confirm('Remplacer cette image par une nouvelle image ?')) return;
    replaceRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || selected.length !== 1) return;
    await replaceImg.mutateAsync({ idx: selected[0], file });
    setSelected([]);
    setSelectMode(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        <div className="flex items-center gap-4 border-b border-neutral-100 px-5 py-4 shrink-0">
          <button onClick={onClose}
            className="flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
            ← Albums
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-neutral-900 truncate">{album.title}</h2>
            <p className="text-xs text-neutral-400">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          <input ref={replaceRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceFile} />
          {images.length > 0 && (
            <button
              onClick={() => { setSelectMode(v => !v); setSelected([]); }}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-xs font-black transition-colors shrink-0 ${selectMode ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}
            >
              {selectMode ? <CheckSquare2 size={13} /> : <Square size={13} />}
              Sélection image
            </button>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={addImages.isPending}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm shrink-0"
          >
            {addImages.isPending ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
            Ajouter des photos
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {selectMode && images.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
              <button onClick={toggleSelectAll}
                className="inline-flex h-8 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 hover:border-emerald-300 hover:text-emerald-700">
                {selected.length === images.length ? <CheckSquare2 size={13} /> : <Square size={13} />}
                Tout sélectionner
              </button>
              <span className="text-xs font-semibold text-neutral-400">{selected.length} image{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}</span>
              <div className="ml-auto flex gap-2">
                <button onClick={handleReplaceClick} disabled={selected.length !== 1 || replaceImg.isPending}
                  className="inline-flex h-8 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-black text-blue-700 transition disabled:cursor-not-allowed disabled:opacity-40">
                  {replaceImg.isPending ? <Loader2 size={13} className="animate-spin" /> : <Edit3 size={13} />}
                  Modifier
                </button>
                <button onClick={handleBulkDelete} disabled={selected.length === 0 || removeImg.isPending}
                  className="inline-flex h-8 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-black text-red-700 transition disabled:cursor-not-allowed disabled:opacity-40">
                  {removeImg.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Supprimer
                </button>
              </div>
            </div>
          )}
          {images.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <Upload size={40} className="mb-3 text-neutral-200" />
              <p className="text-sm font-semibold text-neutral-400">Aucune photo dans cet album.</p>
              <button onClick={() => fileRef.current?.click()}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700 transition-colors">
                <ImagePlus size={13} /> Ajouter des photos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {images.map((img, i) => (
                <div key={i} className={`group relative aspect-square overflow-hidden rounded-xl border shadow-sm ${selected.includes(i) ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-neutral-100'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={assetUrl(img.url)} alt={img.alt ?? ''}
                    className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                    onClick={() => selectMode ? toggleSelection(i) : lb.open(i)} />
                  {selectMode && (
                    <button onClick={() => toggleSelection(i)}
                      className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow-sm">
                      {selected.includes(i) ? <CheckSquare2 size={16} /> : <Square size={16} />}
                    </button>
                  )}
                  {!selectMode && (
                    <button
                      onClick={() => {
                        if (!confirm('Supprimer cette photo ?')) return;
                        removeImg.mutate(i);
                      }}
                      className="absolute right-1.5 top-1.5 hidden h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 transition hover:bg-red-600/90 hover:text-white group-hover:flex"
                      title="Supprimer"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {lb.index !== null && (
        <Lightbox images={images} current={lb.index} onClose={lb.close} onPrev={lb.prev} onNext={lb.next} />
      )}
    </>
  );
}

/* ─── Edit album wrapper ──────────────────────────────────── */
function EditAlbumModal({ album, onClose }: { album: AlbumDoc; onClose: () => void }) {
  const update = useUpdateAlbum(album._id);
  return (
    <AlbumForm title="Modifier l'album" initial={album} isPending={update.isPending}
      onClose={onClose}
      onSubmit={d => update.mutate(d, { onSuccess: onClose })} />
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminGaleriePage() {
  const [showCreate,    setShowCreate]    = useState(false);
  const [editTarget,    setEditTarget]    = useState<AlbumDoc | null>(null);
  const [detailAlbumId, setDetailAlbumId] = useState<string | null>(null);

  const { data, isLoading } = useAlbums();
  const createAlbum = useCreateAlbum();
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
          <button onClick={() => setShowCreate(true)}
            className="flex aspect-auto min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 transition-all hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30">
            <Plus size={28} className="opacity-50" />
            <p className="text-sm font-black">Nouvel album</p>
          </button>

          {albums.map((a: AlbumDoc, i: number) => (
            <div key={a._id} className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div
                className={`relative h-32 bg-gradient-to-br ${COVERS[i % COVERS.length]} cursor-pointer overflow-hidden`}
                onClick={() => setDetailAlbumId(a._id)}
              >
                {a.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={assetUrl(a.images[0].url)} alt="" className="h-full w-full object-cover" />
                )}
                {a.visibility === 'members' && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-black text-white">
                    <EyeOff size={8} /> Membres
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <span className="hidden group-hover:flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-neutral-900">
                    <ImagePlus size={11} /> Gérer les photos
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-black leading-tight text-neutral-900">{a.title}</p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditTarget(a)} title="Modifier"
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:text-emerald-700">
                      <Edit3 size={10} />
                    </button>
                    <button onClick={() => handleDelete(a._id, a.title)} title="Supprimer"
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-red-100 text-red-300 transition hover:border-red-300 hover:text-red-600">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
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
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <AlbumForm title="Nouvel album" isPending={createAlbum.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={d => createAlbum.mutate(d, { onSuccess: () => setShowCreate(false) })} />
      )}
      {editTarget && (
        <EditAlbumModal album={editTarget} onClose={() => setEditTarget(null)} />
      )}
      {detailAlbumId && (
        <AlbumDetail albumId={detailAlbumId} onClose={() => setDetailAlbumId(null)} />
      )}
    </div>
  );
}

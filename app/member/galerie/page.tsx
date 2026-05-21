'use client';

import { useState } from 'react';
import { Images, Loader2, Lock, Plus, X } from 'lucide-react';
import { useMemberAlbums, useSubmitMemberAlbum, type AlbumDoc } from '@/lib/api/gallery';
import { Lightbox, useLightbox } from '@/components/ui/Lightbox';
import { assetUrl } from '@/lib/assets';

const COVERS = [
  'from-emerald-400 to-teal-600', 'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',  'from-amber-400 to-orange-500',
  'from-red-400 to-rose-600',     'from-neutral-400 to-neutral-600',
];

function AlbumView({ album, onClose }: { album: AlbumDoc; onClose: () => void }) {
  const images = album.images.filter(img => img.isPublished);
  const lb = useLightbox(images);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
            ← Albums
          </button>
          <div>
            <h2 className="text-lg font-black text-neutral-900">{album.title}</h2>
            <p className="text-xs text-neutral-400">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
          </div>
          {album.visibility === 'members' && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-black text-emerald-700">
              <Lock size={9} /> Membres
            </span>
          )}
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white py-14 text-center shadow-sm">
            <Images size={36} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">Aucune photo dans cet album.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img, i) => (
              <button key={i} onClick={() => lb.open(i)}
                className="group aspect-square overflow-hidden rounded-xl border border-neutral-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetUrl(img.url)} alt={img.alt ?? ''} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lb.index !== null && (
        <Lightbox images={images} current={lb.index} onClose={lb.close} onPrev={lb.prev} onNext={lb.next} />
      )}
    </>
  );
}

export default function MemberGaleriePage() {
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumDoc | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const { data, isLoading } = useMemberAlbums();
  const albums = data?.data ?? [];

  if (selectedAlbum) {
    return (
      <div className="mx-auto max-w-4xl">
        <AlbumView album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Galerie</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          {isLoading ? '…' : `${albums.length} album${albums.length !== 1 ? 's' : ''}`}
        </p>
        </div>
        <button
          type="button"
          onClick={() => setSubmitOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white transition-all hover:bg-emerald-700 active:scale-95"
        >
          <Plus size={14} /> Soumettre un album
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white py-14 shadow-sm">
          <Loader2 size={24} className="animate-spin text-neutral-300 mb-3" />
          <p className="text-sm text-neutral-400">Chargement…</p>
        </div>
      )}

      {!isLoading && albums.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white px-5 py-14 text-center shadow-sm">
          <Images size={36} className="mb-3 text-neutral-200" />
          <p className="text-sm font-semibold text-neutral-400">Aucun album disponible pour le moment.</p>
          <p className="mt-1 text-xs text-neutral-300">Les albums des événements SALAM apparaîtront ici.</p>
        </div>
      )}

      {!isLoading && albums.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album: AlbumDoc, i: number) => {
            const cover   = album.images.find(img => img.isPublished);
            const count   = album.images.filter(img => img.isPublished).length;
            return (
              <button key={album._id} onClick={() => setSelectedAlbum(album)}
                className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md text-left">
                <div className={`relative h-36 bg-gradient-to-br ${COVERS[i % COVERS.length]} overflow-hidden`}>
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={assetUrl(cover.url)} alt={cover.alt ?? ''} className="h-full w-full object-cover" />
                  )}
                  {album.visibility === 'members' && (
                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-black text-white">
                      <Lock size={8} /> Membres
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-black leading-tight text-neutral-900">{album.title}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    {count} photo{count !== 1 ? 's' : ''} · {new Date(album.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  </p>
                  {album.tags?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {album.tags.slice(0, 3).map(t => (
                        <span key={t} className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-500">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
      {submitOpen && <SubmitAlbumModal onClose={() => setSubmitOpen(false)} />}
    </div>
  );
}

function SubmitAlbumModal({ onClose }: { onClose: () => void }) {
  const submit = useSubmitMemberAlbum();
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'members'>('members');
  const [files, setFiles] = useState<File[]>([]);
  const canSubmit = title.trim() && files.length > 0;

  const move = (from: number, to: number) => {
    setFiles(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const send = () => {
    if (!canSubmit || submit.isPending) return;
    submit.mutate({ title, visibility, files }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-neutral-100 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Soumission membre</p>
            <h2 className="text-lg font-black text-neutral-900">Proposer un album</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
            <X size={15} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de l'album" className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
          <select value={visibility} onChange={e => setVisibility(e.target.value as 'public' | 'members')} className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10">
            <option value="members">Reserve aux membres</option>
            <option value="public">Public</option>
          </select>
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-6 text-center transition hover:bg-emerald-50">
            <Images size={24} className="text-emerald-600" />
            <span className="mt-2 text-sm font-black text-neutral-800">Selectionner des images</span>
            <span className="mt-1 text-xs text-neutral-400">Glissez les vignettes pour changer l'ordre avant soumission.</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={e => setFiles(Array.from(e.target.files ?? []))} />
          </label>
          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {files.map((file, index) => {
                const preview = URL.createObjectURL(file);
                return (
                  <div
                    key={`${file.name}-${index}`}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('text/plain', String(index))}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => move(Number(e.dataTransfer.getData('text/plain')), index)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={file.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onLoad={() => URL.revokeObjectURL(preview)} />
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            L'album sera en attente. Un administrateur devra le valider avant publication.
          </p>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 p-5">
          <button onClick={onClose} className="h-10 flex-1 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:border-neutral-300">Annuler</button>
          <button onClick={send} disabled={!canSubmit || submit.isPending} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50">
            {submit.isPending && <Loader2 size={14} className="animate-spin" />}
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}

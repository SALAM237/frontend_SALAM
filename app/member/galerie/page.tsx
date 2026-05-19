'use client';

import { useState } from 'react';
import { Images, Loader2, Lock } from 'lucide-react';
import { useMemberAlbums, type AlbumDoc } from '@/lib/api/gallery';
import { Lightbox, useLightbox } from '@/components/ui/Lightbox';

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
                <img src={img.url} alt={img.alt ?? ''} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
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
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Galerie</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          {isLoading ? '…' : `${albums.length} album${albums.length !== 1 ? 's' : ''}`}
        </p>
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
                    <img src={cover.url} alt={cover.alt ?? ''} className="h-full w-full object-cover" />
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
    </div>
  );
}

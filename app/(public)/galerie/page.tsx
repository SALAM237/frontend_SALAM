'use client';

import { useState } from 'react';
import { Images, ArrowRight, Lock, Loader2, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';
import { usePublicAlbums, type AlbumDoc } from '@/lib/api/gallery';
import { Lightbox, useLightbox } from '@/components/ui/Lightbox';
import { assetUrl } from '@/lib/assets';

const COVERS = [
  'from-emerald-400 to-teal-600', 'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',  'from-amber-400 to-orange-500',
  'from-red-400 to-rose-600',     'from-neutral-400 to-neutral-600',
];

function AlbumModal({ album, onClose, coverIndex }: { album: AlbumDoc; onClose: () => void; coverIndex: number }) {
  const images = album.images.filter(img => img.isPublished);
  const lb = useLightbox(images);

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-white" onClick={e => e.target === e.currentTarget && onClose()}>
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-neutral-100 px-5 py-4">
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50">
            ← Retour
          </button>
          <div>
            <h2 className="font-black text-neutral-900">{album.title}</h2>
            <p className="text-xs text-neutral-400">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {images.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <Images size={40} className="mb-3 text-neutral-200" />
              <p className="text-sm text-neutral-400">Aucune photo dans cet album pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => lb.open(i)}
                  className="group aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={assetUrl(img.url)} alt={img.alt ?? ''} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </button>
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

export default function GaleriePage() {
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumDoc | null>(null);
  const [selectedIdx,   setSelectedIdx]   = useState(0);

  const { data, isLoading } = usePublicAlbums();
  const albums = data?.data ?? [];

  const handleOpenAlbum = (album: AlbumDoc, idx: number) => {
    setSelectedAlbum(album);
    setSelectedIdx(idx);
  };

  return (
    <main>
      <PageHero
        badge="Médiathèque SALAM"
        title="Galerie"
        accentWord="Notre"
        accentPosition="start"
        subtitle="Photos et souvenirs des événements, activités et moments forts de l'association SALAM."
        breadcrumbs={[{ label: 'Galerie' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/auth/login" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-white/70 transition-all hover:border-white/40 hover:text-white">
            <Lock size={13} /> Galerie privée
          </Link>
        </div>
      </PageHero>

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">

          {isLoading && (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
              <p className="text-sm text-neutral-500">Chargement de la galerie…</p>
            </div>
          )}

          {!isLoading && albums.length === 0 && (
            <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <Images size={28} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">Aucun album disponible pour l&apos;instant</h3>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">Les albums des événements SALAM seront publiés ici.</p>
              </div>
              <Link href="/adhesion" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition-all hover:bg-emerald-700">
                Devenir membre <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {!isLoading && albums.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album: AlbumDoc, i: number) => {
                const cover = album.images.find(img => img.isPublished);
                return (
                  <button
                    key={album._id}
                    onClick={() => handleOpenAlbum(album, i)}
                    className="group overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md text-left"
                  >
                    <div className={`relative h-44 bg-gradient-to-br ${COVERS[i % COVERS.length]} overflow-hidden`}>
                      {cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={assetUrl(cover.url)} alt={cover.alt ?? ''} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-neutral-900">{album.title}</h3>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-neutral-400">
                          {album.images.filter(img => img.isPublished).length} photo{album.images.filter(img => img.isPublished).length !== 1 ? 's' : ''}
                          {' · '}{new Date(album.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </p>
                        {album.tags?.length > 0 && (
                          <div className="flex gap-1">
                            {album.tags.slice(0, 2).map(t => (
                              <span key={t} className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-500">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Section galerie privée */}
      <section className="bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#061009] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Lock size={13} className="text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Galerie privée</span>
            </div>
            <h3 className="text-xl font-black text-white">Accès réservé aux membres</h3>
            <p className="mt-2 max-w-md text-sm text-white/50">
              Les membres SALAM ont accès à une galerie privée avec les photos exclusives des événements.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/login" className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-black text-white transition-all hover:bg-emerald-400">
              Se connecter
            </Link>
            <Link href="/adhesion" className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white/65 transition-all hover:border-white/40 hover:text-white">
              Devenir membre
            </Link>
          </div>
        </div>
      </section>

      {selectedAlbum && (
        <AlbumModal album={selectedAlbum} coverIndex={selectedIdx} onClose={() => setSelectedAlbum(null)} />
      )}
    </main>
  );
}

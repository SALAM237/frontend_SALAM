'use client';

import { useState, useRef } from 'react';
import { Images, ArrowRight, Lock, Loader2, EyeOff, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';
import { usePublicAlbums, useReorderAlbums, useReorderAlbumImages, type AlbumDoc } from '@/lib/api/gallery';
import { Lightbox, useLightbox } from '@/components/ui/Lightbox';
import { assetUrl } from '@/lib/assets';
import { useAuthStore } from '@/store/auth.store';
import { hasAdminRole } from '@/lib/auth/roles';

const COVERS = [
  'from-emerald-400 to-teal-600', 'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',  'from-amber-400 to-orange-500',
  'from-red-400 to-rose-600',     'from-neutral-400 to-neutral-600',
];

/* ── Album modal (avec drag-drop photo si admin) ──────────── */
function AlbumModal({ album, onClose, isAdmin }: { album: AlbumDoc; onClose: () => void; isAdmin: boolean }) {
  const images = album.images.filter(img => img.isPublished !== false);
  const lb = useLightbox(images);
  const reorderImg = useReorderAlbumImages(album._id);

  const dragPhotoFrom = useRef<number | null>(null);
  const dragPhotoTo   = useRef<number | null>(null);
  const [draggingPhoto, setDraggingPhoto] = useState<number | null>(null);
  const [dragOverPhoto, setDragOverPhoto] = useState<number | null>(null);

  const handlePhotoDragStart = (i: number) => { dragPhotoFrom.current = i; setDraggingPhoto(i); };
  const handlePhotoDragEnter = (i: number) => { dragPhotoTo.current = i; setDragOverPhoto(i); };
  const handlePhotoDragEnd   = () => {
    const from = dragPhotoFrom.current;
    const to   = dragPhotoTo.current;
    if (from !== null && to !== null && from !== to) {
      const order = [...Array(images.length).keys()];
      order.splice(to, 0, order.splice(from, 1)[0]);
      reorderImg.mutate(order);
    }
    dragPhotoFrom.current = null;
    dragPhotoTo.current   = null;
    setDraggingPhoto(null);
    setDragOverPhoto(null);
  };

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
          {isAdmin && images.length > 1 && (
            <p className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <GripVertical size={12} /> Glisser pour réordonner
            </p>
          )}
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
                isAdmin ? (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => handlePhotoDragStart(i)}
                    onDragEnter={() => handlePhotoDragEnter(i)}
                    onDragOver={e => e.preventDefault()}
                    onDragEnd={handlePhotoDragEnd}
                    className={`group relative aspect-square overflow-hidden rounded-xl transition-all cursor-grab active:cursor-grabbing ${
                      draggingPhoto === i ? 'opacity-40'
                        : dragOverPhoto === i && draggingPhoto !== null ? 'ring-2 ring-emerald-400 ring-offset-1'
                        : ''
                    }`}
                    onClick={() => lb.open(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetUrl(img.url)} alt={img.alt ?? ''} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute left-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/70 group-hover:flex">
                      <GripVertical size={11} />
                    </div>
                  </div>
                ) : (
                  <button
                    key={i}
                    onClick={() => lb.open(i)}
                    className="group aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetUrl(img.url)} alt={img.alt ?? ''} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </button>
                )
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
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const { data, isLoading } = usePublicAlbums();
  const albums = (data?.data ?? []) as AlbumDoc[];
  const selectedAlbum = albums.find(a => a._id === selectedAlbumId) ?? null;

  const user    = useAuthStore(s => s.user);
  const isAdmin = hasAdminRole(user);
  const reorderAlbs = useReorderAlbums();

  /* ── Drag-drop album reorder (admin only) ── */
  const dragAlbumFrom   = useRef<number | null>(null);
  const dragAlbumTo     = useRef<number | null>(null);
  const [draggingAlbum, setDraggingAlbum] = useState<number | null>(null);
  const [dragOverAlbum, setDragOverAlbum] = useState<number | null>(null);

  const handleAlbumDragStart = (i: number) => { dragAlbumFrom.current = i; setDraggingAlbum(i); };
  const handleAlbumDragEnter = (i: number) => { dragAlbumTo.current = i; setDragOverAlbum(i); };
  const handleAlbumDragEnd   = () => {
    const from = dragAlbumFrom.current;
    const to   = dragAlbumTo.current;
    if (from !== null && to !== null && from !== to) {
      const reordered = [...albums];
      reordered.splice(to, 0, reordered.splice(from, 1)[0]);
      reorderAlbs.mutate(reordered.map(a => a._id));
    }
    dragAlbumFrom.current = null;
    dragAlbumTo.current   = null;
    setDraggingAlbum(null);
    setDragOverAlbum(null);
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
            <>
              {isAdmin && albums.length > 1 && (
                <p className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <GripVertical size={12} /> Glisser-déposer pour réordonner les albums (admin)
                </p>
              )}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((album: AlbumDoc, i: number) => {
                  const cover = album.images.find(img => img.isPublished);
                  return isAdmin ? (
                    <div
                      key={album._id}
                      draggable
                      onDragStart={() => handleAlbumDragStart(i)}
                      onDragEnter={() => handleAlbumDragEnter(i)}
                      onDragOver={e => e.preventDefault()}
                      onDragEnd={handleAlbumDragEnd}
                      onClick={() => setSelectedAlbumId(album._id)}
                      className={`group overflow-hidden rounded-[1.5rem] border bg-white shadow-sm transition-all cursor-grab active:cursor-grabbing text-left ${
                        draggingAlbum === i ? 'opacity-40 border-neutral-200'
                          : dragOverAlbum === i && draggingAlbum !== null ? 'border-emerald-400 ring-2 ring-emerald-400/30 shadow-md'
                          : 'border-neutral-200 hover:-translate-y-1 hover:shadow-md'
                      }`}
                    >
                      <div className={`relative h-44 bg-gradient-to-br ${COVERS[i % COVERS.length]} overflow-hidden`}>
                        {cover && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={assetUrl(cover.url)} alt={cover.alt ?? ''} className="h-full w-full object-cover" />
                        )}
                        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/80">
                          <GripVertical size={14} />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-neutral-900">{album.title}</h3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-neutral-400">
                            {album.images.filter(img => img.isPublished !== false).length} photo{album.images.filter(img => img.isPublished !== false).length !== 1 ? 's' : ''}
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
                    </div>
                  ) : (
                    <button
                      key={album._id}
                      onClick={() => setSelectedAlbumId(album._id)}
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
                            {album.images.filter(img => img.isPublished !== false).length} photo{album.images.filter(img => img.isPublished !== false).length !== 1 ? 's' : ''}
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
            </>
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
        <AlbumModal album={selectedAlbum} onClose={() => setSelectedAlbumId(null)} isAdmin={isAdmin} />
      )}
    </main>
  );
}

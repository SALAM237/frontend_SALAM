'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Images, FlaskConical } from 'lucide-react';
import { demoGallery } from '@/data/demo/demo-gallery';

const EXTENDED_GALLERY = [
  ...demoGallery,
  { id: 'g4', title: 'Forum emploi 2025',    category: 'reseau'     },
  { id: 'g5', title: 'Action humanitaire',   category: 'solidarite' },
  { id: 'g6', title: 'Cérémonie de remise',  category: 'culture'    },
];

const CATS = [
  { id: 'all',        label: 'Tous' },
  { id: 'culture',    label: 'Culture' },
  { id: 'sport',      label: 'Sport' },
  { id: 'etude',      label: 'Étude' },
  { id: 'reseau',     label: 'Réseau' },
  { id: 'solidarite', label: 'Solidarité' },
];

const GRADIENTS = [
  'from-emerald-400 to-emerald-600',
  'from-blue-400 to-blue-600',
  'from-yellow-400 to-orange-500',
  'from-red-400 to-red-600',
  'from-purple-400 to-purple-600',
  'from-teal-400 to-teal-600',
];

const PHOTO_COUNTS = [14, 9, 22, 7, 18, 11];

export default function DemoGaleriePage() {
  const [cat, setCat] = useState('all');
  const list = cat === 'all' ? EXTENDED_GALLERY : EXTENDED_GALLERY.filter(g => g.category === cat);

  return (
    <main className="min-h-screen bg-[#fffdf8]">

      {/* Demo banner */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 border-b border-yellow-200 bg-yellow-50 px-5 py-2.5 md:px-8">
        <div className="flex items-center gap-2 text-xs font-bold text-yellow-800">
          <FlaskConical size={13} />
          Mode démo — données fictives
        </div>
        <Link href="/galerie" className="text-xs font-semibold text-yellow-700 hover:text-yellow-900">
          ← Version production
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <Link href="/demo" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-neutral-700 transition-colors">
            <ArrowLeft size={14} /> Démo
          </Link>
          <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
            Galerie <span className="text-emerald-600">SALAM</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{EXTENDED_GALLERY.length} albums · Photos des événements et activités</p>
        </div>
      </div>

      <section className="px-5 py-10 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATS.map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`h-9 rounded-full px-4 text-xs font-bold transition-all ${
                  cat === c.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-dashed border-neutral-200 bg-white py-20 text-center">
              <Images size={32} className="text-neutral-300" />
              <p className="text-sm font-bold text-neutral-400">Aucun album dans cette catégorie</p>
              <button onClick={() => setCat('all')} className="text-xs font-semibold text-emerald-700">Voir tous les albums</button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((album, i) => (
                <div
                  key={album.id}
                  className="group overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className={`relative aspect-[16/10] bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center`}>
                    <Images size={32} className="text-white/40" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-black text-neutral-900">{album.title}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-500 capitalize">{album.category}</span>
                      <span className="text-[11px] text-neutral-400">{PHOTO_COUNTS[i % PHOTO_COUNTS.length]} photos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="text-sm font-black text-emerald-800">Galerie privée réservée aux membres</p>
            <p className="mt-1 text-xs text-emerald-600">Accédez à l'intégralité des photos exclusives en rejoignant SALAM.</p>
            <Link href="/adhesion" className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-xs font-black text-white hover:bg-emerald-700 transition-all">
              Devenir membre →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { Images, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

const TYPES = [
  { id: 'all', label: 'Tous les albums' },
  { id: 'public', label: 'Albums publics' },
  { id: 'activites', label: 'Par activité' },
];

const ALBUMS: { id: string; title: string; count: number; type: string; date: string }[] = [];

export default function GaleriePage() {
  const [type, setType] = useState('all');
  const filtered = ALBUMS.filter(a => type === 'all' || a.type === type);

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
          <Link href="/demo/galerie" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-black text-white transition-all hover:bg-emerald-400">
            Voir la démo <ArrowRight size={13} />
          </Link>
          <Link href="/auth/login" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-white/70 transition-all hover:border-white/40 hover:text-white">
            <Lock size={13} /> Galerie privée
          </Link>
        </div>
      </PageHero>

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`h-9 rounded-full px-4 text-xs font-bold transition-all ${
                  type === t.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <Images size={28} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">Aucun album disponible pour l'instant</h3>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">
                  Les albums photos des événements SALAM seront publiés ici. Consultez la démo pour voir des exemples.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/demo/galerie" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition-all hover:bg-emerald-700">
                  Voir la démo <ArrowRight size={13} />
                </Link>
                <Link href="/adhesion" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition-all">
                  Devenir membre
                </Link>
              </div>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(album => (
                <div key={album.id} className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="aspect-[16/10] bg-gradient-to-br from-emerald-100 to-emerald-200" />
                  <div className="p-4">
                    <h3 className="font-black text-neutral-900">{album.title}</h3>
                    <p className="mt-1 text-xs text-neutral-500">{album.count} photo{album.count > 1 ? 's' : ''} · {album.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#061009] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
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
        </div>
      </section>
    </main>
  );
}

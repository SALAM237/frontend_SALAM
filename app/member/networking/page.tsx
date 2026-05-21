'use client';

import { Handshake, Search } from 'lucide-react';

export default function NetworkingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Networking</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Repertoire de competences et de secteurs d'activite SALAM.</p>
      </div>
      <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            placeholder="Rechercher un secteur, une competence, un domaine..."
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center">
          <Handshake size={34} className="mb-3 text-neutral-200" />
          <p className="text-sm font-black text-neutral-500">Le moteur networking arrive ici.</p>
          <p className="mt-1 max-w-md text-xs leading-6 text-neutral-400">
            Les secteurs, competences et domaines renseignes dans les profils alimenteront cette recherche.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Newspaper, Plus } from 'lucide-react';

export default function AdminActualitesPage() {
  return (
    <div className="w-full space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Actualités</h1>
          <p className="mt-0.5 text-sm text-neutral-500">0 article</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700">
          <Plus size={14} />
          <span className="hidden sm:inline">Nouvel article</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="flex flex-col items-center px-5 py-14 text-center">
          <Newspaper size={32} className="mb-3 text-neutral-200" />
          <p className="text-sm font-semibold text-neutral-400">Aucun article pour le moment.</p>
          <p className="mt-1 text-xs text-neutral-300">Les articles publiés apparaîtront ici.</p>
        </div>
      </div>
    </div>
  );
}

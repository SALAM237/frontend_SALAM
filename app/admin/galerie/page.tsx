'use client';

import { Images, Plus } from 'lucide-react';

export default function AdminGaleriePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Galerie</h1>
          <p className="mt-0.5 text-sm text-neutral-500">0 album</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700">
          <Plus size={14} /> Nouvel album
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Add album card */}
        <button className="flex aspect-auto min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 transition-all hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30">
          <Plus size={28} className="opacity-50" />
          <p className="text-sm font-black">Nouvel album</p>
        </button>
      </div>

      <div className="flex flex-col items-center py-6 text-center">
        <Images size={32} className="mb-3 text-neutral-200" />
        <p className="text-sm font-semibold text-neutral-400">Aucun album pour le moment.</p>
        <p className="mt-1 text-xs text-neutral-300">Les albums créés apparaîtront ici.</p>
      </div>
    </div>
  );
}

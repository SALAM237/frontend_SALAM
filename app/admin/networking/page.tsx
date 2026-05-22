'use client';

import Link from 'next/link';
import { Handshake, Search, ShieldCheck, Tags } from 'lucide-react';

export default function AdminNetworkingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Networking</h1>
          <p className="mt-1 text-sm text-neutral-500">Pilotage des secteurs, competences et demandes a valider.</p>
        </div>
        <Link href="/admin/validations" className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700">
          <ShieldCheck size={14} /> Validations en attente
        </Link>
      </div>

      <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            placeholder="Rechercher un secteur, une competence, un domaine..."
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Tags size={18} />
              <p className="text-sm font-black">Secteurs proposes</p>
            </div>
            <p className="mt-2 text-xs leading-6 text-emerald-900/70">
              Les secteurs ajoutes par les membres sont centralises dans les validations. Une fois acceptes, ils alimentent le repertoire networking.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4">
            <div className="flex items-center gap-2 text-neutral-700">
              <Handshake size={18} />
              <p className="text-sm font-black">Repertoire de competences</p>
            </div>
            <p className="mt-2 text-xs leading-6 text-neutral-500">
              Les profils membres enrichissent progressivement les recherches par secteur, competence et domaine d'expertise.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

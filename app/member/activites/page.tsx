'use client';

import { CalendarDays } from 'lucide-react';

export default function MemberActivitesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Mes activités</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Événements SALAM auxquels vous participez</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="flex flex-col items-center px-5 py-16 text-center">
          <CalendarDays size={36} className="mb-3 text-neutral-200" />
          <p className="text-sm font-semibold text-neutral-400">Aucune activité pour le moment.</p>
          <p className="mt-1 text-xs text-neutral-300">Les événements auxquels vous êtes inscrit apparaîtront ici.</p>
        </div>
      </div>
    </div>
  );
}

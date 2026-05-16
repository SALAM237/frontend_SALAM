'use client';

import { Newspaper, Plus, Eye, Trash2, Edit } from 'lucide-react';

type Status = 'published' | 'draft';

const NEWS = [
  { id: 1, title: 'SALAM célèbre 15 ans d\'engagement pour la jeunesse camerounaise',       date: '10 mai 2025',  status: 'published' as Status, category: 'Association', views: 342 },
  { id: 2, title: 'Bilan de la Soirée Networking Paris — 80 membres réunis',                 date: '28 avr 2025',  status: 'published' as Status, category: 'Événement',   views: 218 },
  { id: 3, title: 'Nouveau programme d\'accompagnement académique 2025–2026',                 date: '15 avr 2025',  status: 'published' as Status, category: 'Programme',   views: 156 },
  { id: 4, title: 'Partenariat SALAM × Université Mohammed V de Rabat',                      date: '3 avr 2025',   status: 'draft'     as Status, category: 'Partenariat', views: 0   },
  { id: 5, title: 'Portrait : Armelle Fotso, ingénieure et présidente de l\'antenne Paris',  date: '20 mars 2025', status: 'published' as Status, category: 'Portrait',    views: 489 },
];

const sCfg: Record<Status, { label: string; cls: string }> = {
  published: { label: 'Publié',    cls: 'bg-emerald-50 text-emerald-700' },
  draft:     { label: 'Brouillon', cls: 'bg-yellow-50 text-yellow-700'  },
};

const catColors: Record<string, string> = {
  'Association': 'bg-emerald-50 text-emerald-700',
  'Événement':   'bg-blue-50 text-blue-700',
  'Programme':   'bg-purple-50 text-purple-700',
  'Partenariat': 'bg-orange-50 text-orange-700',
  'Portrait':    'bg-red-50 text-red-700',
};

export default function AdminActualitesPage() {
  return (
    <div className="w-full space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Actualités</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{NEWS.length} articles</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700">
          <Plus size={14} />
          <span className="hidden sm:inline">Nouvel article</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">

        {/* Table — lg+ uniquement */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Article</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Catégorie</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Vues</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {NEWS.map(n => (
                <tr key={n.id} className="group transition-colors hover:bg-neutral-50/40">
                  <td className="max-w-[240px] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                        <Newspaper size={14} className="text-neutral-500" />
                      </div>
                      <p className="truncate text-sm font-semibold text-neutral-900">{n.title}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${catColors[n.category] || 'bg-neutral-50 text-neutral-500'}`}>{n.category}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-neutral-500">{n.date}</td>
                  <td className="px-4 py-4 text-xs font-semibold text-neutral-600">{n.views > 0 ? n.views : '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${sCfg[n.status].cls}`}>{sCfg[n.status].label}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:text-emerald-700"><Eye size={13} /></button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-blue-300 hover:text-blue-600"><Edit size={13} /></button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards mobile + tablette (< lg) */}
        <div className="divide-y divide-neutral-50 lg:hidden">
          {NEWS.map(n => (
            <div key={n.id} className="flex items-start gap-3 px-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                <Newspaper size={16} className="text-neutral-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{n.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${catColors[n.category] || 'bg-neutral-50 text-neutral-500'}`}>{n.category}</span>
                  <span className="text-[10px] text-neutral-400">{n.date}</span>
                  {n.views > 0 && <span className="text-[10px] text-neutral-400">{n.views} vues</span>}
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${sCfg[n.status].cls}`}>{sCfg[n.status].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

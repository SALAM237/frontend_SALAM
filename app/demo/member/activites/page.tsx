'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CalendarDays, Search, MapPin, Users, Eye, X } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';

const CAT_COLORS: Record<string, string> = {
  sport:       'bg-blue-50 text-blue-700 border-blue-200',
  culture:     'bg-purple-50 text-purple-700 border-purple-200',
  etude:       'bg-yellow-50 text-yellow-700 border-yellow-200',
  conference:  'bg-orange-50 text-orange-700 border-orange-200',
  atelier:     'bg-pink-50 text-pink-700 border-pink-200',
  entraide:    'bg-teal-50 text-teal-700 border-teal-200',
  benevolat:   'bg-red-50 text-red-700 border-red-200',
  reseau:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  orientation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const CAT_LABELS: Record<string, string> = {
  sport: 'Sport', culture: 'Culture', etude: 'Etude', conference: 'Conference',
  atelier: 'Atelier', entraide: 'Entraide', benevolat: 'Benevolat',
  reseau: 'Reseau', orientation: 'Orientation',
};

const CATEGORIES = [
  { value: 'all', label: 'Toutes' },
  { value: 'sport', label: 'Sport' },
  { value: 'culture', label: 'Culture' },
  { value: 'etude', label: 'Etude' },
  { value: 'benevolat', label: 'Benevolat' },
  { value: 'reseau', label: 'Reseau' },
];

const DEMO_ACTIVITIES = [
  {
    id: '1', slug: 'tournoi-fraternite',
    title: 'Tournoi de la fraternite SALAM',
    category: 'sport', status: 'published',
    startDate: '2026-06-20T09:00:00Z',
    location: 'Stade annexe, Yaounde',
    capacity: 60,
    shortDescription: 'Moment sportif et convivial entre membres. Football, volleyball et jeux de societe.',
    createdAt: '2026-06-01T00:00:00Z',
    inscrit: true,
  },
  {
    id: '2', slug: 'atelier-orientation',
    title: 'Atelier orientation et carriere',
    category: 'etude', status: 'published',
    startDate: '2026-07-05T14:00:00Z',
    location: 'En ligne (Zoom)',
    capacity: 30,
    shortDescription: 'Aide aux etudiants et jeunes diplomes pour leur insertion professionnelle au Maroc.',
    createdAt: '2026-05-28T00:00:00Z',
    inscrit: false,
  },
  {
    id: '3', slug: 'soiree-culturelle',
    title: 'Soiree culturelle Cameroun-Maroc',
    category: 'culture', status: 'published',
    startDate: '2026-08-12T18:00:00Z',
    location: 'Salle des fetes, Yaounde',
    capacity: 120,
    shortDescription: 'Valorisation des cultures camerounaise et marocaine : musique, danse, gastronomie.',
    createdAt: '2026-05-20T00:00:00Z',
    inscrit: false,
  },
  {
    id: '4', slug: 'conference-entrepreneuriat',
    title: 'Conference entrepreneuriat & innovation',
    category: 'conference', status: 'published',
    startDate: '2026-09-02T10:00:00Z',
    location: 'CCIAM, Yaounde',
    capacity: 80,
    shortDescription: 'Temoignages de lauréats entrepreneurs, pistes de financement et reseautage.',
    createdAt: '2026-05-15T00:00:00Z',
    inscrit: false,
  },
  {
    id: '5', slug: 'action-benevole',
    title: 'Action benevole solidaire',
    category: 'benevolat', status: 'finished',
    startDate: '2026-04-10T08:00:00Z',
    location: 'Quartier Melen, Yaounde',
    capacity: 25,
    shortDescription: 'Aide et accompagnement de nouveaux arrivants : parrainage, logement, demarches.',
    createdAt: '2026-03-10T00:00:00Z',
    inscrit: false,
  },
  {
    id: '6', slug: 'networking-professionnels',
    title: 'Networking professionnels SALAM',
    category: 'reseau', status: 'published',
    startDate: '2026-07-18T19:00:00Z',
    location: 'Restaurant Terrasse, Rabat',
    capacity: 40,
    shortDescription: 'Soiree de mise en reseau entre membres professionnels etablis et jeunes laureats.',
    createdAt: '2026-05-05T00:00:00Z',
    inscrit: false,
  },
];

export default function DemoMemberActivitesPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [selected, setSelected] = useState<typeof DEMO_ACTIVITIES[0] | null>(null);

  const filtered = useMemo(() =>
    [...DEMO_ACTIVITIES]
      .filter(a => (cat === 'all' || a.category === cat) && a.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [search, cat]
  );

  return (
    <DemoPortalShell type="member" title="Activites">
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Activités</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{DEMO_ACTIVITIES.length} activités disponibles</p>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCat(c.value)}
                className={`h-7 rounded-full px-3 text-[11px] font-bold transition-all ${cat === c.value ? 'bg-emerald-600 text-white' : 'border border-neutral-200 text-neutral-600 hover:border-emerald-300'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <CalendarDays size={36} className="mb-3 text-neutral-200" />
              <p className="text-sm font-semibold text-neutral-400">Aucune activité correspondante.</p>
              <button onClick={() => { setSearch(''); setCat('all'); }}
                className="mt-3 text-xs font-semibold text-emerald-600 hover:underline">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(a => {
                const catCls   = CAT_COLORS[a.category] ?? 'bg-neutral-50 text-neutral-600 border-neutral-200';
                const catLabel = CAT_LABELS[a.category] ?? a.category;
                const sCls = a.status === 'published' ? 'bg-emerald-500 text-white' : a.status === 'finished' ? 'bg-neutral-400 text-white' : 'bg-yellow-400 text-white';
                const sLabel = a.status === 'published' ? 'Ouverte' : a.status === 'finished' ? 'Passée' : 'Brouillon';
                return (
                  <article key={a.id} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                    {/* Bannière catégorie */}
                    <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
                      <CalendarDays size={44} className="text-white/20" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2.5 left-3 flex flex-wrap gap-1.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black ${sCls}`}>{sLabel}</span>
                        <span className={`inline-flex rounded-full border bg-white/90 px-2.5 py-0.5 text-[10px] font-black ${catCls}`}>{catLabel}</span>
                      </div>
                      {a.inscrit && (
                        <span className="absolute right-2.5 top-2.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-white">✓ Inscrit</span>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex flex-col gap-2.5 p-4">
                      <div>
                        <h3 className="text-sm font-black leading-snug text-neutral-900 line-clamp-2">{a.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-neutral-500 line-clamp-2">{a.shortDescription}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-neutral-400">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {new Date(a.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1"><MapPin size={11} />{a.location}</span>
                        <span className="flex items-center gap-1"><Users size={11} />{a.capacity} places</span>
                      </div>
                      <div className="border-t border-neutral-100 pt-2">
                        <button
                          onClick={() => setSelected(a)}
                          className="inline-flex h-7 items-center gap-1 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-black text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
                          <Eye size={11} /> Voir
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal détail */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">{CAT_LABELS[selected.category]}</p>
                  <h2 className="mt-1 text-lg font-black tracking-[-0.02em] text-neutral-900">{selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
                  <X size={15} />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <p className="text-sm leading-7 text-neutral-700">{selected.shortDescription}</p>
                <div className="grid gap-2 text-xs text-neutral-500 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
                    <CalendarDays size={13} className="text-emerald-600" />
                    <span>{new Date(selected.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
                    <MapPin size={13} className="text-emerald-600" />
                    <span>{selected.location}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
                    <Users size={13} className="text-emerald-600" />
                    <span>{selected.capacity} places</span>
                  </div>
                </div>
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  Ceci est une démonstration — aucune inscription réelle ne sera enregistrée.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DemoPortalShell>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CalendarDays, Search, MapPin, Users, Loader2, Eye, X } from 'lucide-react';
import { useMemberActivities, ACTIVITY_CATEGORIES } from '@/lib/api/activities';
import { trackEvent } from '@/lib/analytics';

const CAT_COLORS: Record<string, string> = {
  sport: 'bg-blue-50 text-blue-700 border-blue-200',
  culture: 'bg-purple-50 text-purple-700 border-purple-200',
  etude: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  conference: 'bg-orange-50 text-orange-700 border-orange-200',
  atelier: 'bg-pink-50 text-pink-700 border-pink-200',
  entraide: 'bg-teal-50 text-teal-700 border-teal-200',
  benevolat: 'bg-red-50 text-red-700 border-red-200',
  reseau: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  orientation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  insertion: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

export default function MemberActivitesPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('all');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading } = useMemberActivities();
  const activities = data?.data?.activities ?? [];

  const filtered = useMemo(() =>
    activities.filter(a =>
      (cat === 'all' || a.category === cat) &&
      a.title.toLowerCase().includes(search.toLowerCase())
    ),
  [activities, cat, search]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Activités</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          {isLoading ? '…' : `${activities.length} activité${activities.length !== 1 ? 's' : ''} disponible${activities.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[{ value: 'all', label: 'Toutes' }, ...ACTIVITY_CATEGORIES].map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className={`h-7 rounded-full px-3 text-[11px] font-bold transition-all ${cat === c.value ? 'bg-emerald-600 text-white' : 'border border-neutral-200 text-neutral-600 hover:border-emerald-300'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {isLoading && (
          <div className="flex flex-col items-center py-14">
            <Loader2 size={24} className="animate-spin text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-400">Chargement…</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <CalendarDays size={36} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">
              {search || cat !== 'all' ? 'Aucune activité correspondante.' : 'Aucune activité publiée pour le moment.'}
            </p>
            {(search || cat !== 'all') && (
              <button onClick={() => { setSearch(''); setCat('all'); }}
                className="mt-3 text-xs font-semibold text-emerald-600 hover:underline">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(a => {
              const catCls   = CAT_COLORS[a.category] ?? 'bg-neutral-50 text-neutral-600 border-neutral-200';
              const catLabel = ACTIVITY_CATEGORIES.find(c => c.value === a.category)?.label ?? a.category;
              const sCls = a.status === 'published' ? 'bg-emerald-500 text-white' : a.status === 'finished' ? 'bg-neutral-400 text-white' : a.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-white';
              const sLabel = a.status === 'published' ? 'Ouverte' : a.status === 'finished' ? 'Passée' : a.status === 'cancelled' ? 'Annulée' : 'Brouillon';
              return (
                <article key={a._id} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  {/* Bannière catégorie */}
                  <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
                    {a.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.thumbnailUrl || a.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <CalendarDays size={44} className="text-white/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 flex flex-wrap gap-1.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black ${sCls}`}>{sLabel}</span>
                      <span className={`inline-flex rounded-full border bg-white/90 px-2.5 py-0.5 text-[10px] font-black ${catCls}`}>{catLabel}</span>
                    </div>
                    {a.myInvitation?.rsvpStatus === 'present' && (
                      <span className="absolute right-2.5 top-2.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-white">✓ Inscrit</span>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex flex-col gap-2.5 p-4">
                    <div>
                      <h3 className="text-sm font-black leading-snug text-neutral-900 line-clamp-2">{a.title}</h3>
                      {(a.shortDescription || a.description) && (
                        <p className="mt-1 text-xs leading-5 text-neutral-500 line-clamp-2">{a.shortDescription || a.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-neutral-400">
                      {a.startDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {new Date(a.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {(a.venue || a.location) && <span className="flex items-center gap-1"><MapPin size={11} />{a.venue || a.location}</span>}
                      {a.capacity && <span className="flex items-center gap-1"><Users size={11} />{a.capacity} places</span>}
                    </div>
                    <div className="border-t border-neutral-100 pt-2">
                      <Link
                        href={`/member/activites/${a.slug}`}
                        onClick={() => trackEvent('activity_click', { activity_id: a._id, activity_slug: a.slug, activity_title: a.title, category: a.category, status: a.status, source: 'member_list', action: 'view_button_click' })}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-black text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
                        <Eye size={11} /> Voir
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                  {ACTIVITY_CATEGORIES.find(c => c.value === selected.category)?.label ?? selected.category}
                </p>
                <h2 className="mt-1 text-lg font-black tracking-[-0.02em] text-neutral-900">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
                <X size={15} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {selected.description && <p className="whitespace-pre-line break-words text-sm leading-7 text-neutral-700">{selected.description}</p>}
              <div className="grid gap-2 text-xs text-neutral-500 sm:grid-cols-2">
                {selected.startDate && <Info icon={CalendarDays} text={new Date(selected.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />}
                {selected.location && <Info icon={MapPin} text={selected.location} />}
                {selected.capacity && <Info icon={Users} text={`${selected.capacity} places`} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
      <Icon size={13} className="text-emerald-600" />
      <span className="min-w-0 truncate">{text}</span>
    </div>
  );
}

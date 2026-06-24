'use client';

import { useState, useMemo } from 'react';
import { Newspaper, Search, Eye, Tag, X, Plus } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';

const ARTICLE_CATEGORIES = [
  { value: 'all',          label: 'Tous' },
  { value: 'association',  label: 'Association' },
  { value: 'mentorat',     label: 'Mentorat' },
  { value: 'carriere',     label: 'Carrière' },
  { value: 'culture',      label: 'Culture' },
  { value: 'solidarite',   label: 'Solidarité' },
];

const DEMO_NEWS = [
  {
    id: 'n1', slug: 'lancement-salam',
    title: 'Lancement de la plateforme numérique SALAM',
    category: 'association',
    status: 'published',
    excerpt: 'Une plateforme moderne pour connecter les membres, les laureats et les partenaires SALAM Cameroun partout dans le monde.',
    imageUrl: null,
    createdAt: '2026-06-10T00:00:00Z',
  },
  {
    id: 'n2', slug: 'mentorat-2026',
    title: 'Programme mentorat 2026 : les inscriptions sont ouvertes',
    category: 'mentorat',
    status: 'published',
    excerpt: 'Les anciens accompagnent les nouveaux etudiants dans leur orientation et leur insertion professionnelle. 48 mentors disponibles cette annee.',
    imageUrl: null,
    createdAt: '2026-05-28T00:00:00Z',
  },
  {
    id: 'n3', slug: 'partenariat-cciam',
    title: 'Partenariat SALAM × CCIAM : nouvelles opportunités',
    category: 'carriere',
    status: 'published',
    excerpt: 'SALAM signe un accord de partenariat avec la CCIAM pour faciliter l\'insertion professionnelle des lauréats camerounais au Maroc.',
    imageUrl: null,
    createdAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'n4', slug: 'gala-2026',
    title: 'Gala annuel SALAM 2026 — compte rendu',
    category: 'association',
    status: 'published',
    excerpt: 'Retour sur la soiree de gala qui a rassemble plus de 200 membres et partenaires de l\'association a Yaounde.',
    imageUrl: null,
    createdAt: '2026-04-30T00:00:00Z',
  },
];

export default function DemoMemberActualitesPage() {
  const [search, setSearch]       = useState('');
  const [cat, setCat]             = useState('all');
  const [selected, setSelected]   = useState<typeof DEMO_NEWS[0] | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const filtered = useMemo(() =>
    [...DEMO_NEWS]
      .filter(n => (cat === 'all' || n.category === cat) && n.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [search, cat]
  );

  return (
    <DemoPortalShell type="member" title="Actualites">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Actualités</h1>
            <p className="mt-0.5 text-sm text-neutral-500">{DEMO_NEWS.length} articles</p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white transition-all hover:bg-emerald-700 active:scale-95"
          >
            <Plus size={14} /> Soumettre une actualite
          </button>
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
            {ARTICLE_CATEGORIES.map(c => (
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
              <Newspaper size={36} className="mb-3 text-neutral-200" />
              <p className="text-sm font-semibold text-neutral-400">Aucun article correspondant.</p>
              <button onClick={() => { setSearch(''); setCat('all'); }}
                className="mt-3 text-xs font-semibold text-emerald-600 hover:underline">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid gap-3 p-4">
              {filtered.map(n => {
                const catLabel = ARTICLE_CATEGORIES.find(c => c.value === n.category)?.label ?? 'Général';
                return (
                  <article key={n.id} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex sm:items-stretch">
                    {/* Image */}
                    <div className="relative h-44 shrink-0 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 sm:h-auto sm:w-52">
                      <div className="flex h-full items-center justify-center">
                        <Newspaper size={32} className="text-blue-200" />
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-emerald-700">
                            Publié
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-500">
                            <Tag size={9} /> {catLabel}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-black leading-snug text-neutral-900 line-clamp-2">{n.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-neutral-500 line-clamp-2">{n.excerpt}</p>
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-neutral-400">
                          <Eye size={10} />
                          {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => setSelected(n)}
                          className="inline-flex h-7 items-center gap-1 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-black text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
                          <Eye size={11} /> Lire
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal article */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-5">
                <div>
                  <p className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                    <Tag size={10} />
                    {ARTICLE_CATEGORIES.find(c => c.value === selected.category)?.label ?? 'General'}
                  </p>
                  <h2 className="mt-3 text-lg font-black tracking-[-0.02em] text-neutral-900">{selected.title}</h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
                  <X size={15} />
                </button>
              </div>
              <div className="max-h-[68vh] overflow-y-auto p-5">
                <p className="text-sm leading-7 text-neutral-700">{selected.excerpt}</p>
                <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  Ceci est une démonstration — contenu fictif à titre illustratif.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal soumission (fictive) */}
        {submitOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-neutral-100 p-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Soumission membre</p>
                  <h2 className="text-lg font-black text-neutral-900">Proposer une actualité</h2>
                </div>
                <button onClick={() => setSubmitOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
                  <X size={15} />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
                  <input placeholder="Titre de l'actualité" className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Catégorie</label>
                  <select className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400">
                    {ARTICLE_CATEGORIES.filter(c => c.value !== 'all').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Résumé</label>
                  <textarea rows={2} placeholder="Résumé court" className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Contenu <span className="text-red-500">*</span></label>
                  <textarea rows={5} placeholder="Contenu de l'actualité" className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                </div>
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  Ceci est une démonstration — aucune soumission réelle ne sera envoyée.
                </p>
              </div>
              <div className="flex gap-3 border-t border-neutral-100 p-5">
                <button onClick={() => setSubmitOpen(false)} className="h-10 flex-1 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:border-neutral-300">Annuler</button>
                <button onClick={() => setSubmitOpen(false)} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white hover:bg-emerald-700">
                  Soumettre
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DemoPortalShell>
  );
}

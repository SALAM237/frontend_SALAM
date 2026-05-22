'use client';

import { useState, useMemo } from 'react';
import {
  FileText, Download, Eye, Receipt, File, Award, FolderOpen, Search,
} from 'lucide-react';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';

type DocType = 'recu' | 'facture' | 'attestation' | 'divers';

interface Doc {
  id: string;
  name: string;
  type: DocType;
  date: string;
  size: string;
  description?: string;
}

const TYPE_CONFIG: Record<DocType, { label: string; badge: string; icon: React.ReactNode }> = {
  recu:        { label: 'Reçu',        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Receipt size={15} className="text-emerald-600" /> },
  facture:     { label: 'Facture',     badge: 'bg-violet-50  text-violet-700  border-violet-200',  icon: <FileText size={15} className="text-violet-600"  /> },
  attestation: { label: 'Attestation', badge: 'bg-amber-50   text-amber-700   border-amber-200',   icon: <Award size={15}    className="text-amber-600"    /> },
  divers:      { label: 'Divers',      badge: 'bg-neutral-50 text-neutral-600 border-neutral-200', icon: <File size={15}     className="text-neutral-500"  /> },
};

const TABS: { value: 'all' | DocType; label: string }[] = [
  { value: 'all',         label: 'Tous' },
  { value: 'recu',        label: 'Reçus' },
  { value: 'facture',     label: 'Factures' },
  { value: 'attestation', label: 'Attestations' },
  { value: 'divers',      label: 'Divers' },
];

export default function MemberDocumentsPage() {
  const [tab,    setTab]    = useState<'all' | DocType>('all');
  const [search, setSearch] = useState('');

  const docs: Doc[] = [];

  const filtered = useMemo(() =>
    docs.filter(d => {
      const matchTab    = tab === 'all' || d.type === tab;
      const matchSearch = `${d.name} ${d.description ?? ''}`.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    }),
  [docs, tab, search]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Mes documents</h1>
        <p className="mt-1 text-sm text-neutral-500">Tous vos documents officiels émis par l&apos;association.</p>
      </div>

      {/* Tabs */}
      <AnimatedTabBar items={TABS} value={tab} onChange={setTab} />

      {/* Search */}
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un document…"
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
        />
      </div>

      {/* Document list */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-3.5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            {filtered.length} document{filtered.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="divide-y divide-neutral-50">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <FolderOpen size={32} className="mb-3 text-neutral-200" />
              <p className="text-sm font-semibold text-neutral-400">Aucun document pour le moment.</p>
              <p className="mt-1 text-xs text-neutral-300">Vos reçus, factures et attestations apparaîtront ici.</p>
            </div>
          )}
          {filtered.map(doc => {
            const cfg = TYPE_CONFIG[doc.type];
            return (
              <div key={doc.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100">
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-sm text-neutral-900">{doc.name}</p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-[11px] text-neutral-400 mt-0.5">{doc.description}</p>
                  )}
                  <p className="text-[10px] text-neutral-300 mt-1 font-mono">{doc.date} · {doc.size}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button title="Visualiser" className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600">
                    <Eye size={14} />
                  </button>
                  <button title="Télécharger" className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

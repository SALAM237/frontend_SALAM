'use client';

import { useMemo, useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { useAdminMembers, type MemberListItem } from '@/lib/api/members';
import { MemberFilterPanel, EMPTY_MEMBER_FILTERS, memberMatchesFilters, type MemberFilters } from '@/components/admin/MemberFilterPanel';
import { formatFullName } from '@/lib/format-name';

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/* Sélecteur mono-sélection d'un membre, repris visuellement du sélecteur de
   destinataires de l'éditeur de campagne (recherche + MemberFilterPanel + liste
   scrollable), mais pour désigner UNE seule personne (« Réglée par : » sur le
   formulaire de paiement) — pas de multi-sélection ni de "Tout sélectionner". */
export function MemberSettledByPicker({ value, onSelect }: {
  value?: string | null;
  onSelect: (userId: string, fullName: string) => void;
}) {
  const [open, setOpen] = useState(!value);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<MemberFilters>(EMPTY_MEMBER_FILTERS);

  const { data: membersData, isLoading } = useAdminMembers({ limit: 500 });
  const members: MemberListItem[] = membersData?.data?.data ?? [];

  const filteredMembers = useMemo(() => {
    const q = normalizeName(search.trim());
    return members.filter(m =>
      (!q || normalizeName(`${m.firstName} ${m.lastName} ${m.email ?? ''}`).includes(q))
      && memberMatchesFilters(m, filters));
  }, [members, search, filters]);

  const selectedMember = members.find(m => m._id === value);

  const pick = (m: MemberListItem) => {
    onSelect(m._id, formatFullName(m.firstName, m.lastName));
    setOpen(false);
  };

  if (!open && selectedMember) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">{formatFullName(selectedMember.firstName, selectedMember.lastName)}</p>
          <p className="truncate text-[11px] text-neutral-400">{selectedMember.email}</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="shrink-0 text-xs font-black text-emerald-700 hover:underline">Changer</button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre…"
          className="h-9 w-full rounded-lg border border-neutral-200 pl-8 pr-8 text-sm outline-none focus:border-emerald-400" />
        {search && (
          <button type="button" onClick={() => setSearch('')} aria-label="Effacer la recherche"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600">
            <X size={13} />
          </button>
        )}
      </div>
      <MemberFilterPanel filters={filters} onChange={setFilters} />
      <div className="max-h-48 overflow-y-auto rounded-xl border border-neutral-200">
        {isLoading && <p className="p-4 text-center text-sm text-neutral-400">Chargement…</p>}
        {!isLoading && filteredMembers.length === 0 && <p className="p-4 text-center text-sm text-neutral-400">Aucun membre trouvé.</p>}
        {filteredMembers.map(m => {
          const checked = m._id === value;
          return (
            <button type="button" key={m._id} onClick={() => pick(m)}
              className={`flex w-full items-center gap-2.5 border-b border-neutral-50 px-3 py-2 text-left last:border-0 ${checked ? 'bg-emerald-50/60' : 'hover:bg-neutral-50'}`}>
              <div className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${checked ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300'}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                <p className="truncate text-[11px] text-neutral-400">{m.email}{m.memberStatus === 'pending' ? ' · Inscription non finalisée' : ''}</p>
              </div>
            </button>
          );
        })}
      </div>
      {selectedMember && (
        <button type="button" onClick={() => setOpen(false)} className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-neutral-600">
          <ChevronDown size={12} /> Replier
        </button>
      )}
    </div>
  );
}

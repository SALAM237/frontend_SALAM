'use client';

import { Search, X } from 'lucide-react';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function ListToolbar({ search, onSearchChange, pageSize, onPageSizeChange, placeholder = 'Rechercher...', filterSlot }: {
  search: string;
  onSearchChange: (v: string) => void;
  pageSize: number;
  onPageSizeChange: (v: number) => void;
  placeholder?: string;
  filterSlot?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-2">
      <div className="relative min-w-0 flex-1 sm:max-w-xs lg:max-w-md">
        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 sm:left-3" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full rounded-lg border border-neutral-200 bg-white pl-7 pr-7 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 sm:h-9 sm:rounded-xl sm:pl-9 sm:pr-8 sm:text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            title="Effacer la recherche"
            className="absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 sm:right-2.5 sm:h-5 sm:w-5"
          >
            <X size={11} />
          </button>
        )}
      </div>
      {filterSlot}
      <label className="ml-auto flex shrink-0 flex-col items-center gap-1">
        <span className="whitespace-nowrap text-center text-[9px] font-black uppercase tracking-[0.06em] text-neutral-500 sm:text-[10px]">Lignes par page</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="h-8 w-20 rounded-lg border border-neutral-200 bg-white px-1.5 text-[10px] font-bold text-neutral-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 sm:h-9 sm:w-16 sm:rounded-xl sm:px-2 sm:text-sm"
        >
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, Clock, HelpCircle, SlidersHorizontal, X, XCircle } from 'lucide-react';
import type { MemberListItem } from '@/lib/api/members';
import { GenderIcon } from '@/components/ui/GenderIcon';

/* Réplique du filtre multi-critères de la page Adhérents (statut / cotisation /
   cotisation annuelle / profil / mois d'inscription / civilité), pour être
   réutilisé partout où une liste de membres doit être filtrée de la même façon
   (ex. sélection des destinataires d'une facture). */
export type MemberFilters = {
  statut: string[];
  cotisation: string[];
  cotisationAnnuelle: string[];
  profil: string[];
  mois: number[];
  civilite: string[];
};

export const EMPTY_MEMBER_FILTERS: MemberFilters = { statut: [], cotisation: [], cotisationAnnuelle: [], profil: [], mois: [], civilite: [] };

export const MEMBER_STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  active:    { label: 'Inscrit',                cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
  pending:   { label: 'Inscription en attente', cls: 'bg-yellow-50 text-yellow-700 border-yellow-100',    icon: Clock        },
  suspended: { label: 'Suspendu',                cls: 'bg-red-50 text-red-700 border-red-100',            icon: XCircle      },
  rejected:  { label: 'Refusé',                  cls: 'bg-neutral-50 text-neutral-500 border-neutral-200', icon: XCircle      },
};
const COTISATION_CONFIG: Record<string, { label: string; cls: string }> = {
  paid:   { label: 'Payée',   cls: 'bg-emerald-50 text-emerald-700' },
  unpaid: { label: 'Impayée', cls: 'bg-red-50 text-red-600'        },
  exempt: { label: 'Exempté', cls: 'bg-neutral-50 text-neutral-400' },
};
const COTIS_ANNUELLE_CONFIG: Record<string, { label: string; cls: string }> = {
  paid:    { label: 'Payée',    cls: 'bg-emerald-50 text-emerald-700' },
  partiel: { label: 'Partiel',  cls: 'bg-yellow-50 text-yellow-700'  },
  unpaid:  { label: 'Impayée', cls: 'bg-red-50 text-red-600'         },
  exempt:  { label: 'Exempté', cls: 'bg-neutral-50 text-neutral-400' },
};
const PROFILE_CONFIG = {
  complete:   { label: 'Complet',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  incomplete: { label: 'Incomplet', cls: 'bg-red-50 text-red-700 border-red-100'              },
};
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const CIVILITE_CONFIG: Record<string, { label: string; cls: string }> = {
  homme: { label: 'Homme', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  femme: { label: 'Femme', cls: 'bg-pink-50 text-pink-700 border-pink-100' },
  non_renseigne: { label: 'Non renseigné', cls: 'bg-neutral-50 text-neutral-500 border-neutral-200' },
};

export function memberMatchesFilters(m: MemberListItem, filters: MemberFilters): boolean {
  const matchStatut     = filters.statut.length === 0 || filters.statut.includes(m.memberStatus);
  const matchCotisation = filters.cotisation.length === 0 || filters.cotisation.includes(m.cotisationStatus);
  const matchAnnuelle   = filters.cotisationAnnuelle.length === 0 || filters.cotisationAnnuelle.includes(m.cotisationAnnuelleStatus);
  const matchProfil     = filters.profil.length === 0
    || (filters.profil.includes('complete') && m.profileComplete)
    || (filters.profil.includes('incomplete') && !m.profileComplete);
  const matchMois = filters.mois.length === 0 || filters.mois.includes(new Date(m.createdAt).getMonth());
  const matchCivilite = filters.civilite.length === 0
    || (m.gender ? filters.civilite.includes(m.gender) : filters.civilite.includes('non_renseigne'));
  return matchStatut && matchCotisation && matchAnnuelle && matchProfil && matchMois && matchCivilite;
}

export function memberFilterCount(filters: MemberFilters): number {
  return filters.statut.length + filters.cotisation.length + filters.cotisationAnnuelle.length + filters.profil.length + filters.mois.length + filters.civilite.length;
}

function AccordionSection({ label, count, badgeColor, open, onToggle, children }: {
  label: string; count: number; badgeColor: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-4 py-2.5 transition hover:bg-neutral-50/70">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</span>
          {count > 0 && (
            <span className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black text-white ${badgeColor}`}>{count}</span>
          )}
        </div>
        <ChevronDown size={12} className={`text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function CheckOption({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-transparent hover:bg-neutral-50'}`}>
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300 bg-white'}`}>
        {checked && <CheckCircle2 size={10} className="text-white" />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      {children}
    </label>
  );
}

/* Bouton "Filtrer" + panneau accordéon (statut / cotisation / cotisation annuelle /
   profil / mois d'inscription) + puces des filtres actifs — même comportement que
   la page Adhérents, contrôlé entièrement via `filters`/`onChange`. */
export function MemberFilterPanel({ filters, onChange }: { filters: MemberFilters; onChange: (f: MemberFilters) => void }) {
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['statut', 'cotisation']));
  const ref = useRef<HTMLDivElement>(null);
  const count = memberFilterCount(filters);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const toggleSection = (key: string) => setOpenSections(prev => {
    const n = new Set(prev);
    n.has(key) ? n.delete(key) : n.add(key);
    return n;
  });

  const toggleFilter = <K extends keyof MemberFilters>(key: K, value: MemberFilters[K][number]) => {
    const arr = filters[key] as (typeof value)[];
    const next = arr.includes(value as never) ? arr.filter(v => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <div className="space-y-2">
      <div ref={ref} className="relative inline-block">
        <button type="button" onClick={() => setOpen(v => !v)}
          className={`relative flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all sm:px-4 ${count > 0 ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}>
          <SlidersHorizontal size={13} /> Filtrer
          {count > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-emerald-700">{count}</span>}
        </button>
        {open && (
          <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <span className="text-sm font-black text-neutral-900">Filtres</span>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <button type="button" onClick={() => onChange(EMPTY_MEMBER_FILTERS)} className="text-[11px] font-bold text-emerald-700 hover:underline">
                    Réinitialiser
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)} className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
                  <X size={13} />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] divide-y divide-neutral-100 overflow-y-auto">
              <AccordionSection label="Statut" count={filters.statut.length} badgeColor="bg-emerald-500" open={openSections.has('statut')} onToggle={() => toggleSection('statut')}>
                <div className="space-y-1 px-4 pb-3 pt-1">
                  {(['active', 'pending', 'suspended', 'rejected'] as const).map(val => {
                    const cfg = MEMBER_STATUS_CONFIG[val];
                    return (
                      <CheckOption key={val} checked={filters.statut.includes(val)} onChange={() => toggleFilter('statut', val)}>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.cls}`}><cfg.icon size={9} /> {cfg.label}</span>
                      </CheckOption>
                    );
                  })}
                </div>
              </AccordionSection>
              <AccordionSection label="Frais d'adhésion" count={filters.cotisation.length} badgeColor="bg-blue-500" open={openSections.has('cotisation')} onToggle={() => toggleSection('cotisation')}>
                <div className="space-y-1 px-4 pb-3 pt-1">
                  {(['paid', 'unpaid', 'exempt'] as const).map(val => (
                    <CheckOption key={val} checked={filters.cotisation.includes(val)} onChange={() => toggleFilter('cotisation', val)}>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${COTISATION_CONFIG[val].cls}`}>{COTISATION_CONFIG[val].label}</span>
                    </CheckOption>
                  ))}
                </div>
              </AccordionSection>
              <AccordionSection label="Cotisation annuelle" count={filters.cotisationAnnuelle.length} badgeColor="bg-violet-500" open={openSections.has('cotisationAnnuelle')} onToggle={() => toggleSection('cotisationAnnuelle')}>
                <div className="space-y-1 px-4 pb-3 pt-1">
                  {(['paid', 'partiel', 'unpaid', 'exempt'] as const).map(val => (
                    <CheckOption key={val} checked={filters.cotisationAnnuelle.includes(val)} onChange={() => toggleFilter('cotisationAnnuelle', val)}>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${COTIS_ANNUELLE_CONFIG[val].cls}`}>{COTIS_ANNUELLE_CONFIG[val].label}</span>
                    </CheckOption>
                  ))}
                </div>
              </AccordionSection>
              <AccordionSection label="Profil" count={filters.profil.length} badgeColor="bg-emerald-500" open={openSections.has('profil')} onToggle={() => toggleSection('profil')}>
                <div className="space-y-1 px-4 pb-3 pt-1">
                  {(['complete', 'incomplete'] as const).map(val => (
                    <CheckOption key={val} checked={filters.profil.includes(val)} onChange={() => toggleFilter('profil', val)}>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${PROFILE_CONFIG[val].cls}`}>{PROFILE_CONFIG[val].label}</span>
                    </CheckOption>
                  ))}
                </div>
              </AccordionSection>
              <AccordionSection label="Inscription (mois)" count={filters.mois.length} badgeColor="bg-amber-500" open={openSections.has('mois')} onToggle={() => toggleSection('mois')}>
                <div className="grid grid-cols-3 gap-1.5 px-4 pb-3 pt-1">
                  {MONTHS_FR.map((mois, idx) => (
                    <label key={idx} className={`flex cursor-pointer items-center justify-center rounded-lg border px-1 py-1.5 text-[11px] font-bold transition ${filters.mois.includes(idx) ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}>
                      <input type="checkbox" className="sr-only" checked={filters.mois.includes(idx)} onChange={() => toggleFilter('mois', idx)} />
                      {mois.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </AccordionSection>
              <AccordionSection label="Civilité" count={filters.civilite.length} badgeColor="bg-pink-500" open={openSections.has('civilite')} onToggle={() => toggleSection('civilite')}>
                <div className="space-y-1 px-4 pb-3 pt-1">
                  {(['homme', 'femme', 'non_renseigne'] as const).map(val => (
                    <CheckOption key={val} checked={filters.civilite.includes(val)} onChange={() => toggleFilter('civilite', val)}>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${CIVILITE_CONFIG[val].cls}`}>
                        {val === 'non_renseigne' ? <HelpCircle size={10} /> : <GenderIcon gender={val} size={10} />} {CIVILITE_CONFIG[val].label}
                      </span>
                    </CheckOption>
                  ))}
                </div>
              </AccordionSection>
            </div>
          </div>
        )}
      </div>

      {count > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.statut.map(v => <button key={`s-${v}`} type="button" onClick={() => toggleFilter('statut', v)} className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 hover:bg-emerald-100">{MEMBER_STATUS_CONFIG[v]?.label} <X size={9} /></button>)}
          {filters.cotisation.map(v => <button key={`c-${v}`} type="button" onClick={() => toggleFilter('cotisation', v)} className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700 hover:bg-blue-100">{COTISATION_CONFIG[v]?.label} <X size={9} /></button>)}
          {filters.cotisationAnnuelle.map(v => <button key={`ca-${v}`} type="button" onClick={() => toggleFilter('cotisationAnnuelle', v)} className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-700 hover:bg-violet-100">{COTIS_ANNUELLE_CONFIG[v]?.label} <X size={9} /></button>)}
          {filters.profil.map(v => <button key={`p-${v}`} type="button" onClick={() => toggleFilter('profil', v)} className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-700 hover:bg-violet-100">Profil {v === 'complete' ? 'complet' : 'incomplet'} <X size={9} /></button>)}
          {filters.mois.map(idx => <button key={`m-${idx}`} type="button" onClick={() => toggleFilter('mois', idx)} className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 hover:bg-amber-100">{MONTHS_FR[idx]} <X size={9} /></button>)}
          {filters.civilite.map(v => <button key={`g-${v}`} type="button" onClick={() => toggleFilter('civilite', v)} className="flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-2 py-1 text-[10px] font-black text-pink-700 hover:bg-pink-100">{CIVILITE_CONFIG[v]?.label} <X size={9} /></button>)}
        </div>
      )}
    </div>
  );
}

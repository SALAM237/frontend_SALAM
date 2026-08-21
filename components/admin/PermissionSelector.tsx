'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, ShieldCheck, ShieldMinus, Undo2 } from 'lucide-react';
import type { PermissionDoc } from '@/lib/api/roles';

type Mode = 'role' | 'custom' | 'readonly';
type Risk = PermissionDoc['riskLevel'];

type PermissionSelectorProps = {
  grouped: Record<string, PermissionDoc[]>;
  mode: Mode;
  granted?: Set<string>;
  denied?: Set<string>;
  inherited?: Set<string>;
  onChange?: (granted: Set<string>, denied: Set<string>) => void;
  disabled?: boolean;
};

const RISK_STYLE: Record<Risk, string> = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  high: 'border-orange-200 bg-orange-50 text-orange-700',
  critical: 'border-red-200 bg-red-50 text-red-700',
};

const RISK_LABEL: Record<Risk, string> = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Élevé',
  critical: 'Critique',
};

const MODULE_META: Record<string, { label: string; description: string }> = {
  profile: { label: 'Profil', description: 'Consultation et gestion du profil personnel' },
  members: { label: 'Adhérents', description: 'Fiches, invitations, imports et cycle de vie des membres' },
  admins: { label: 'Administrateurs', description: 'Promotion, révocation, bureau et droits individuels' },
  roles: { label: 'Rôles', description: 'Création et administration des rôles RBAC' },
  permissions: { label: 'Catalogue des permissions', description: 'Consultation et maintenance du référentiel' },
  documents: { label: 'Documents', description: 'Documents internes et modèles d’attestation' },
  scans: { label: 'Scans QR', description: 'Contrôles, pointages et exports QR' },
  cauris: { label: 'Cauris', description: 'Soldes, dépenses et ajustements Cauris' },
  events: { label: 'Activités et événements', description: 'Publication, inscriptions et invitations' },
  gallery: { label: 'Galerie', description: 'Albums, médias et modération' },
  content: { label: 'Actualités', description: 'Articles et informations à la une' },
  marketing: { label: 'Marketing', description: 'Campagnes et communications marketing' },
  analytics: { label: 'Analytics', description: 'Statistiques générales et journal d’activité sensible' },
  messages: { label: 'Messagerie', description: 'Conversations, réponses et archivage' },
  chatbot: { label: 'Assistant public', description: 'Leads et demandes issues du chatbot' },
  adhesions: { label: 'Adhésions', description: 'Instruction et export des demandes d’adhésion' },
  validations: { label: 'Validations', description: 'Modifications soumises à contrôle' },
  partners: { label: 'Partenaires', description: 'Référentiel et publication des partenaires' },
  opportunities: { label: 'Opportunités', description: 'Offres et traitement des candidatures' },
  treasury: { label: 'Trésorerie', description: 'Écritures, imports, exports et frais' },
  cotisations: { label: 'Frais et cotisations', description: 'Paiements, reçus et relances' },
  invoices: { label: 'Facturation', description: 'Factures et clients de facturation' },
  networking: { label: 'Networking', description: 'Annuaire et validation des secteurs' },
  solidarity: { label: 'Solidarité', description: 'Actions solidaires et gestion des dons' },
  settings: { label: 'Paramètres et sécurité', description: 'Configuration, audit, sécurité et assistant IA' },
};

const MODULE_ORDER = Object.keys(MODULE_META);

const SUBRUBRICS: Record<string, { id: string; label: string; prefixes: string[] }[]> = {
  analytics: [
    { id: 'overview', label: 'Statistiques générales', prefixes: ['analytics.read'] },
    { id: 'activity', label: 'Journal d’activité', prefixes: ['analytics.activity.'] },
  ],
  content: [
    { id: 'news', label: 'Articles et actualités', prefixes: ['content.'] },
    { id: 'featured', label: 'Informations à la une', prefixes: ['featured.'] },
  ],
  opportunities: [
    { id: 'offers', label: 'Opportunités', prefixes: ['opportunities.'] },
    { id: 'applications', label: 'Candidatures', prefixes: ['applications.'] },
  ],
  invoices: [
    { id: 'invoices', label: 'Factures', prefixes: ['invoices.'] },
    { id: 'clients', label: 'Clients de facturation', prefixes: ['invoiceClients.'] },
  ],
  solidarity: [
    { id: 'actions', label: 'Actions solidaires', prefixes: ['solidarity.'] },
    { id: 'donations', label: 'Dons', prefixes: ['donations.'] },
  ],
  settings: [
    { id: 'configuration', label: 'Configuration générale', prefixes: ['settings.'] },
    { id: 'security', label: 'Sécurité', prefixes: ['security.'] },
    { id: 'audit', label: 'Journal d’audit', prefixes: ['audit.'] },
    { id: 'ai', label: 'Assistant IA', prefixes: ['ai.'] },
  ],
};

function orderedModules(grouped: Record<string, PermissionDoc[]>) {
  return Object.keys(grouped).sort((a, b) => {
    const ai = MODULE_ORDER.indexOf(a);
    const bi = MODULE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function splitSubrubrics(module: string, permissions: PermissionDoc[]) {
  const definitions = SUBRUBRICS[module];
  if (!definitions) return [{ id: `${module}-actions`, label: 'Accès et actions', permissions }];

  const claimed = new Set<string>();
  const sections = definitions.map(definition => {
    const matches = permissions.filter(permission => definition.prefixes.some(prefix => permission.key.startsWith(prefix)));
    matches.forEach(permission => claimed.add(permission.key));
    return { id: `${module}-${definition.id}`, label: definition.label, permissions: matches };
  }).filter(section => section.permissions.length > 0);
  const remaining = permissions.filter(permission => !claimed.has(permission.key));
  if (remaining.length) sections.push({ id: `${module}-other`, label: 'Autres actions', permissions: remaining });
  return sections;
}

function IndeterminateCheckbox({ checked, indeterminate, onChange, label, disabled }: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={element => { if (element) element.indeterminate = indeterminate; }}
      onChange={onChange}
      aria-label={label}
      disabled={disabled}
      className="h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-300 accent-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

export function PermissionSelector({
  grouped,
  mode,
  granted = new Set<string>(),
  denied = new Set<string>(),
  inherited = new Set<string>(),
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const [search, setSearch] = useState('');
  const [risk, setRisk] = useState<'all' | Risk>('all');
  const [openModules, setOpenModules] = useState<Set<string>>(new Set(['members', 'admins', 'roles']));
  const editable = mode !== 'readonly' && !!onChange && !disabled;
  const modules = useMemo(() => orderedModules(grouped), [grouped]);
  const allPermissions = useMemo(() => modules.flatMap(module => grouped[module] ?? []), [grouped, modules]);
  const query = search.trim().toLocaleLowerCase('fr');

  const updateKeys = (keys: string[], state: 'granted' | 'denied' | 'inherit') => {
    if (!editable || !onChange) return;
    const nextGranted = new Set(granted);
    const nextDenied = new Set(denied);
    for (const key of keys) {
      if (state === 'granted') {
        nextGranted.add(key);
        nextDenied.delete(key);
      } else if (state === 'denied' && mode === 'custom') {
        nextDenied.add(key);
        nextGranted.delete(key);
      } else {
        nextGranted.delete(key);
        nextDenied.delete(key);
      }
    }
    onChange(nextGranted, nextDenied);
  };

  const toggleGrantedGroup = (permissions: PermissionDoc[]) => {
    const keys = permissions.map(permission => permission.key);
    updateKeys(keys, keys.every(key => granted.has(key)) ? 'inherit' : 'granted');
  };

  const toggleOpen = (module: string) => {
    setOpenModules(previous => {
      const next = new Set(previous);
      next.has(module) ? next.delete(module) : next.add(module);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 space-y-2.5 rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Rechercher une permission…"
            className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => setRisk('all')}
            className={`min-h-7 rounded-full border px-2.5 text-[10px] font-black ${risk === 'all' ? 'border-neutral-400 bg-neutral-100 text-neutral-700' : 'border-neutral-200 text-neutral-500'}`}>
            Tous
          </button>
          {(Object.keys(RISK_LABEL) as Risk[]).map(level => (
            <button key={level} type="button" onClick={() => setRisk(risk === level ? 'all' : level)}
              className={`min-h-7 rounded-full border px-2.5 text-[10px] font-black ${risk === level ? RISK_STYLE[level] : 'border-neutral-200 text-neutral-500'}`}>
              {RISK_LABEL[level]}
            </button>
          ))}
        </div>
        {mode !== 'readonly' && (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button type="button" disabled={!editable} onClick={() => updateKeys(allPermissions.map(permission => permission.key), 'granted')}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[11px] font-black text-white disabled:opacity-50">
              <ShieldCheck size={13} /> Tout accorder
            </button>
            {mode === 'custom' && (
              <button type="button" disabled={!editable} onClick={() => updateKeys(allPermissions.map(permission => permission.key), 'denied')}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-[11px] font-black text-red-700 disabled:opacity-50">
                <ShieldMinus size={13} /> Tout refuser
              </button>
            )}
            <button type="button" disabled={!editable} onClick={() => updateKeys(allPermissions.map(permission => permission.key), 'inherit')}
              className="col-span-2 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[11px] font-black text-neutral-600 disabled:opacity-50">
              <Undo2 size={13} /> {mode === 'custom' ? 'Tout hériter du rôle' : 'Tout désélectionner'}
            </button>
          </div>
        )}
      </div>

      {modules.map(module => {
        const sourcePermissions = grouped[module] ?? [];
        const visiblePermissions = sourcePermissions.filter(permission => {
          const matchesSearch = !query || permission.key.toLocaleLowerCase('fr').includes(query)
            || permission.label.toLocaleLowerCase('fr').includes(query);
          return matchesSearch && (risk === 'all' || permission.riskLevel === risk);
        });
        if (!visiblePermissions.length) return null;

        const allGranted = sourcePermissions.length > 0 && sourcePermissions.every(permission => granted.has(permission.key));
        const someGranted = sourcePermissions.some(permission => granted.has(permission.key));
        const deniedCount = sourcePermissions.filter(permission => denied.has(permission.key)).length;
        const expanded = !!query || risk !== 'all' || openModules.has(module);
        const meta = MODULE_META[module] ?? { label: module, description: 'Permissions de la rubrique' };

        return (
          <section key={module} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 bg-neutral-50 px-3 py-3 sm:px-4">
              {mode !== 'readonly' && (
                <IndeterminateCheckbox
                  checked={allGranted}
                  indeterminate={someGranted && !allGranted}
                  onChange={() => toggleGrantedGroup(sourcePermissions)}
                  label={`Accorder toute la rubrique ${meta.label}`}
                  disabled={!editable}
                />
              )}
              <button type="button" onClick={() => toggleOpen(module)} className="min-w-0 flex-1 text-left">
                <span className="block text-[11px] font-black uppercase tracking-[0.1em] text-neutral-800 sm:text-xs">{meta.label}</span>
                <span className="mt-0.5 block text-[11px] leading-4 text-neutral-500">{meta.description}</span>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                {mode !== 'readonly' && (
                  <span className="text-[10px] font-bold text-neutral-500">
                    {sourcePermissions.filter(permission => granted.has(permission.key)).length}/{sourcePermissions.length}
                    {mode === 'custom' && deniedCount > 0 && <span className="ml-1 text-red-600">−{deniedCount}</span>}
                  </span>
                )}
                {mode === 'custom' && (
                  <button type="button" disabled={!editable}
                    onClick={() => updateKeys(sourcePermissions.map(permission => permission.key), deniedCount === sourcePermissions.length ? 'inherit' : 'denied')}
                    className="min-h-9 rounded-lg border border-red-200 px-2 text-[10px] font-black text-red-600 disabled:opacity-50">
                    {deniedCount === sourcePermissions.length ? 'Annuler −' : 'Refuser le bloc'}
                  </button>
                )}
                <button type="button" onClick={() => toggleOpen(module)} aria-label={`${expanded ? 'Replier' : 'Déplier'} ${meta.label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100">
                  <ChevronDown size={15} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {expanded && (
              <div className="space-y-3 p-2.5 sm:p-3">
                {splitSubrubrics(module, visiblePermissions).map(section => {
                  const allSectionGranted = section.permissions.every(permission => granted.has(permission.key));
                  const someSectionGranted = section.permissions.some(permission => granted.has(permission.key));
                  return (
                    <div key={section.id} className="overflow-hidden rounded-lg border border-neutral-100">
                      <div className="flex min-h-9 items-center gap-2 border-b border-neutral-100 bg-neutral-50/70 px-3">
                        {mode !== 'readonly' && (
                          <IndeterminateCheckbox
                            checked={allSectionGranted}
                            indeterminate={someSectionGranted && !allSectionGranted}
                            onChange={() => toggleGrantedGroup(section.permissions)}
                            label={`Accorder toute la sous-rubrique ${section.label}`}
                            disabled={!editable}
                          />
                        )}
                        <span className="flex-1 text-[10px] font-black uppercase tracking-[0.08em] text-neutral-600">{section.label}</span>
                        <span className="text-[10px] text-neutral-400">{section.permissions.length}</span>
                      </div>
                      <div className="divide-y divide-neutral-100">
                        {section.permissions.map(permission => {
                          const isGranted = granted.has(permission.key);
                          const isDenied = denied.has(permission.key);
                          const isInherited = inherited.has(permission.key);
                          return (
                            <div key={permission.key}
                              className={`grid gap-2 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${isGranted ? 'bg-emerald-50/50' : isDenied ? 'bg-red-50/50' : ''}`}>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <p className="text-xs font-semibold leading-4 text-neutral-800">{permission.label}</p>
                                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-black ${RISK_STYLE[permission.riskLevel]}`}>
                                    {RISK_LABEL[permission.riskLevel]}
                                  </span>
                                </div>
                                <p className="mt-0.5 break-all font-mono text-[10px] leading-4 text-neutral-400">{permission.key}</p>
                              </div>

                              {mode === 'role' && (
                                <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-2.5 text-[10px] font-black text-neutral-600">
                                  <input type="checkbox" checked={isGranted} disabled={!editable}
                                    onChange={() => updateKeys([permission.key], isGranted ? 'inherit' : 'granted')}
                                    className="h-4 w-4 rounded accent-emerald-600" />
                                  Incluse
                                </label>
                              )}
                              {mode === 'custom' && (
                                <div className="grid grid-cols-3 gap-1 sm:w-[244px]">
                                  <button type="button" disabled={!editable} onClick={() => updateKeys([permission.key], 'inherit')}
                                    className={`min-h-9 rounded-lg border px-1.5 text-[10px] font-black ${!isGranted && !isDenied ? 'border-neutral-400 bg-neutral-100 text-neutral-700' : 'border-neutral-200 text-neutral-400'}`}>
                                    {isInherited ? 'Rôle ✓' : 'Hérité'}
                                  </button>
                                  <button type="button" disabled={!editable} onClick={() => updateKeys([permission.key], 'granted')}
                                    className={`min-h-9 rounded-lg border px-1.5 text-[10px] font-black ${isGranted ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-400'}`}>
                                    + Accordé
                                  </button>
                                  <button type="button" disabled={!editable} onClick={() => updateKeys([permission.key], 'denied')}
                                    className={`min-h-9 rounded-lg border px-1.5 text-[10px] font-black ${isDenied ? 'border-red-400 bg-red-50 text-red-600' : 'border-neutral-200 text-neutral-400'}`}>
                                    − Refusé
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {modules.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center text-xs text-neutral-400">
          Aucune permission disponible.
        </div>
      )}
    </div>
  );
}

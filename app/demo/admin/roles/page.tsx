'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Shield, Plus, X, Check, ChevronRight, Search, Crown, Users,
  Key, AlertTriangle, Edit3, UserCheck, ShieldOff, Ban,
} from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoMembers } from '@/data/demo/demo-members';
import { demoRoles } from '@/data/demo/demo-roles';
import { demoPermissions } from '@/data/demo/demo-permissions';

type Tab = 'roles' | 'bureau' | 'permissions';

const RISK_STYLE: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};
const RISK_LABEL: Record<string, string> = { low: 'Faible', medium: 'Moyen', high: 'Eleve', critical: 'Critique' };
const MODULE_LABELS: Record<string, string> = {
  members: 'Membres', admins: 'Administrateurs', roles: 'Roles', permissions: 'Permissions',
  events: 'Evenements', gallery: 'Galerie', content: 'Actualites', messages: 'Messages',
  settings: 'Parametres', profile: 'Profil',
};

function groupedPermissions() {
  return demoPermissions.reduce<Record<string, typeof demoPermissions[number][]>>((acc, permission) => {
    const mod = permission.module ?? permission.key.split('.')[0];
    acc[mod] ??= [];
    acc[mod].push(permission);
    return acc;
  }, {});
}

function CreateRoleModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const autoSlug = (v: string) => v.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h3 className="font-black text-neutral-900">Nouveau role</h3>
            <p className="mt-0.5 text-xs text-neutral-500">Definir un role personnalise demo</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Nom *</label>
            <input value={name} onChange={e => { setName(e.target.value); setSlug(autoSlug(e.target.value)); }} placeholder="Ex: Responsable Partenariats" className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Slug *</label>
            <input value={slug} onChange={e => setSlug(autoSlug(e.target.value))} placeholder="responsable_partenariats" className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 font-mono text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Role pour..." className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
          </div>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={onClose} disabled={!name.trim() || !slug.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50">
            Creer le role
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleEditor({ role, onClose, compact = false }: { role: any; onClose: () => void; compact?: boolean }) {
  const grouped = groupedPermissions();
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set(role.permissions.includes('*') ? demoPermissions.map(p => p.key) : role.permissions));
  const [permSearch, setPermSearch] = useState('');
  const isSA = role.name === 'SUPER_ADMIN';
  const filteredModules = Object.entries(grouped).filter(([, perms]) => !permSearch || perms.some(p => p.key.toLowerCase().includes(permSearch.toLowerCase()) || p.label.toLowerCase().includes(permSearch.toLowerCase())));

  const togglePerm = (key: string) => {
    if (isSA) return;
    setSelectedPerms(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className={compact ? 'flex flex-col' : 'flex h-full flex-col'}>
      <div className="flex shrink-0 items-start justify-between border-b border-neutral-100 px-6 py-4">
        <div className="min-w-0 flex-1">
          <p className="font-black text-neutral-900">{role.name}</p>
          <p className="mt-0.5 text-xs text-neutral-400">{isSA ? 'Role systeme - non modifiable' : 'Role demo editable localement'}</p>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={14} /></button>
      </div>
      <div className="flex shrink-0 items-center gap-4 border-b border-neutral-100 bg-neutral-50 px-6 py-3">
        <span className="text-xs font-semibold text-neutral-500"><span className="font-black text-emerald-700">{selectedPerms.size}</span> permissions actives</span>
        {isSA && <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black leading-none text-amber-700">Acces total - wildcard *</span>}
        {!isSA && <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black leading-none text-blue-700">Role systeme</span>}
      </div>
      {!isSA && (
        <div className="shrink-0 border-b border-neutral-100 px-4 py-2.5">
          <div className="relative">
            <Search size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={permSearch} onChange={e => setPermSearch(e.target.value)} placeholder="Filtrer les permissions..." className="h-8 w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-xs focus:border-emerald-400 focus:outline-none" />
          </div>
        </div>
      )}
      <div className={compact ? 'max-h-[55vh] space-y-4 overflow-y-auto px-4 py-3' : 'flex-1 space-y-4 overflow-y-auto px-4 py-3'}>
        {isSA ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Crown size={32} className="mb-3 text-amber-400" />
            <p className="text-sm font-black text-neutral-700">Super Administrateur</p>
            <p className="mt-1 max-w-48 text-xs text-neutral-400">Ce role possede toutes les permissions par defaut.</p>
          </div>
        ) : filteredModules.map(([mod, perms]) => {
          const keys = perms.map(p => p.key);
          const onCount = keys.filter(k => selectedPerms.has(k)).length;
          const allOn = onCount === keys.length;
          const someOn = onCount > 0 && !allOn;
          return (
            <div key={mod} className="overflow-hidden rounded-xl border border-neutral-100">
              <button onClick={() => setSelectedPerms(prev => {
                const next = new Set(prev);
                keys.forEach(k => allOn ? next.delete(k) : next.add(k));
                return next;
              })} className="flex w-full items-center gap-3 bg-neutral-50 px-4 py-2.5 transition hover:bg-neutral-100">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${allOn ? 'border-emerald-500 bg-emerald-500' : someOn ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-300 bg-white'}`}>
                  {allOn && <Check size={11} className="text-white" />}
                  {someOn && <div className="h-2 w-2 rounded-sm bg-emerald-500" />}
                </div>
                <span className="flex-1 text-left text-xs font-black uppercase tracking-[0.1em] text-neutral-700">{MODULE_LABELS[mod] ?? mod}</span>
                <span className="text-[10px] text-neutral-400">{onCount}/{keys.length}</span>
              </button>
              <div className="divide-y divide-neutral-50">
                {perms.map(p => (
                  <label key={p.key} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-neutral-50">
                    <input type="checkbox" checked={selectedPerms.has(p.key)} onChange={() => togglePerm(p.key)} className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-emerald-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-800">{p.label}</p>
                      <p className="font-mono text-[10px] text-neutral-400">{p.key}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black ${RISK_STYLE[p.riskLevel]}`}>{RISK_LABEL[p.riskLevel]}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DemoAdminRolesPage() {
  const [tab, setTab] = useState<Tab>('roles');
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [permSearch, setPermSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const grouped = groupedPermissions();
  const admins = demoMembers.slice(0, 2);
  const allPerms = useMemo(() => Object.values(grouped).flat(), [grouped]);

  const TABS = [
    { id: 'roles' as Tab, label: 'Roles', icon: Shield, count: demoRoles.length },
    { id: 'bureau' as Tab, label: 'Bureau', icon: Users, count: admins.length },
    { id: 'permissions' as Tab, label: 'Permissions', icon: Key, count: allPerms.length },
  ];

  return (
    <DemoPortalShell type="admin" title="Roles & Acces">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Roles & Permissions</h1>
            <p className="mt-1 text-sm text-neutral-500">Gestion des acces, du bureau executif et des droits SALAM.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
            <AlertTriangle size={14} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-700">Mode demo - aucune permission reelle modifiee</p>
          </div>
        </div>

        <div className="flex gap-1 rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition ${tab === t.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}>
              <t.icon size={14} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === t.id ? 'bg-white/20' : 'bg-neutral-100'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {tab === 'roles' && (
          <div className={`grid gap-5 ${selectedRole ? 'lg:grid-cols-[300px_1fr]' : ''}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{demoRoles.length} roles</p>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-emerald-700">
                  <Plus size={12} /> Nouveau role
                </button>
              </div>
              <div className="space-y-2">
                {demoRoles.map(role => {
                  const active = selectedRole?.id === role.id;
                  return (
                    <div key={role.id}>
                      <button onClick={() => setSelectedRole(active ? null : role)} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left shadow-sm transition ${active ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'}`}>
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-100' : 'bg-neutral-100'}`}>
                          {role.name === 'SUPER_ADMIN' ? <Crown size={16} className="text-amber-500" /> : <Shield size={16} className={active ? 'text-emerald-600' : 'text-neutral-400'} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-black ${active ? 'text-emerald-800' : 'text-neutral-900'}`}>{role.name}</p>
                          <p className="text-[10px] text-neutral-400">{role.permissions.includes('*') ? 'Acces total *' : `${role.permissions.length} permissions`}<span className="ml-2 text-blue-400">- Systeme</span></p>
                        </div>
                        <ChevronRight size={12} className={`transition-transform duration-200 ${active ? 'rotate-90 text-emerald-500 lg:rotate-0' : 'text-neutral-300'}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {active && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden lg:hidden">
                            <div className="mt-1 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
                              <RoleEditor role={role} onClose={() => setSelectedRole(null)} compact />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
            {selectedRole && (
              <div className="hidden overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm lg:block" style={{ height: 'calc(100vh - 240px)', minHeight: 500 }}>
                <RoleEditor role={selectedRole} onClose={() => setSelectedRole(null)} />
              </div>
            )}
          </div>
        )}

        {tab === 'bureau' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{admins.length} administrateurs</p>
              <button className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-emerald-700"><UserCheck size={12} /> Promouvoir un membre</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {admins.map(admin => (
                <div key={admin.id} className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">{admin.firstName[0]}{admin.lastName[0]}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-neutral-900">{admin.firstName} {admin.lastName}</p>
                    <p className="truncate text-[11px] text-neutral-400">{admin.email}</p>
                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">{admin.role}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    {[Edit3, Key, ShieldOff, Ban].map((Icon, index) => <button key={index} className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:text-emerald-600"><Icon size={12} /></button>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'permissions' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-48 flex-1">
                <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input value={permSearch} onChange={e => setPermSearch(e.target.value)} placeholder="Filtrer les permissions..." className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm focus:border-emerald-400 focus:outline-none" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button onClick={() => setRiskFilter('all')} className={`rounded-full border px-3 py-1 text-[10px] font-black transition ${riskFilter === 'all' ? 'border-neutral-400 bg-neutral-100 text-neutral-700' : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'}`}>Tous</button>
                {Object.entries(RISK_LABEL).map(([k, label]) => (
                  <button key={k} onClick={() => setRiskFilter(riskFilter === k ? 'all' : k)} className={`rounded-full border px-3 py-1 text-[10px] font-black transition ${riskFilter === k ? RISK_STYLE[k] : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'}`}>{label}</button>
                ))}
              </div>
            </div>
            {Object.entries(grouped).map(([mod, perms]) => {
              const filtered = perms.filter(p => (!permSearch || p.key.toLowerCase().includes(permSearch.toLowerCase()) || p.label.toLowerCase().includes(permSearch.toLowerCase())) && (riskFilter === 'all' || p.riskLevel === riskFilter));
              if (!filtered.length) return null;
              return (
                <div key={mod} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
                  <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3"><p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-600">{MODULE_LABELS[mod] ?? mod}</p></div>
                  <div className="divide-y divide-neutral-50">
                    {filtered.map(p => (
                      <div key={p.key} className="flex items-center gap-4 px-5 py-3">
                        <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-neutral-800">{p.label}</p><p className="font-mono text-[11px] text-neutral-400">{p.key}</p></div>
                    <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-black leading-none ${RISK_STYLE[p.riskLevel]}`}>{RISK_LABEL[p.riskLevel]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCreate && <CreateRoleModal onClose={() => setShowCreate(false)} />}
      </div>
    </DemoPortalShell>
  );
}

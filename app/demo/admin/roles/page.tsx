'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FlaskConical, Shield, Plus, Check, X, ChevronDown } from 'lucide-react';

type Role = { id: string; name: string; isSystem: boolean; perms: string[] };

const PERMISSION_GROUPS = [
  { label: 'Membres',     perms: ['members.read', 'members.create', 'members.update', 'members.validate'] },
  { label: 'Rôles',       perms: ['roles.read', 'roles.create', 'roles.update', 'roles.assign'] },
  { label: 'Activités',   perms: ['activities.read', 'activities.create', 'activities.update', 'activities.publish'] },
  { label: 'Galerie',     perms: ['gallery.upload', 'gallery.moderate'] },
  { label: 'Messages',    perms: ['messages.send', 'messages.moderate'] },
  { label: 'Paramètres',  perms: ['settings.update', 'audit.read'] },
];

const ALL_PERMS = PERMISSION_GROUPS.flatMap(g => g.perms);

const INITIAL_ROLES: Role[] = [
  { id: 'r1', name: 'Super Admin',           isSystem: true,  perms: ALL_PERMS },
  { id: 'r2', name: 'Président',             isSystem: true,  perms: ALL_PERMS.filter(p => p !== 'settings.update') },
  { id: 'r3', name: 'Chargé Communication',  isSystem: false, perms: ['members.read', 'activities.read', 'activities.create', 'messages.send', 'gallery.upload'] },
  { id: 'r4', name: 'Chargé Sport',          isSystem: false, perms: ['members.read', 'activities.read', 'activities.create', 'messages.send'] },
  { id: 'r5', name: 'Membre actif',          isSystem: true,  perms: ['members.read', 'activities.read', 'messages.send'] },
];

function permLabel(p: string) {
  const map: Record<string, string> = {
    'members.read': 'Voir membres', 'members.create': 'Créer membre', 'members.update': 'Modifier membre', 'members.validate': 'Valider adhésion',
    'roles.read': 'Voir rôles', 'roles.create': 'Créer rôle', 'roles.update': 'Modifier rôle', 'roles.assign': 'Assigner rôle',
    'activities.read': 'Voir activités', 'activities.create': 'Créer activité', 'activities.update': 'Modifier activité', 'activities.publish': 'Publier activité',
    'gallery.upload': 'Upload photos', 'gallery.moderate': 'Modérer galerie',
    'messages.send': 'Envoyer message', 'messages.moderate': 'Modérer messages',
    'settings.update': 'Paramètres', 'audit.read': 'Voir logs',
  };
  return map[p] ?? p;
}

export default function DemoAdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selected, setSelected] = useState<string>('r1');
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(PERMISSION_GROUPS.map(g => g.label));

  const current = roles.find(r => r.id === selected);

  const togglePerm = (perm: string) => {
    if (!current || current.isSystem) return;
    setRoles(prev => prev.map(r =>
      r.id === selected
        ? { ...r, perms: r.perms.includes(perm) ? r.perms.filter(p => p !== perm) : [...r.perms, perm] }
        : r
    ));
  };

  const createRole = () => {
    if (!newName.trim()) return;
    const id = `r${Date.now()}`;
    setRoles(prev => [...prev, { id, name: newName.trim(), isSystem: false, perms: ['members.read', 'activities.read', 'messages.send'] }]);
    setSelected(id);
    setNewName('');
    setShowNew(false);
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);
  };

  return (
    <main className="min-h-screen bg-[#fffdf8]">

      {/* Demo banner */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 border-b border-yellow-200 bg-yellow-50 px-5 py-2.5 md:px-8">
        <div className="flex items-center gap-2 text-xs font-bold text-yellow-800">
          <FlaskConical size={13} />
          Mode démo — données fictives
        </div>
        <Link href="/admin/dashboard" className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 transition-colors">
          ← Portail admin
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-5 py-5 md:px-8">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-emerald-600" />
            <div>
              <h1 className="text-xl font-black text-neutral-900">Rôles & autorisations</h1>
              <p className="text-xs text-neutral-400">{roles.length} rôles définis</p>
            </div>
          </div>
          <button
            onClick={() => setShowNew(v => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white transition-all hover:bg-emerald-700"
          >
            <Plus size={13} /> Nouveau rôle
          </button>
        </div>
      </div>

      {/* New role form */}
      {showNew && (
        <div className="border-b border-neutral-200 bg-white px-5 py-3 md:px-8">
          <div className="mx-auto max-w-6xl flex items-center gap-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createRole()}
              placeholder="Nom du rôle…"
              autoFocus
              className="h-9 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none"
            />
            <button onClick={createRole} className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700 transition-all">Créer</button>
            <button onClick={() => setShowNew(false)} className="h-9 w-9 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-400 hover:text-neutral-700">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

          {/* Role list */}
          <div className="flex flex-col gap-1">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                  selected === r.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <Shield size={14} className={selected === r.id ? 'text-white/70' : 'text-neutral-400'} />
                <div className="flex-1 min-w-0">
                  <p className={`truncate text-sm font-bold ${selected === r.id ? 'text-white' : 'text-neutral-900'}`}>{r.name}</p>
                  <p className={`text-[10px] ${selected === r.id ? 'text-white/60' : 'text-neutral-400'}`}>
                    {r.perms.length} permission{r.perms.length !== 1 ? 's' : ''}
                    {r.isSystem ? ' · Système' : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Permission editor */}
          {current && (
            <div className="rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-neutral-900">{current.name}</h2>
                  <p className="text-xs text-neutral-400">
                    {current.isSystem ? 'Rôle système — non modifiable' : `${current.perms.length} permissions activées`}
                  </p>
                </div>
                {current.isSystem && (
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold text-neutral-500">Système</span>
                )}
              </div>

              <div className="divide-y divide-neutral-50 p-4">
                {PERMISSION_GROUPS.map(group => {
                  const expanded = expandedGroups.includes(group.label);
                  const activeCount = group.perms.filter(p => current.perms.includes(p)).length;
                  return (
                    <div key={group.label} className="py-3">
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{group.label}</span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {activeCount}/{group.perms.length}
                          </span>
                        </div>
                        <ChevronDown size={13} className={`text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </button>
                      {expanded && (
                        <div className="mt-2 grid grid-cols-2 gap-1.5 px-2 sm:grid-cols-3">
                          {group.perms.map(p => {
                            const active = current.perms.includes(p);
                            return (
                              <button
                                key={p}
                                onClick={() => togglePerm(p)}
                                disabled={current.isSystem}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                                  active
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
                                } ${current.isSystem ? 'cursor-default opacity-70' : 'hover:shadow-sm'}`}
                              >
                                {active
                                  ? <Check size={11} className="shrink-0 text-emerald-600" />
                                  : <X size={11} className="shrink-0 text-neutral-300" />
                                }
                                <span className="font-semibold">{permLabel(p)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!current.isSystem && (
                <div className="border-t border-neutral-100 px-6 py-4">
                  <p className="text-xs text-neutral-400">Les modifications sont enregistrées automatiquement (démo).</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

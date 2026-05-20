'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Plus, X, Check, ChevronRight, Loader2, Search,
  Crown, Users, Key, AlertTriangle, Trash2, Edit3, UserCheck,
  ShieldOff, Ban,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { isSuperAdmin } from '@/lib/auth/roles';
import { GenderIcon } from '@/components/ui/GenderIcon';
import {
  useRoles, useCreateRole, useUpdateRole, useDeleteRole,
  usePermissionsList,
  useAssignPoste, useUpdateCustomPerms, useUploadBureauPhoto,
  type RoleDoc, type PermissionDoc,
} from '@/lib/api/roles';
import { ImagePlus, Camera } from 'lucide-react';
import { useAdminUsers, usePromoteAdmin, useRevokeAdmin, type AdminUser } from '@/lib/api/admins';
import { useAdminMembers, useSuspendMember } from '@/lib/api/members';
import { toast } from 'sonner';

/* ─── Risk badge ──────────────────────────────────────────── */
const RISK_STYLE: Record<string, string> = {
  low:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium:   'bg-amber-50   text-amber-700   border-amber-200',
  high:     'bg-orange-50  text-orange-700  border-orange-200',
  critical: 'bg-red-50     text-red-700     border-red-200',
};
const RISK_LABEL: Record<string, string> = {
  low: 'Faible', medium: 'Moyen', high: 'Élevé', critical: 'Critique',
};

const BUREAU_POSTES = [
  'Président', 'Vice-Président', 'Secrétaire Général', 'Secrétaire Adjoint',
  'Trésorier', 'Trésorier Adjoint', 'Responsable Communication',
  'Responsable Partenariats', 'Responsable Événements',
  'Responsable Insertion', 'Responsable Solidarité',
];

const CURRENT_YEAR = new Date().getFullYear();

/* ─── Module labels ───────────────────────────────────────── */
const MODULE_LABELS: Record<string, string> = {
  profile: 'Profil', members: 'Membres', admins: 'Administrateurs',
  roles: 'Rôles', permissions: 'Permissions', events: 'Événements',
  gallery: 'Galerie', content: 'Actualités', messages: 'Messages',
  adhesions: 'Adhésions', partners: 'Partenaires',
  opportunities: 'Opportunités', solidarity: 'Solidarité', settings: 'Paramètres',
};

/* ─── Create role modal ───────────────────────────────────── */
function CreateRoleModal({ onClose }: { onClose: () => void }) {
  const [name,        setName]        = useState('');
  const [slug,        setSlug]        = useState('');
  const [description, setDescription] = useState('');
  const createRole = useCreateRole();

  const autoSlug = (v: string) => v.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h3 className="font-black text-neutral-900">Nouveau rôle</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Définir un rôle personnalisé</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Nom *</label>
            <input value={name} onChange={e => { setName(e.target.value); setSlug(autoSlug(e.target.value)); }}
              placeholder="Ex: Responsable Partenariats"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Slug *</label>
            <input value={slug} onChange={e => setSlug(autoSlug(e.target.value))}
              placeholder="responsable_partenariats"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 font-mono text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="Rôle pour…"
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
          </div>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button
            disabled={!name.trim() || !slug.trim() || createRole.isPending}
            onClick={() => createRole.mutate({ name, slug, description, permissions: [] }, { onSuccess: () => onClose() })}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50">
            {createRole.isPending && <Loader2 size={13} className="animate-spin" />}
            Créer le rôle
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Role editor (right panel or inline accordion) ───────── */
function RoleEditor({ role, onClose, compact = false }: { role: RoleDoc; onClose: () => void; compact?: boolean }) {
  const { data: permsData } = usePermissionsList();
  const grouped = permsData?.data?.grouped ?? {};
  const updateRole  = useUpdateRole(role._id);
  const deleteRole  = useDeleteRole();

  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set(role.permissions));
  const [permSearch,    setPermSearch]     = useState('');
  const [editName,      setEditName]       = useState(role.name);
  const [editDesc,      setEditDesc]       = useState(role.description ?? '');

  const isDirty = editName !== role.name || editDesc !== (role.description ?? '')
    || selectedPerms.size !== role.permissions.length
    || [...selectedPerms].some(p => !role.permissions.includes(p))
    || role.permissions.some(p => !selectedPerms.has(p));

  const togglePerm = (key: string) => {
    if (role.isSystem && role.slug === 'super_admin') return;
    setSelectedPerms(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleModule = (perms: PermissionDoc[]) => {
    if (role.isSystem && role.slug === 'super_admin') return;
    const keys = perms.map(p => p.key);
    const allOn = keys.every(k => selectedPerms.has(k));
    setSelectedPerms(prev => {
      const next = new Set(prev);
      keys.forEach(k => allOn ? next.delete(k) : next.add(k));
      return next;
    });
  };

  const handleSave = () => {
    updateRole.mutate({
      name: editName,
      description: editDesc,
      permissions: [...selectedPerms],
    });
  };

  const handleDelete = () => {
    if (!confirm(`Supprimer le rôle "${role.name}" ? Cette action est irréversible.`)) return;
    deleteRole.mutate(role._id, { onSuccess: () => onClose() });
  };

  const filteredModules = Object.entries(grouped).filter(([mod, perms]) => {
    if (!permSearch) return true;
    return perms.some(p =>
      p.key.toLowerCase().includes(permSearch.toLowerCase()) ||
      p.label.toLowerCase().includes(permSearch.toLowerCase())
    );
  });

  const isSA = role.slug === 'super_admin';

  return (
    <div className={compact ? 'flex flex-col' : 'flex h-full flex-col'}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-4 shrink-0">
        <div className="min-w-0 flex-1">
          {isSA ? (
            <div>
              <p className="font-black text-neutral-900">{role.name}</p>
              <p className="text-xs text-neutral-400 mt-0.5">Rôle système — non modifiable</p>
            </div>
          ) : (
            <div className="space-y-2">
              <input value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full border-0 p-0 font-black text-neutral-900 text-base focus:outline-none focus:ring-0 bg-transparent" />
              <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                placeholder="Description…"
                className="w-full border-0 p-0 text-xs text-neutral-400 focus:outline-none focus:ring-0 bg-transparent" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {!isSA && !role.isSystem && (
            <button onClick={handleDelete} disabled={deleteRole.isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-400 transition hover:bg-red-50 hover:text-red-600">
              <Trash2 size={13} />
            </button>
          )}
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={14} /></button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 border-b border-neutral-100 px-6 py-3 shrink-0 bg-neutral-50">
        <span className="text-xs font-semibold text-neutral-500">
          <span className="font-black text-emerald-700">{selectedPerms.size}</span> permissions actives
        </span>
        {isSA && (
          <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-700">
            Accès total — wildcard *
          </span>
        )}
        {role.isSystem && !isSA && (
          <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-black text-blue-700">
            Rôle système
          </span>
        )}
      </div>

      {/* Permission search */}
      {!isSA && (
        <div className="border-b border-neutral-100 px-4 py-2.5 shrink-0">
          <div className="relative">
            <Search size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={permSearch} onChange={e => setPermSearch(e.target.value)}
              placeholder="Filtrer les permissions…"
              className="h-8 w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-xs focus:border-emerald-400 focus:outline-none" />
          </div>
        </div>
      )}

      {/* Permission list */}
      <div className={compact ? 'max-h-[55vh] overflow-y-auto px-4 py-3 space-y-4' : 'flex-1 overflow-y-auto px-4 py-3 space-y-4'}>
        {isSA ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Crown size={32} className="mb-3 text-amber-400" />
            <p className="text-sm font-black text-neutral-700">Super Administrateur</p>
            <p className="mt-1 text-xs text-neutral-400 max-w-48">Ce rôle possède toutes les permissions par défaut (wildcard *)</p>
          </div>
        ) : filteredModules.map(([mod, perms]) => {
          const keys   = perms.map(p => p.key);
          const onCount = keys.filter(k => selectedPerms.has(k)).length;
          const allOn  = onCount === keys.length;
          const someOn = onCount > 0 && !allOn;

          return (
            <div key={mod} className="overflow-hidden rounded-xl border border-neutral-100">
              {/* Module header */}
              <button
                onClick={() => toggleModule(perms)}
                className="flex w-full items-center gap-3 px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 transition">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${allOn ? 'border-emerald-500 bg-emerald-500' : someOn ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-300 bg-white'}`}>
                  {allOn && <Check size={11} className="text-white" />}
                  {someOn && <div className="h-2 w-2 rounded-sm bg-emerald-500" />}
                </div>
                <span className="flex-1 text-left text-xs font-black text-neutral-700 uppercase tracking-[0.1em]">
                  {MODULE_LABELS[mod] ?? mod}
                </span>
                <span className="text-[10px] text-neutral-400">{onCount}/{keys.length}</span>
              </button>

              {/* Permissions */}
              <div className="divide-y divide-neutral-50">
                {perms.map(p => (
                  <label key={p.key} htmlFor={`perm-${p.key}`}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-neutral-50">
                    <input type="checkbox" id={`perm-${p.key}`}
                      checked={selectedPerms.has(p.key)}
                      onChange={() => togglePerm(p.key)}
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800">{p.label}</p>
                      <p className="font-mono text-[10px] text-neutral-400">{p.key}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black ${RISK_STYLE[p.riskLevel]}`}>
                      {RISK_LABEL[p.riskLevel]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save footer */}
      {!isSA && isDirty && (
        <div className="border-t border-neutral-100 px-6 py-4 shrink-0">
          <button onClick={handleSave} disabled={updateRole.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
            {updateRole.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Enregistrer les modifications
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Admin user card ─────────────────────────────────────── */
function AdminCard({ admin, onEditPoste, onEditPerms, onRevoke, onSuspend, isSelf }: {
  admin: AdminUser;
  onEditPoste: (a: AdminUser) => void;
  onEditPerms: (a: AdminUser) => void;
  onRevoke:   (id: string) => void;
  onSuspend:  (id: string) => void;
  isSelf: boolean;
}) {
  const initials    = `${admin.firstName?.[0] ?? '?'}${admin.lastName?.[0] ?? '?'}`.toUpperCase();
  const isSA        = (admin.roles ?? []).some(r => r.slug === 'super_admin');
  const isSuspended = admin.memberStatus === 'suspended';
  const customPerms = admin.customPermissions ?? [];
  const deniedPerms = admin.deniedPermissions ?? [];

  return (
    <div className={`flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm ${isSuspended ? 'border-red-100 opacity-60' : 'border-neutral-100'}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <GenderIcon gender={admin.gender} size={14} />
          <p className="font-black text-sm text-neutral-900">{admin.firstName} {admin.lastName}</p>
          {isSA && <Crown size={12} className="text-amber-500" />}
          {isSelf && <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-black text-emerald-700">Vous</span>}
          {isSuspended && <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[9px] font-black text-red-600">Suspendu</span>}
        </div>
        <p className="text-[11px] text-neutral-400 truncate">{admin.email}</p>
        {admin.bureauPoste && (
          <p className="mt-0.5 text-[10px] font-black text-emerald-700 uppercase tracking-wide">{admin.bureauPoste}</p>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {admin.roles.map(r => (
            <span key={r.slug} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-black text-neutral-600">{r.name}</span>
          ))}
        </div>
        {customPerms.length > 0 && (
          <p className="mt-1 text-[10px] text-blue-600">+{customPerms.length} perm. personnalisée{customPerms.length > 1 ? 's' : ''}</p>
        )}
        {deniedPerms.length > 0 && (
          <p className="mt-0.5 text-[10px] text-red-500">−{deniedPerms.length} perm. refusée{deniedPerms.length > 1 ? 's' : ''}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <button onClick={() => onEditPoste(admin)} title="Modifier le poste"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:text-emerald-600">
          <Edit3 size={12} />
        </button>
        <button onClick={() => onEditPerms(admin)} title="Permissions personnalisées"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-blue-300 hover:text-blue-600">
          <Key size={12} />
        </button>
        {!isSelf && !isSA && (
          <>
            <button onClick={() => onRevoke(admin._id)} title="Révoquer l'accès admin"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 text-red-300 transition hover:border-red-300 hover:text-red-600">
              <ShieldOff size={12} />
            </button>
            {!isSuspended && (
              <button onClick={() => onSuspend(admin._id)} title="Bloquer le compte"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-100 text-orange-300 transition hover:border-orange-400 hover:text-orange-600">
                <Ban size={12} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Edit admin modal (poste + type de rôle + photo) ─────── */
function EditAdminModal({ admin, onClose }: { admin: AdminUser; onClose: () => void }) {
  const isSA = (admin.roles ?? []).some(r => r.slug === 'super_admin');

  const [poste,      setPoste]      = useState(admin.bureauPoste ?? '');
  const [nominationYear, setNominationYear] = useState(String(admin.bureauNominationYear ?? CURRENT_YEAR));
  const [roleSlug,   setRoleSlug]   = useState<'admin' | 'super_admin'>(isSA ? 'super_admin' : 'admin');
  const [saving,     setSaving]     = useState(false);
  const [photoFile,  setPhotoFile]  = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>((admin as any).bureauPhoto ?? null);

  const assign       = useAssignPoste();
  const promote      = usePromoteAdmin();
  const revoke       = useRevokeAdmin();
  const uploadPhoto  = useUploadBureauPhoto();

  const roleChanged  = (roleSlug === 'super_admin') !== isSA;
  const posteChanged = poste !== (admin.bureauPoste ?? '');
  const nominationYearChanged = Number(nominationYear) !== (admin.bureauNominationYear ?? CURRENT_YEAR);
  const nominationYearValid = !poste || (/^\d{4}$/.test(nominationYear) && Number(nominationYear) >= 1900 && Number(nominationYear) <= 2100);
  const photoChanged = !!photoFile;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!nominationYearValid) {
      toast.error('Année de nomination requise');
      return;
    }
    setSaving(true);
    try {
      if (roleChanged) {
        if (roleSlug === 'super_admin') {
          await promote.mutateAsync({ userId: admin._id, roleSlug: 'super_admin' });
        } else {
          await revoke.mutateAsync(admin._id);
          await promote.mutateAsync({ userId: admin._id, roleSlug: 'admin' });
        }
      }
      if (posteChanged || (poste && nominationYearChanged)) {
        await assign.mutateAsync({
          userId: admin._id,
          poste: poste || null,
          nominationYear: poste ? Number(nominationYear) : null,
        });
      }
      if (photoChanged && photoFile) {
        await uploadPhoto.mutateAsync({ userId: admin._id, file: photoFile });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">

        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <p className="font-black text-neutral-900">Modifier l'administrateur</p>
            <p className="text-xs text-neutral-500 mt-0.5">{admin.firstName} {admin.lastName}</p>
          </div>
          <button onClick={onClose}><X size={16} className="text-neutral-400" /></button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">

          {/* Type de rôle */}
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Type d'administrateur</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setRoleSlug('admin')}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${roleSlug === 'admin' ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Shield size={13} className={roleSlug === 'admin' ? 'text-emerald-600' : 'text-neutral-400'} />
                  <span className={`text-sm font-black ${roleSlug === 'admin' ? 'text-emerald-800' : 'text-neutral-700'}`}>Administrateur</span>
                </div>
                <span className="text-[10px] leading-tight text-neutral-400">Accès selon les permissions du rôle</span>
                {roleSlug === 'admin' && <div className="mt-2 h-0.5 w-5 rounded-full bg-emerald-500" />}
              </button>
              <button onClick={() => setRoleSlug('super_admin')}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${roleSlug === 'super_admin' ? 'border-amber-400 bg-amber-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Crown size={13} className={roleSlug === 'super_admin' ? 'text-amber-600' : 'text-neutral-400'} />
                  <span className={`text-sm font-black ${roleSlug === 'super_admin' ? 'text-amber-800' : 'text-neutral-700'}`}>Super Admin</span>
                </div>
                <span className="text-[10px] leading-tight text-neutral-400">Accès total — toutes permissions</span>
                {roleSlug === 'super_admin' && <div className="mt-2 h-0.5 w-5 rounded-full bg-amber-500" />}
              </button>
            </div>
            {roleChanged && roleSlug === 'admin' && (
              <p className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-700">
                <AlertTriangle size={11} className="shrink-0" />
                La rétrogradation révoque temporairement l'accès puis le ré-attribue en tant qu'admin.
              </p>
            )}
          </div>

          {/* Poste du bureau */}
          <div className="space-y-1.5">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Poste du bureau</p>
            <div className="space-y-1">
              <button onClick={() => setPoste('')}
                className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition ${poste === '' ? 'border-neutral-400 bg-neutral-50 font-black text-neutral-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                Aucun poste
              </button>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
                {BUREAU_POSTES.map(p => (
                  <button key={p} onClick={() => setPoste(p)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition ${poste === p ? 'border-emerald-500 bg-emerald-50 font-black text-emerald-700' : 'border-neutral-200 text-neutral-700 hover:border-emerald-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo du bureau — visible seulement si un poste est sélectionné */}
          {poste && (
            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Année de nomination</p>
                <input
                  value={nominationYear}
                  onChange={e => setNominationYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  required
                  placeholder={String(CURRENT_YEAR)}
                  className={`h-10 w-full rounded-xl border bg-white px-4 text-sm font-black text-neutral-800 focus:outline-none ${nominationYearValid ? 'border-neutral-200 focus:border-emerald-400' : 'border-red-300 focus:border-red-400'}`}
                />
                {!nominationYearValid && (
                  <p className="mt-1 text-[11px] font-semibold text-red-500">Année obligatoire entre 1900 et 2100.</p>
                )}
              </div>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-500">
                Photo — carte équipe <span className="font-normal normal-case tracking-normal text-neutral-400">(jpg, png, webp)</span>
              </p>
              <label className="group relative flex cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-4 transition hover:border-emerald-400 hover:bg-emerald-50">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Aperçu" className="h-28 w-28 rounded-xl object-cover shadow-sm" />
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <Camera size={12} /> Changer la photo
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-200 group-hover:bg-emerald-100 transition">
                      <ImagePlus size={20} className="text-neutral-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-neutral-600 group-hover:text-emerald-700">Ajouter une photo</p>
                      <p className="text-[10px] text-neutral-400">Cette photo s'affichera sur la page du bureau</p>
                    </div>
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhotoChange} />
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600">Annuler</button>
          <button
            onClick={handleSave}
            disabled={saving || !nominationYearValid || (!roleChanged && !posteChanged && !(poste && nominationYearChanged) && !photoChanged)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
            {saving && <Loader2 size={13} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Promote modal (2 étapes) ────────────────────────────── */
function PromoteModal({ onClose }: { onClose: () => void }) {
  const [step,          setStep]          = useState<'member' | 'config' | 'success'>('member');
  const [search,        setSearch]        = useState('');
  const [selectedId,    setSelectedId]    = useState('');
  const [selectedName,  setSelectedName]  = useState('');
  const [roleSlug,      setRoleSlug]      = useState<'admin' | 'super_admin'>('admin');
  const [posteSearch,   setPosteSearch]   = useState('');
  const [selectedPoste, setSelectedPoste] = useState('');
  const [nominationYear, setNominationYear] = useState(String(CURRENT_YEAR));
  const [photoFile,     setPhotoFile]     = useState<File | null>(null);
  const [photoPreview,  setPhotoPreview]  = useState<string | null>(null);

  const { data: membersData } = useAdminMembers({ search, limit: 20 });
  const promote     = usePromoteAdmin();
  const assign      = useAssignPoste();
  const uploadPhoto = useUploadBureauPhoto();
  const members     = membersData?.data?.data ?? [];

  const filteredPostes = useMemo(() =>
    posteSearch
      ? BUREAU_POSTES.filter(p => p.toLowerCase().includes(posteSearch.toLowerCase()))
      : BUREAU_POSTES,
  [posteSearch]);
  const nominationYearValid = !selectedPoste || (/^\d{4}$/.test(nominationYear) && Number(nominationYear) >= 1900 && Number(nominationYear) <= 2100);

  const handleSelectPoste = (p: string) => { setSelectedPoste(p); setPosteSearch(p); };
  const handleClearPoste  = () => { setSelectedPoste(''); setPosteSearch(''); setNominationYear(String(CURRENT_YEAR)); setPhotoFile(null); setPhotoPreview(null); };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handlePromote = async () => {
    if (!nominationYearValid) {
      toast.error('Année de nomination requise');
      return;
    }
    try {
      await promote.mutateAsync({ userId: selectedId, roleSlug });
      if (selectedPoste) {
        await assign.mutateAsync({ userId: selectedId, poste: selectedPoste, nominationYear: Number(nominationYear) });
      }
      if (selectedPoste && photoFile) {
        await uploadPhoto.mutateAsync({ userId: selectedId, file: photoFile });
      }
      setStep('success');
    } catch {
      // errors handled by hooks via toast
    }
  };

  /* ── Succès ── */
  if (step === 'success') return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <UserCheck size={28} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-black text-neutral-900">Promotion confirmée !</p>
            <p className="mt-2 text-sm text-neutral-500">
              <strong className="text-neutral-800">{selectedName}</strong> est maintenant{' '}
              {roleSlug === 'super_admin' ? 'super administrateur' : 'administrateur'}.
            </p>
            {selectedPoste && (
              <p className="mt-1 text-xs font-semibold text-emerald-700">Poste : {selectedPoste} depuis {nominationYear}</p>
            )}
            <p className="mt-1.5 text-xs font-semibold text-emerald-700">
              ✉ Un email de notification lui a été envoyé avec un lien de connexion.
            </p>
          </div>
          <button onClick={onClose}
            className="mt-2 inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-black text-white transition hover:bg-emerald-700">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">

        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <p className="font-black text-neutral-900">
              {step === 'member' ? 'Promouvoir un membre' : `Configurer — ${selectedName}`}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {step === 'member' ? 'Étape 1 / 2 — Sélectionner un membre' : 'Étape 2 / 2 — Rôle & poste'}
            </p>
          </div>
          <button onClick={onClose}><X size={16} className="text-neutral-400" /></button>
        </div>

        {/* ── Étape 1 : choix du membre ── */}
        {step === 'member' && (
          <>
            <div className="px-6 py-5 space-y-3">
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} autoFocus
                  placeholder="Nom ou email…"
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm focus:border-emerald-400 focus:outline-none" />
              </div>
              <div className="max-h-52 overflow-y-auto divide-y divide-neutral-50 rounded-xl border border-neutral-100">
                {members.length === 0 && <p className="py-8 text-center text-xs text-neutral-400">Aucun résultat</p>}
                {members.map(m => (
                  <label key={m._id} htmlFor={`promote-${m._id}`}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-neutral-50">
                    <input type="radio" id={`promote-${m._id}`} name="promote-member"
                      value={m._id} checked={selectedId === m._id}
                      onChange={() => { setSelectedId(m._id); setSelectedName(`${m.firstName} ${m.lastName}`); }}
                      className="accent-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-neutral-400 truncate">{m.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
              <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600">Annuler</button>
              <button disabled={!selectedId} onClick={() => setStep('config')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white disabled:opacity-50">
                Suivant <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* ── Étape 2 : rôle + poste ── */}
        {step === 'config' && (
          <>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5 space-y-5">

              {/* Sélection du rôle */}
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Rôle à attribuer</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setRoleSlug('admin')}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${roleSlug === 'admin' ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield size={13} className={roleSlug === 'admin' ? 'text-emerald-600' : 'text-neutral-400'} />
                      <span className={`text-sm font-black ${roleSlug === 'admin' ? 'text-emerald-800' : 'text-neutral-700'}`}>Administrateur</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 leading-tight">Accès selon les permissions du rôle</span>
                    {roleSlug === 'admin' && <div className="mt-2 h-0.5 w-5 rounded-full bg-emerald-500" />}
                  </button>
                  <button onClick={() => setRoleSlug('super_admin')}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${roleSlug === 'super_admin' ? 'border-amber-400 bg-amber-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Crown size={13} className={roleSlug === 'super_admin' ? 'text-amber-600' : 'text-neutral-400'} />
                      <span className={`text-sm font-black ${roleSlug === 'super_admin' ? 'text-amber-800' : 'text-neutral-700'}`}>Super Admin</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 leading-tight">Accès total — toutes permissions</span>
                    {roleSlug === 'super_admin' && <div className="mt-2 h-0.5 w-5 rounded-full bg-amber-500" />}
                  </button>
                </div>
              </div>

              {/* Poste (combobox recherchable) */}
              <div className="space-y-1.5">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Poste du bureau <span className="font-normal normal-case tracking-normal text-neutral-400">(optionnel)</span></p>
                <div className="relative">
                  <Search size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={posteSearch}
                    onChange={e => { setPosteSearch(e.target.value); if (e.target.value !== selectedPoste) setSelectedPoste(''); }}
                    placeholder="Rechercher un poste…"
                    className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-8 text-sm focus:border-emerald-400 focus:outline-none" />
                  {selectedPoste && (
                    <button onClick={handleClearPoste}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="max-h-32 overflow-y-auto rounded-xl border border-neutral-100 divide-y divide-neutral-50">
                  <button onClick={handleClearPoste}
                    className={`w-full px-3 py-2 text-left text-xs transition ${!selectedPoste ? 'bg-neutral-50 font-black text-neutral-500' : 'text-neutral-400 hover:bg-neutral-50'}`}>
                    Aucun poste
                  </button>
                  {filteredPostes.map(p => (
                    <button key={p} onClick={() => handleSelectPoste(p)}
                      className={`w-full px-3 py-2 text-left text-sm transition ${selectedPoste === p ? 'bg-emerald-50 font-black text-emerald-700' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                      {p}
                    </button>
                  ))}
                  {filteredPostes.length === 0 && (
                    <p className="px-3 py-3 text-center text-xs text-neutral-400">Aucun résultat</p>
                  )}
                </div>
              </div>

              {/* Photo bureau — visible si poste sélectionné */}
              {selectedPoste && (
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Année de nomination</p>
                    <input
                      value={nominationYear}
                      onChange={e => setNominationYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      inputMode="numeric"
                      required
                      placeholder={String(CURRENT_YEAR)}
                      className={`h-10 w-full rounded-xl border bg-white px-4 text-sm font-black text-neutral-800 focus:outline-none ${nominationYearValid ? 'border-neutral-200 focus:border-emerald-400' : 'border-red-300 focus:border-red-400'}`}
                    />
                    {!nominationYearValid && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500">Année obligatoire entre 1900 et 2100.</p>
                    )}
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-500">
                    Photo — carte équipe <span className="font-normal normal-case tracking-normal text-neutral-400">(jpg, png, webp)</span>
                  </p>
                  <label className="group relative flex cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-4 transition hover:border-emerald-400 hover:bg-emerald-50">
                    {photoPreview ? (
                      <>
                        <img src={photoPreview} alt="Aperçu" className="h-24 w-24 rounded-xl object-cover shadow-sm" />
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <Camera size={12} /> Changer la photo
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-200 group-hover:bg-emerald-100 transition">
                          <ImagePlus size={20} className="text-neutral-400 group-hover:text-emerald-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black text-neutral-600 group-hover:text-emerald-700">Ajouter une photo</p>
                          <p className="text-[10px] text-neutral-400">S'affichera sur la carte bureau</p>
                        </div>
                      </>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhotoChange} />
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
              <button onClick={() => setStep('member')}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600">
                Retour
              </button>
              <button
                disabled={promote.isPending || assign.isPending || uploadPhoto.isPending || !nominationYearValid}
                onClick={handlePromote}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white disabled:opacity-50">
                {(promote.isPending || assign.isPending || uploadPhoto.isPending) && <Loader2 size={13} className="animate-spin" />}
                Promouvoir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Custom perms modal ──────────────────────────────────── */
function CustomPermsModal({ admin, onClose }: { admin: AdminUser; onClose: () => void }) {
  const { data: permsData } = usePermissionsList();
  const grouped  = (permsData?.data?.grouped  ?? {}) as Record<string, PermissionDoc[]>;
  const allPerms = useMemo(() => Object.values(grouped).flat(), [grouped]);

  const [customSet, setCustomSet] = useState<Set<string>>(new Set(admin.customPermissions));
  const [deniedSet, setDeniedSet] = useState<Set<string>>(new Set(admin.deniedPermissions));
  const [search,    setSearch]    = useState('');
  const update = useUpdateCustomPerms();

  /* ── Filtrage ── */
  const filteredGroups = useMemo(() => {
    if (!search) return Object.entries(grouped);
    return Object.entries(grouped)
      .map(([mod, perms]) => [mod, perms.filter(p =>
        p.key.toLowerCase().includes(search.toLowerCase()) ||
        p.label.toLowerCase().includes(search.toLowerCase()),
      )] as [string, PermissionDoc[]])
      .filter(([, perms]) => perms.length > 0);
  }, [grouped, search]);

  /* ── Tout sélectionner global ── */
  const allCustom = allPerms.length > 0 && allPerms.every(p => customSet.has(p.key));
  const allDenied = allPerms.length > 0 && allPerms.every(p => deniedSet.has(p.key));

  const toggleAllCustom = () => {
    if (allCustom) { setCustomSet(new Set()); return; }
    setCustomSet(new Set(allPerms.map(p => p.key)));
    setDeniedSet(prev => { const n = new Set(prev); allPerms.forEach(p => n.delete(p.key)); return n; });
  };
  const toggleAllDenied = () => {
    if (allDenied) { setDeniedSet(new Set()); return; }
    setDeniedSet(new Set(allPerms.map(p => p.key)));
    setCustomSet(prev => { const n = new Set(prev); allPerms.forEach(p => n.delete(p.key)); return n; });
  };

  /* ── Par permission (boutons) ── */
  const grantPerm = (key: string) => {
    setCustomSet(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
    setDeniedSet(prev => { const n = new Set(prev); n.delete(key); return n; });
  };
  const denyPerm = (key: string) => {
    setDeniedSet(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
    setCustomSet(prev => { const n = new Set(prev); n.delete(key); return n; });
  };

  /* ── Par module ── */
  const toggleModuleCustom = (perms: PermissionDoc[]) => {
    const keys = perms.map(p => p.key);
    const allOn = keys.every(k => customSet.has(k));
    setCustomSet(prev => { const n = new Set(prev); keys.forEach(k => allOn ? n.delete(k) : n.add(k)); return n; });
    if (!allOn) setDeniedSet(prev => { const n = new Set(prev); keys.forEach(k => n.delete(k)); return n; });
  };
  const toggleModuleDenied = (perms: PermissionDoc[]) => {
    const keys = perms.map(p => p.key);
    const allOn = keys.every(k => deniedSet.has(k));
    setDeniedSet(prev => { const n = new Set(prev); keys.forEach(k => allOn ? n.delete(k) : n.add(k)); return n; });
    if (!allOn) setCustomSet(prev => { const n = new Set(prev); keys.forEach(k => n.delete(k)); return n; });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200 max-h-[90vh] flex flex-col">

        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 shrink-0">
          <div>
            <p className="font-black text-neutral-900">Permissions personnalisées</p>
            <p className="text-xs text-neutral-500 mt-0.5">{admin.firstName} {admin.lastName}</p>
          </div>
          <button onClick={onClose}><X size={16} className="text-neutral-400" /></button>
        </div>

        {/* Compteurs */}
        <div className="border-b border-neutral-100 px-5 py-2 shrink-0 bg-neutral-50 flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-wide text-emerald-700">+ Accordée : {customSet.size}</span>
          <span className="text-[10px] font-black uppercase tracking-wide text-red-600">− Refusée : {deniedSet.size}</span>
        </div>

        {/* Recherche */}
        <div className="border-b border-neutral-100 px-4 py-2.5 shrink-0">
          <div className="relative">
            <Search size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrer les permissions…"
              className="h-8 w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-xs focus:outline-none focus:border-emerald-400" />
          </div>
        </div>

        {/* En-têtes colonnes + TOUT sélectionner */}
        <div className="border-b border-neutral-100 px-4 py-1.5 shrink-0 bg-neutral-50 flex items-center">
          <span className="flex-1 text-[10px] font-black uppercase tracking-wide text-neutral-400">Permission</span>
          {/* Colonnes alignées avec les boutons des lignes */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="flex w-[86px] flex-col items-center gap-0.5 cursor-pointer select-none">
              <input type="checkbox" checked={allCustom} onChange={toggleAllCustom}
                className="h-3.5 w-3.5 rounded cursor-pointer accent-emerald-600" />
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wide">Tout +</span>
            </label>
            <label className="flex w-[78px] flex-col items-center gap-0.5 cursor-pointer select-none">
              <input type="checkbox" checked={allDenied} onChange={toggleAllDenied}
                className="h-3.5 w-3.5 rounded cursor-pointer accent-red-500" />
              <span className="text-[9px] font-black text-red-600 uppercase tracking-wide">Tout −</span>
            </label>
          </div>
        </div>

        {/* Liste groupée par module */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {filteredGroups.map(([mod, perms]) => {
            const keys          = perms.map(p => p.key);
            const allModCustom  = keys.every(k => customSet.has(k));
            const someModCustom = keys.some(k => customSet.has(k));
            const allModDenied  = keys.every(k => deniedSet.has(k));
            const someModDenied = keys.some(k => deniedSet.has(k));

            return (
              <div key={mod} className="overflow-hidden rounded-xl border border-neutral-100">
                {/* En-tête module */}
                <div className="flex items-center px-4 py-2 bg-neutral-50">
                  <span className="flex-1 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-600">
                    {MODULE_LABELS[mod] ?? mod}
                    <span className="ml-2 font-normal normal-case text-neutral-400">({perms.length})</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="flex w-[86px] items-center justify-center cursor-pointer" title="Tout accorder ce module">
                      <input type="checkbox"
                        checked={allModCustom}
                        ref={el => { if (el) el.indeterminate = someModCustom && !allModCustom; }}
                        onChange={() => toggleModuleCustom(perms)}
                        className="h-3.5 w-3.5 rounded cursor-pointer accent-emerald-600" />
                    </label>
                    <label className="flex w-[78px] items-center justify-center cursor-pointer" title="Tout refuser ce module">
                      <input type="checkbox"
                        checked={allModDenied}
                        ref={el => { if (el) el.indeterminate = someModDenied && !allModDenied; }}
                        onChange={() => toggleModuleDenied(perms)}
                        className="h-3.5 w-3.5 rounded cursor-pointer accent-red-500" />
                    </label>
                  </div>
                </div>

                {/* Permissions */}
                <div className="divide-y divide-neutral-50">
                  {perms.map(p => {
                    const isCustom = customSet.has(p.key);
                    const isDenied = deniedSet.has(p.key);
                    return (
                      <div key={p.key}
                        className={`flex items-center px-4 py-2.5 transition ${isCustom ? 'bg-emerald-50/50' : isDenied ? 'bg-red-50/40' : 'hover:bg-neutral-50'}`}>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${isCustom ? 'text-emerald-800' : isDenied ? 'text-red-700' : 'text-neutral-800'}`}>{p.label}</p>
                          <p className="font-mono text-[10px] text-neutral-400">{p.key}</p>
                        </div>
                        <span className={`mx-3 shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black ${RISK_STYLE[p.riskLevel]}`}>
                          {RISK_LABEL[p.riskLevel]}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => grantPerm(p.key)}
                            className={`w-[86px] rounded-full border px-2 py-0.5 text-[10px] font-black transition ${isCustom ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-400 hover:border-emerald-300 hover:text-emerald-600'}`}>
                            + accordée
                          </button>
                          <button
                            onClick={() => denyPerm(p.key)}
                            className={`w-[78px] rounded-full border px-2 py-0.5 text-[10px] font-black transition ${isDenied ? 'border-red-400 bg-red-50 text-red-600' : 'border-neutral-200 text-neutral-400 hover:border-red-300 hover:text-red-500'}`}>
                            − refusée
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pied de page */}
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600">Annuler</button>
          <button
            disabled={update.isPending}
            onClick={() => update.mutate(
              { userId: admin._id, customPermissions: [...customSet], deniedPermissions: [...deniedSet] },
              { onSuccess: () => onClose() },
            )}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white disabled:opacity-50">
            {update.isPending && <Loader2 size={13} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
type Tab = 'roles' | 'bureau' | 'permissions';

export default function RolesPage() {
  const user   = useAuthStore(s => s.user);
  const SA     = isSuperAdmin(user);
  const router = useRouter();

  useEffect(() => {
    if (user !== undefined && !SA) router.push('/admin/dashboard');
  }, [SA, user, router]);

  const [tab,          setTab]          = useState<Tab>('roles');
  const [selectedRole, setSelectedRole] = useState<RoleDoc | null>(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [showPromote,  setShowPromote]  = useState(false);
  const [editPoste,    setEditPoste]    = useState<AdminUser | null>(null);
  const [editPerms,    setEditPerms]    = useState<AdminUser | null>(null);
  const [permSearch,   setPermSearch]   = useState('');
  const [riskFilter,   setRiskFilter]   = useState<string>('all');

  const { data: rolesData,    isLoading: rolesLoading }   = useRoles();
  const { data: adminsData,   isLoading: adminsLoading }  = useAdminUsers();
  const { data: permsData,    isLoading: permsLoading }   = usePermissionsList();
  const revokeAdmin   = useRevokeAdmin();
  const suspendMember = useSuspendMember();

  const roles   = rolesData?.data   ?? [];
  const admins  = adminsData?.data  ?? [];
  const grouped = permsData?.data?.grouped ?? {};

  const allPerms = useMemo(() => {
    return Object.values(grouped).flat().filter(p =>
      !permSearch || p.key.toLowerCase().includes(permSearch.toLowerCase()) || p.label.toLowerCase().includes(permSearch.toLowerCase())
    );
  }, [grouped, permSearch]);

  const TABS = [
    { id: 'roles'       as Tab, label: 'Rôles',        icon: Shield, count: roles.length   },
    { id: 'bureau'      as Tab, label: 'Bureau',        icon: Users,  count: admins.length  },
    { id: 'permissions' as Tab, label: 'Permissions',   icon: Key,    count: Object.values(grouped).flat().length },
  ];

  const handleRevoke = (id: string) => {
    if (!confirm('Révoquer l\'accès administrateur de cet utilisateur ?')) return;
    revokeAdmin.mutate(id);
  };

  const handleSuspend = (id: string) => {
    if (!confirm('Bloquer ce compte ? L\'utilisateur ne pourra plus se connecter.')) return;
    suspendMember.mutate(id);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Rôles & Permissions</h1>
          <p className="mt-1 text-sm text-neutral-500">Gestion des accès, du bureau exécutif et des droits SALAM.</p>
        </div>
        {!SA && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
            <AlertTriangle size={14} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-700">Certaines actions nécessitent le rôle super admin</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition ${tab === t.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === t.id ? 'bg-white/20' : 'bg-neutral-100'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── ROLES TAB ── */}
      {tab === 'roles' && (
        <div className={`grid gap-5 ${selectedRole ? 'lg:grid-cols-[300px_1fr]' : ''}`}>
          {/* Role list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{roles.length} rôle{roles.length > 1 ? 's' : ''}</p>
              {SA && (
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-emerald-700">
                  <Plus size={12} /> Nouveau rôle
                </button>
              )}
            </div>
            <div className="space-y-2">
              {rolesLoading && [1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />)}
              {roles.map(role => {
                const active = selectedRole?._id === role._id;
                return (
                  <div key={role._id}>
                    <button onClick={() => setSelectedRole(active ? null : role)}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${active ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'} shadow-sm`}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-100' : 'bg-neutral-100'}`}>
                        {role.slug === 'super_admin'
                          ? <Crown size={16} className="text-amber-500" />
                          : <Shield size={16} className={active ? 'text-emerald-600' : 'text-neutral-400'} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black truncate ${active ? 'text-emerald-800' : 'text-neutral-900'}`}>{role.name}</p>
                        <p className="text-[10px] text-neutral-400">
                          {role.slug === 'super_admin' ? 'Accès total *' : `${role.permissions.length} permissions`}
                          {role.isSystem && <span className="ml-2 text-blue-400">• Système</span>}
                        </p>
                      </div>
                      {/* Chevron : tourne 90° vers le bas sur mobile quand ouvert */}
                      <ChevronRight
                        size={12}
                        className={`transition-transform duration-200 ${active ? 'rotate-90 lg:rotate-0 text-emerald-500' : 'text-neutral-300'}`}
                      />
                    </button>

                    {/* ── Accordéon mobile/tablette (< lg) ── */}
                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.div
                          key="accordion"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="lg:hidden overflow-hidden"
                        >
                          <div className="mt-1 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
                            <RoleEditor key={role._id} role={role} onClose={() => setSelectedRole(null)} compact />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role editor panel — desktop uniquement */}
          {selectedRole && (
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm" style={{ height: 'calc(100vh - 240px)', minHeight: 500 }}>
              <RoleEditor key={selectedRole._id} role={selectedRole} onClose={() => setSelectedRole(null)} />
            </div>
          )}
        </div>
      )}

      {/* ── BUREAU TAB ── */}
      {tab === 'bureau' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{admins.length} administrateur{admins.length > 1 ? 's' : ''}</p>
            {SA && (
              <button onClick={() => setShowPromote(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-emerald-700">
                <UserCheck size={12} /> Promouvoir un membre
              </button>
            )}
          </div>
          {adminsLoading && [1,2].map(i => <div key={i} className="h-24 rounded-2xl bg-neutral-100 animate-pulse" />)}
          <div className="grid gap-3 sm:grid-cols-2">
            {admins.map(a => (
              <AdminCard
                key={a._id}
                admin={a}
                isSelf={a._id === user?._id}
                onEditPoste={setEditPoste}
                onEditPerms={setEditPerms}
                onRevoke={handleRevoke}
                onSuspend={handleSuspend}
              />
            ))}
          </div>
          {!adminsLoading && admins.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <Shield size={32} className="mb-3 text-neutral-200" />
              <p className="text-sm font-semibold text-neutral-400">Aucun administrateur trouvé</p>
            </div>
          )}
        </div>
      )}

      {/* ── PERMISSIONS TAB ── */}
      {tab === 'permissions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={permSearch} onChange={e => setPermSearch(e.target.value)}
                placeholder="Filtrer les permissions…"
                className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm focus:border-emerald-400 focus:outline-none" />
            </div>
            {/* Filtres par niveau de risque */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setRiskFilter('all')}
                className={`rounded-full border px-3 py-1 text-[10px] font-black transition ${riskFilter === 'all' ? 'border-neutral-400 bg-neutral-100 text-neutral-700' : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'}`}>
                Tous
              </button>
              {Object.entries(RISK_LABEL).map(([k, label]) => (
                <button key={k} onClick={() => setRiskFilter(riskFilter === k ? 'all' : k)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-black transition ${riskFilter === k ? RISK_STYLE[k] : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {permsLoading && <div className="h-64 rounded-2xl bg-neutral-100 animate-pulse" />}

          {!permsLoading && Object.entries(grouped).map(([mod, perms]) => {
            const filteredPerms = perms.filter(p => {
              const matchSearch = !permSearch || p.key.toLowerCase().includes(permSearch.toLowerCase()) || p.label.toLowerCase().includes(permSearch.toLowerCase());
              const matchRisk   = riskFilter === 'all' || p.riskLevel === riskFilter;
              return matchSearch && matchRisk;
            });
            if (filteredPerms.length === 0) return null;
            return (
              <div key={mod} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
                <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-600">{MODULE_LABELS[mod] ?? mod}</p>
                </div>
                <div className="divide-y divide-neutral-50">
                  {filteredPerms.map(p => (
                    <div key={p.key} className="flex items-center gap-4 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800">{p.label}</p>
                        <p className="font-mono text-[11px] text-neutral-400">{p.key}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${RISK_STYLE[p.riskLevel]}`}>
                        {RISK_LABEL[p.riskLevel]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreate  && <CreateRoleModal  onClose={() => setShowCreate(false)} />}
      {showPromote && <PromoteModal     onClose={() => setShowPromote(false)} />}
      {editPoste   && <EditAdminModal   admin={editPoste} onClose={() => setEditPoste(null)} />}
      {editPerms   && <CustomPermsModal admin={editPerms} onClose={() => setEditPerms(null)} />}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, ChevronDown, ChevronUp,
  FolderOpen, Handshake, Loader2, Mail, MapPin,
  MessageSquare, Plus, Search, Tags, Trash2, Users, X,
} from 'lucide-react';
import { useMemberDirectorySearch, type DirectoryMember } from '@/lib/api/members';
import {
  useMyDirectories, useCreateDirectory, useDeleteDirectory,
  useAddToDirectory, useRemoveFromDirectory, type ContactDirectory,
} from '@/lib/api/directories';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { AvatarLightbox } from '@/components/portal/AvatarLightbox';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { toast } from 'sonner';

type NetworkingMember = DirectoryMember;
type Tab = 'competences' | 'mon-repertoire';

const TABS = [
  { value: 'competences' as Tab,    label: 'Répertoire de compétences' },
  { value: 'mon-repertoire' as Tab, label: 'Mon répertoire' },
];

/* ── Helpers ──────────────────────────────────────────────── */
function countValues(members: NetworkingMember[], getter: (m: NetworkingMember) => string[] | string | undefined) {
  const map = new Map<string, number>();
  members.forEach(m => {
    const v = getter(m);
    const arr = Array.isArray(v) ? v : v ? [v] : [];
    arr.filter(Boolean).forEach(item => map.set(item, (map.get(item) ?? 0) + 1));
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function KeywordSection({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'amber' | 'violet' }) {
  const cls = {
    green:  'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber:  'bg-amber-50  text-amber-700  ring-amber-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  }[tone];
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0
          ? <span className="rounded-full bg-neutral-50 px-2 py-1 text-[10px] font-black text-neutral-400 ring-1 ring-neutral-100">Non renseigné</span>
          : items.map(item => <span key={item} className={`rounded-full px-2 py-1 text-[10px] font-black ring-1 ${cls}`}>{item}</span>)}
      </div>
    </div>
  );
}

/* ── Modal profil ─────────────────────────────────────────── */
function MemberProfileModal({ member, onClose }: { member: NetworkingMember; onClose: () => void }) {
  const name     = formatFullName(member.firstName, member.lastName);
  const photo    = memberPhotoUrl(member);
  const location = [member.residenceCity || member.city, member.country].filter(Boolean).join(', ') || 'Résidence non renseignée';
  const whatsapp = member.phone?.replace(/\D/g, '').replace(/^0/, '237');
  const msgHref  = `/member/messages?to=${encodeURIComponent(member._id)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(member.email)}`;

  return (
    <div className="fixed inset-0 z-[9999] grid min-h-[100dvh] place-items-center bg-black/65 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-neutral-500 shadow-sm transition hover:bg-neutral-100"><X size={16} /></button>
        <div className="flex flex-col gap-5 border-b border-neutral-100 bg-gradient-to-br from-emerald-50 to-white p-5 sm:flex-row sm:items-center">
          {photo ? (
            <AvatarLightbox src={photo} alt={name} className={'h-20 w-20 shrink-0 rounded-full border-2 object-cover ' + memberAvatarBorderClass(member.gender)} />
          ) : (
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-black text-white ${memberInitialsClass(member.gender)}`}>{formatInitials(member.firstName, member.lastName, 'M')}</div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-black text-neutral-950">{name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-neutral-500"><MapPin size={14} /> {location}</p>
            <p className="mt-2 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">{member.activitySector || 'Secteur non renseigné'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${member.email}`} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs font-black text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700"><Mail size={12} /> Email</a>
              {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-2.5 text-xs font-black text-green-700 transition hover:bg-green-100">WhatsApp</a>}
              <Link href={msgHref} className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 text-xs font-black text-white transition hover:bg-emerald-700"><MessageSquare size={12} /> Message</Link>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-5">
          <KeywordSection title="Secteur d'activité"    items={member.activitySector ? [member.activitySector] : []} tone="green" />
          <KeywordSection title="Compétences"           items={member.skills ?? []} tone="amber" />
          <KeywordSection title="Domaines d'expertise"  items={member.expertiseDomains ?? []} tone="violet" />
          {member.bio && <div><p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Biographie</p><p className="text-sm leading-6 text-neutral-600">{member.bio}</p></div>}
        </div>
      </div>
    </div>
  );
}

/* ── Modal ajout au répertoire ────────────────────────────── */
function AddToDirectoryModal({ member, onClose }: { member: NetworkingMember; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newName, setNewName]   = useState('');
  const [creating, setCreating] = useState(false);

  const { data: dirsData, isLoading } = useMyDirectories();
  const directories = dirsData?.data?.directories ?? [];
  const addMut    = useAddToDirectory();
  const createMut = useCreateDirectory();

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const res = await createMut.mutateAsync(newName.trim());
      const newId = (res as any)?.data?.directory?._id as string | undefined;
      setNewName('');
      setCreating(false);
      if (newId) setSelected(prev => new Set([...prev, newId]));
    } catch {}
  };

  const handleConfirm = async () => {
    if (selected.size === 0) return;
    let added = 0;
    for (const dirId of selected) {
      try { await addMut.mutateAsync({ directoryId: dirId, memberId: member._id }); added++; } catch {}
    }
    if (added > 0) toast.success(`Profil ajouté à ${added} répertoire${added > 1 ? 's' : ''}`);
    onClose();
  };

  const name = formatFullName(member.firstName, member.lastName);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"><X size={16} /></button>
        <p className="pr-10 text-sm font-black text-neutral-900">Ajouter à un répertoire</p>
        <p className="mt-0.5 truncate text-xs text-neutral-500">{name}</p>

        <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
          {isLoading && <div className="flex items-center gap-2 py-4 text-xs text-neutral-400"><Loader2 size={14} className="animate-spin" /> Chargement…</div>}
          {!isLoading && directories.length === 0 && (
            <p className="rounded-xl bg-neutral-50 px-4 py-3 text-xs text-neutral-400">Aucun répertoire. Créez-en un ci-dessous.</p>
          )}
          {directories.map(dir => (
            <label key={dir._id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
              <input
                type="checkbox"
                checked={selected.has(dir._id)}
                onChange={() => toggle(dir._id)}
                className="h-4 w-4 rounded border-neutral-300 accent-emerald-600"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-neutral-800">{dir.name}</p>
                <p className="text-[10px] text-neutral-400">{dir.memberIds.length} contact{dir.memberIds.length !== 1 ? 's' : ''}</p>
              </div>
            </label>
          ))}
        </div>

        {creating ? (
          <div className="mt-3 flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleCreate(); if (e.key === 'Escape') setCreating(false); }}
              placeholder="Nom du répertoire…"
              className="h-9 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none focus:border-emerald-400"
            />
            <button type="button" onClick={handleCreate} disabled={createMut.isPending} className="h-9 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50">
              {createMut.isPending ? <Loader2 size={13} className="animate-spin" /> : 'OK'}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50"><X size={14} /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setCreating(true)} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline">
            <Plus size={12} /> Créer un répertoire
          </button>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 rounded-xl border border-neutral-200 px-4 text-xs font-bold text-neutral-600 hover:bg-neutral-50">Annuler</button>
          <button type="button" onClick={handleConfirm} disabled={selected.size === 0 || addMut.isPending} className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50">
            {addMut.isPending ? <Loader2 size={13} className="animate-spin" /> : `Ajouter${selected.size > 0 ? ` (${selected.size})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Carte membre ─────────────────────────────────────────── */
function MemberNetworkingCard({
  member,
  onOpen,
  onAddToDirectory,
}: {
  member: NetworkingMember;
  onOpen: (m: NetworkingMember) => void;
  onAddToDirectory: (m: NetworkingMember) => void;
}) {
  const name       = formatFullName(member.firstName, member.lastName);
  const photo      = memberPhotoUrl(member);
  const location   = [member.residenceCity || member.city, member.country].filter(Boolean).join(', ');
  const whatsapp   = member.phone?.replace(/\D/g, '').replace(/^0/, '237');
  const msgHref    = `/member/messages?to=${encodeURIComponent(member._id)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(member.email)}`;
  const savedCount = member.savedCount ?? 0;

  return (
    <article className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md">
      <div className="flex items-start gap-3">
        {photo ? (
          <AvatarLightbox src={photo} alt={name} className={'h-12 w-12 shrink-0 rounded-full border-2 object-cover ' + memberAvatarBorderClass(member.gender)} />
        ) : (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${memberInitialsClass(member.gender)}`}>{formatInitials(member.firstName, member.lastName, 'M')}</div>
        )}
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => onOpen(member)} className="block max-w-full truncate text-left text-sm font-black text-neutral-900 transition hover:text-emerald-700">{name}</button>

          {/* Secteur + compteur + bouton ajout */}
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold text-emerald-700">{member.activitySector || 'Secteur non renseigné'}</p>
            <div className="flex shrink-0 items-center gap-1.5">
              {savedCount > 0 && (
                <span title={`Ajouté ${savedCount} fois dans des répertoires SALAM`} className="text-[9px] font-bold text-neutral-400">
                  ✦ {savedCount}×
                </span>
              )}
              <button
                type="button"
                onClick={() => onAddToDirectory(member)}
                className="inline-flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
              >
                <Plus size={9} /> Répertoire
              </button>
            </div>
          </div>

          {location && <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-semibold text-neutral-400"><MapPin size={11} /> {location}</p>}
        </div>
      </div>

      {member.bio && <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-500">{member.bio}</p>}

      <div className="mt-3 space-y-3">
        <KeywordSection title="Secteur d'activité"   items={member.activitySector ? [member.activitySector] : []} tone="green" />
        <KeywordSection title="Compétences"          items={(member.skills ?? []).slice(0, 6)} tone="amber" />
        <KeywordSection title="Domaines d'expertise" items={(member.expertiseDomains ?? []).slice(0, 5)} tone="violet" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        <a href={`mailto:${member.email}`} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs font-black text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700"><Mail size={12} /> Email</a>
        {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-2.5 text-xs font-black text-green-700 transition hover:bg-green-100">WhatsApp</a>}
        <Link href={msgHref} className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 text-xs font-black text-white transition hover:bg-emerald-700"><MessageSquare size={12} /> Message</Link>
        {member.antenne && <span className="text-[11px] font-bold text-neutral-400">Antenne {member.antenne}</span>}
      </div>
    </article>
  );
}

/* ── Carte répertoire individuelle ────────────────────────── */
function DirectoryCard({
  dir,
  expanded,
  onToggle,
  onDelete,
  onRemoveMember,
}: {
  dir: ContactDirectory;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onRemoveMember: (memberId: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const count = dir.memberIds.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <FolderOpen size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-neutral-900">{dir.name}</p>
          <p className="text-[10px] font-semibold text-neutral-400">{count} contact{count !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={onToggle} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-700">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onDelete} className="h-7 rounded-lg bg-red-500 px-2.5 text-[10px] font-black text-white hover:bg-red-600">Confirmer</button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="h-7 rounded-lg border border-neutral-200 px-2.5 text-[10px] font-bold text-neutral-500 hover:bg-neutral-50">Annuler</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-neutral-300 transition hover:bg-red-50 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-neutral-50 px-4 py-3">
          {count === 0 ? (
            <p className="py-4 text-center text-xs text-neutral-400">Ce répertoire est vide.<br />Recherchez des compétences pour y ajouter des contacts.</p>
          ) : (
            <div className="space-y-2">
              {dir.memberIds.map(m => {
                const mName = formatFullName(m.firstName, m.lastName);
                const photo = memberPhotoUrl(m);
                return (
                  <div key={m._id} className="flex items-center gap-2.5">
                    {photo ? (
                      <img src={photo} alt={mName} className={'h-8 w-8 shrink-0 rounded-full border-2 object-cover ' + memberAvatarBorderClass(m.gender)} />
                    ) : (
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${memberInitialsClass(m.gender)}`}>{formatInitials(m.firstName, m.lastName, 'M')}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-neutral-800">{mName}</p>
                      {m.activitySector && <p className="truncate text-[10px] text-emerald-600">{m.activitySector}</p>}
                    </div>
                    <button type="button" onClick={() => onRemoveMember(m._id)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-neutral-300 transition hover:bg-red-50 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Section Mon répertoire ───────────────────────────────── */
function MonRepertoireSection({ onViewCompetences }: { onViewCompetences: () => void }) {
  const [createName, setCreateName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded]     = useState<string | null>(null);

  const { data: dirsData, isLoading, isError, refetch } = useMyDirectories();
  const directories = dirsData?.data?.directories ?? [];

  const createMut = useCreateDirectory();
  const deleteMut = useDeleteDirectory();
  const removeMut = useRemoveFromDirectory();

  const handleCreate = async () => {
    if (!createName.trim()) return;
    try {
      await createMut.mutateAsync(createName.trim());
      setCreateName('');
      setShowCreate(false);
    } catch {}
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-black text-neutral-900">Mes répertoires</p>
          <p className="mt-0.5 text-xs text-neutral-400">
            {directories.length} répertoire{directories.length !== 1 ? 's' : ''} créé{directories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(v => !v)} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white transition hover:bg-emerald-700">
          <Plus size={13} /> Créer
        </button>
      </div>

      {showCreate && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="mb-3 text-xs font-black text-neutral-700">Nouveau répertoire</p>
          <div className="flex gap-2">
            <input
              autoFocus
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
              placeholder="Ex : Fintech, Partenaires, Réseau Yaoundé…"
              className="h-10 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
            />
            <button type="button" onClick={handleCreate} disabled={!createName.trim() || createMut.isPending} className="h-10 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50">
              {createMut.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Créer'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 text-neutral-400 hover:bg-neutral-50"><X size={15} /></button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-400">
          <Loader2 size={16} className="animate-spin" /> Chargement…
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 py-8 text-center">
          <p className="text-sm font-black text-red-600">Impossible de charger les répertoires.</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-xs font-semibold text-red-500 underline underline-offset-2 hover:text-red-700">
            Réessayer
          </button>
        </div>
      )}

      {!isLoading && !isError && directories.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-200 bg-white py-14 text-center">
          <BookOpen size={36} className="mb-3 text-neutral-200" />
          <p className="text-sm font-black text-neutral-500">Aucun répertoire créé.</p>
          <p className="mt-1 max-w-sm text-xs leading-6 text-neutral-400">
            Créez un répertoire, puis ajoutez des contacts depuis le <strong>Répertoire de compétences</strong>.
          </p>
          <button type="button" onClick={onViewCompetences} className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white transition hover:bg-emerald-700">
            <Search size={13} /> Voir les compétences
          </button>
        </div>
      )}

      {directories.length > 0 && (
        <div className="space-y-3">
          {directories.map(dir => (
            <DirectoryCard
              key={dir._id}
              dir={dir}
              expanded={expanded === dir._id}
              onToggle={() => setExpanded(prev => prev === dir._id ? null : dir._id)}
              onDelete={() => deleteMut.mutate(dir._id)}
              onRemoveMember={memberId => removeMut.mutate({ directoryId: dir._id, memberId })}
            />
          ))}
          <div className="pt-2 text-center">
            <button type="button" onClick={onViewCompetences} className="text-xs font-semibold text-emerald-600 hover:underline">
              ← Retour au répertoire de compétences
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Page principale ──────────────────────────────────────── */
export default function NetworkingPage() {
  const [tab, setTab]               = useState<Tab>('competences');
  const [search, setSearch]         = useState('');
  const [selectedMember, setSelectedMember] = useState<NetworkingMember | null>(null);
  const [addModal, setAddModal]     = useState<NetworkingMember | null>(null);

  const query   = useMemberDirectorySearch(search, 60);
  const results = query.data?.data?.data ?? [];
  const trimmed = search.trim();

  const sectors          = useMemo(() => countValues(results, m => m.activitySector).slice(0, 8), [results]);
  const skills           = useMemo(() => countValues(results, m => m.skills).slice(0, 8), [results]);
  const domains          = useMemo(() => countValues(results, m => m.expertiseDomains).slice(0, 8), [results]);
  const completeProfiles = results.filter(m => Boolean(m.activitySector) && Boolean(m.skills?.length) && Boolean(m.expertiseDomains?.length)).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-[clamp(1.55rem,3vw,2rem)] font-black tracking-[-0.03em] text-neutral-900">Networking</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Répertoire de compétences et de secteurs d'activité SALAM.</p>
      </div>

      <AnimatedTabBar items={TABS} value={tab} onChange={setTab} />

      {/* ── Répertoire de compétences ───────────────────────── */}
      {tab === 'competences' && (
        <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-black text-neutral-900">Répertoire de compétences</p>
            <p className="mt-1 text-xs text-neutral-400">Recherche sur secteurs, compétences, domaines, villes, antennes et biographies.</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un secteur, une compétence, un domaine…"
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          {results.length > 0 && (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><div className="flex items-center gap-2 text-emerald-700"><Users size={18} /><p className="text-sm font-black">Profils trouvés</p></div><p className="mt-3 text-2xl font-black text-emerald-900">{results.length}</p><p className="mt-1 text-xs font-semibold text-emerald-900/60">{completeProfiles} profils bien renseignés</p></div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4"><div className="flex items-center gap-2 text-amber-700"><Tags size={18} /><p className="text-sm font-black">Compétences</p></div><p className="mt-3 text-2xl font-black text-amber-900">{skills.length}</p><p className="mt-1 text-xs font-semibold text-amber-900/60">mots-clés dominants</p></div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4"><div className="flex items-center gap-2 text-neutral-700"><Handshake size={18} /><p className="text-sm font-black">Secteurs</p></div><p className="mt-3 text-2xl font-black text-neutral-900">{sectors.length}</p><p className="mt-1 text-xs font-semibold text-neutral-500">secteurs détectés</p></div>
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {[
                  { title: 'Top secteurs',    items: sectors, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
                  { title: 'Top compétences', items: skills,  cls: 'bg-amber-50  text-amber-700  ring-amber-100'  },
                  { title: 'Top domaines',    items: domains, cls: 'bg-violet-50 text-violet-700 ring-violet-100' },
                ].map(block => (
                  <div key={block.title} className="rounded-2xl border border-neutral-100 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">{block.title}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {block.items.map(([label, count]) => <span key={label} className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${block.cls}`}>{label} · {count}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {trimmed.length < 2 && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center">
              <Handshake size={34} className="mb-3 text-neutral-200" />
              <p className="text-sm font-black text-neutral-500">Tapez au moins 2 caractères.</p>
              <p className="mt-1 max-w-md text-xs leading-6 text-neutral-400">Essayez un secteur, une compétence ou un domaine comme finance, React, marketing ou data.</p>
            </div>
          )}
          {trimmed.length >= 2 && query.isLoading && (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-neutral-100 py-10 text-sm font-bold text-neutral-400">
              <Loader2 size={16} className="animate-spin" /> Recherche en cours…
            </div>
          )}
          {trimmed.length >= 2 && !query.isLoading && results.length === 0 && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center">
              <Users size={34} className="mb-3 text-neutral-200" />
              <p className="text-sm font-black text-neutral-500">Aucun profil trouvé.</p>
              <p className="mt-1 max-w-md text-xs leading-6 text-neutral-400">Essayez un mot-clé plus large ou un autre secteur.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {results.map(member => (
                <MemberNetworkingCard
                  key={member._id}
                  member={member}
                  onOpen={setSelectedMember}
                  onAddToDirectory={setAddModal}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Mon répertoire ──────────────────────────────────── */}
      {tab === 'mon-repertoire' && (
        <MonRepertoireSection onViewCompetences={() => setTab('competences')} />
      )}

      {selectedMember && <MemberProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
      {addModal        && <AddToDirectoryModal member={addModal} onClose={() => setAddModal(null)} />}
    </div>
  );
}

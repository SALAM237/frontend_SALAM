'use client';

import { useState, useMemo } from 'react';
import { useUnreadByHref, useMarkHrefRead } from '@/lib/api/notifications';
import { UnreadCorner } from '@/components/ui/UnreadCorner';
import Link from 'next/link';
import { CalendarDays, ImagePlus, Plus, X, MapPin, Users, Loader2, Trash2, Edit3, PlusCircle, Send, Eye, Tag, CheckCircle2, XCircle, HelpCircle, Clock, ChevronDown } from 'lucide-react';
import {
  useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity, useActivityInvitations, useRemindActivityInvitations,
  useUploadActivityImage,
  ACTIVITY_CATEGORIES, type ActivityDoc,
} from '@/lib/api/activities';
import { useAdminMembers } from '@/lib/api/members';
import { useInvoiceClients } from '@/lib/api/invoices';
import { useBureauMembers, useAdminGroups } from '@/lib/api/groups';
import { MemberFilterPanel, EMPTY_MEMBER_FILTERS, memberMatchesFilters, type MemberFilters } from '@/components/admin/MemberFilterPanel';
import { DesignEditorField, type DesignStyle } from '@/components/admin/DesignEditorField';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

type ExtraBlock    = { id: string; label: string; title: string; description: string };
type ProgramStep   = { id: string; time: string; title: string };
type GuestMode = 'none' | 'member' | 'bureau' | 'client' | 'external' | 'group';
type ExternalGuest = { id: string; firstName: string; lastName: string; email: string; phone: string };

const sCfg: Record<string, { label: string; cls: string }> = {
  published: { label: 'Publiée',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  draft:     { label: 'Brouillon', cls: 'bg-yellow-50  text-yellow-700  border-yellow-200'  },
  finished:  { label: 'Passée',    cls: 'bg-neutral-50 text-neutral-500 border-neutral-200' },
  cancelled: { label: 'Annulée',   cls: 'bg-red-50     text-red-600     border-red-200'     },
};

const visiLabels: Record<string, string> = { public: 'Public', members: 'Membres', office: 'Bureau' };

/* ─── Activity Form (shared between Create & Edit) ────────── */
function ActivityForm({
  initial, onSubmit, onClose, isPending, title,
}: {
  initial?: Partial<ActivityDoc>;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isPending: boolean;
  title: string;
}) {
  const [f, setF] = useState({
    title:            initial?.title            ?? '',
    category:         initial?.category         ?? '',
    shortDescription: initial?.shortDescription ?? '',
    description:      initial?.description      ?? '',
    imageUrl:         initial?.imageUrl         ?? '',
    thumbnailUrl:     initial?.thumbnailUrl      ?? '',
    mediumUrl:        initial?.mediumUrl         ?? '',
    startDate:        initial?.startDate   ? new Date(initial.startDate).toISOString().slice(0, 16) : '',
    endDate:          initial?.endDate     ? new Date(initial.endDate).toISOString().slice(0, 16)   : '',
    city:             initial?.city             ?? '',
    venue:            initial?.venue            ?? '',
    location:         initial?.location         ?? '',
    capacity:         initial?.capacity    ? String(initial.capacity) : '',
    price:            initial?.price !== undefined ? String(initial.price) : '0',
    practicalInfo:    initial?.practicalInfo    ?? '',
    contactEmail:     initial?.contactEmail     ?? '',
    contactPhone:     initial?.contactPhone     ?? '',
    visibility:       initial?.visibility       ?? 'public',
    status:           initial?.status           ?? 'draft',
  });
  const uploadImage = useUploadActivityImage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeDesign, setActiveDesign] = useState<string | null>(null);
  const [styles, setStyles] = useState<Record<string, DesignStyle>>({});
  const [extraBlocks, setExtraBlocks] = useState<ExtraBlock[]>([]);
  const [program, setProgram] = useState<ProgramStep[]>(
    initial?.program?.map(s => ({ id: `step-${Math.random()}`, ...s })) ?? []
  );
  const [guestMode, setGuestMode] = useState<GuestMode>('none');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [externalGuests, setExternalGuests] = useState<ExternalGuest[]>([{ id: 'guest-initial', firstName: '', lastName: '', email: '', phone: '' }]);
  const [rsvpMode, setRsvpMode] = useState<'required' | 'optional'>('optional');
  const [rsvpDeadline, setRsvpDeadline] = useState('');
  const [selectedGroupId,    setSelectedGroupId]    = useState<string | null>(null);
  const [memberFilters, setMemberFilters] = useState<MemberFilters>(EMPTY_MEMBER_FILTERS);
  const membersQuery = useAdminMembers({ limit: 500 });
  const clientsQuery = useInvoiceClients();
  const bureauQuery  = useBureauMembers();
  const groupsQuery  = useAdminGroups();
  const members      = membersQuery.data?.data?.data ?? [];
  const clients      = clientsQuery.data?.data ?? [];
  const bureauMembers = bureauQuery.data?.data ?? [];
  const groups        = groupsQuery.data?.data ?? [];

  /* ── Invitations existantes pour cette activité (edit uniquement) ── */
  const existingInvitQuery = useActivityInvitations(initial?._id);
  const existingInvitations = existingInvitQuery.data?.data?.invitations ?? [];
  const alreadyInvitedMemberIds = useMemo(() => {
    const ids = new Set<string>();
    existingInvitations.forEach(inv => {
      if (inv.guestType !== 'member') return;
      const mid = typeof inv.memberId === 'string'
        ? inv.memberId
        : (inv.memberId as { _id?: string } | undefined)?._id;
      if (mid) ids.add(mid);
    });
    return ids;
  }, [existingInvitations]);

  /* Listes filtrées — membres non encore invités */
  const availableMembers         = members.filter(m => !alreadyInvitedMemberIds.has(m._id) && memberMatchesFilters(m, memberFilters));
  const availableBureauMembers   = bureauMembers.filter(b => !alreadyInvitedMemberIds.has(b._id));
  const availableNonBureauMembers = members.filter(
    m => !bureauMembers.some(b => b._id === m._id) && !alreadyInvitedMemberIds.has(m._id),
  );

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

  const handleImageFile = (file?: File | null) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setF(p => ({ ...p, imageUrl: preview }));
    uploadImage.mutate(file, {
      onSuccess: res => {
        const img = res.data;
        setF(p => ({
          ...p,
          imageUrl:    img.mediumUrl  || img.imageUrl,
          thumbnailUrl: img.thumbnailUrl || '',
          mediumUrl:    img.mediumUrl    || '',
        }));
        URL.revokeObjectURL(preview);
      },
      onError: () => URL.revokeObjectURL(preview),
    });
  };

  const toggleId = (id: string, values: string[], setValues: (value: string[]) => void) => setValues(values.includes(id) ? values.filter(item => item !== id) : [...values, id]);
  const setAll = (ids: string[], values: string[], setValues: (value: string[]) => void) => setValues(ids.length > 0 && values.length === ids.length ? [] : ids);

  const inp = (err?: string) =>
    `w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 placeholder:text-neutral-300 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!f.title.trim()) e.title = 'Titre requis';
    if (!f.category)     e.category = 'Catégorie requise';
    setErrors(e);
    if (Object.keys(e).length) return;
    const extraDescription = extraBlocks
      .filter(block => block.title.trim() || block.description.trim())
      .map(block => [block.label, block.title, block.description].filter(Boolean).join('\n'))
      .join('\n\n');
    onSubmit({
      title: f.title,
      category: f.category,
      shortDescription: f.shortDescription || undefined,
      description: [f.description, extraDescription].filter(Boolean).join('\n\n') || undefined,
      imageUrl:     f.imageUrl     || undefined,
      thumbnailUrl: f.thumbnailUrl || undefined,
      mediumUrl:    f.mediumUrl    || undefined,
      startDate: f.startDate || undefined, endDate: f.endDate || undefined,
      city: f.city || undefined,
      venue: f.venue || undefined,
      location: f.venue || f.location || undefined,
      capacity: f.capacity ? Number(f.capacity) : undefined,
      price: f.price !== '' ? Number(f.price) : 0,
      program: program.filter(s => s.time.trim() || s.title.trim()).map(({ time, title }) => ({ time, title })),
      practicalInfo: f.practicalInfo || undefined,
      contactEmail: f.contactEmail || undefined,
      contactPhone: f.contactPhone || undefined,
      visibility: f.visibility, status: f.status,
      invitations: {
        guestMode,
        memberIds: guestMode === 'member'
          ? selectedMemberIds
          : guestMode === 'bureau'
            ? [...bureauMembers.map(b => b._id), ...selectedMemberIds]
            : guestMode === 'group' && selectedGroupId
              ? (groups.find(g => g._id === selectedGroupId)?.memberIds ?? [])
              : [],
        clientIds: guestMode === 'client' ? selectedClientIds : [],
        externalGuests: guestMode === 'external' ? externalGuests.filter(g => g.email.trim() || g.phone.trim()).map(({ firstName, lastName, email, phone }) => ({ firstName, lastName, email, phone })) : [],
        rsvpRequired: rsvpMode === 'required',
        rsvpDeadline: rsvpDeadline || undefined,
        sendInvitations: true,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-emerald-50/40 px-6 py-4 shrink-0">
          <h3 className="font-black text-neutral-900">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" onClick={() => setActiveDesign(null)}>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <DesignEditorField id="title" label="Titre" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>{style => <RichTextEditor value={f.title} onChange={value => setF(p => ({ ...p, title: value }))} className={inp(errors.title)} style={style} placeholder="Titre de l'activité" multiline={false} />}</DesignEditorField>
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Catégorie <span className="text-red-500">*</span></label>
            <select value={f.category} onChange={upd('category')} className={inp(errors.category)}>
              <option value="">Choisir…</option>
              {ACTIVITY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.category && <p className="text-[11px] text-red-500">{errors.category}</p>}
          </div>
          {/* Description courte */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description courte <span className="font-normal normal-case text-neutral-400">(carte)</span></label>
            <input value={f.shortDescription} onChange={upd('shortDescription')} placeholder="Une phrase d'accroche pour la carte" className={inp()} />
          </div>

          {/* Image de la carte */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Image de la carte</label>
            <div className="grid gap-3 sm:grid-cols-[112px_1fr]">
              <div className="flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                {f.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus size={24} className="text-neutral-300" />
                )}
              </div>
              <div className="space-y-2">
                <input value={f.imageUrl} onChange={upd('imageUrl')} placeholder="URL de l'image ou importer ci-dessous" className={inp()} />
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
                  {uploadImage.isPending ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />} Importer une image
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageFile(e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>

          {/* À propos */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">À propos de l'activité</label>
            <DesignEditorField id="description" label="À propos" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>{style => <RichTextEditor value={f.description} onChange={value => setF(p => ({ ...p, description: value }))} className="min-h-[96px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" style={style} placeholder="Description complète, contexte, objectifs…" />}</DesignEditorField>
          </div>

          {/* Date + Horaire */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date de début <span className="text-red-500">*</span></label>
              <DesignEditorField id="startDate" label="Date début" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                {style => <input type="datetime-local" value={f.startDate} onChange={upd('startDate')} className={inp()} style={style} />}
              </DesignEditorField>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date de fin</label>
              <DesignEditorField id="endDate" label="Date fin" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                {style => <input type="datetime-local" value={f.endDate} onChange={upd('endDate')} className={inp()} style={style} />}
              </DesignEditorField>
            </div>
          </div>

          {/* Ville + Venue */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Ville</label>
              <input value={f.city} onChange={upd('city')} placeholder="Yaoundé" className={inp()} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Lieu / venue</label>
              <input value={f.venue} onChange={upd('venue')} placeholder="Stade Omnisports" className={inp()} />
            </div>
          </div>

          {/* Capacité + Tarif */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Capacité totale</label>
              <DesignEditorField id="capacity" label="Capacité" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                {style => <input type="number" min="1" value={f.capacity} onChange={upd('capacity')} placeholder="50" className={inp()} style={style} />}
              </DesignEditorField>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                Tarif (€) <span className="font-normal normal-case text-neutral-400">0 = gratuit</span>
              </label>
              <input type="number" min="0" step="0.5" value={f.price} onChange={upd('price')} placeholder="0" className={inp()} />
            </div>
          </div>

          {/* Programme */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Programme</label>
              <button type="button"
                onClick={() => setProgram(p => [...p, { id: `step-${Date.now()}`, time: '', title: '' }])}
                className="inline-flex h-7 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-black text-emerald-700 hover:bg-emerald-100">
                <PlusCircle size={12} /> Ajouter une étape
              </button>
            </div>
            {program.length === 0 && (
              <p className="rounded-xl border border-dashed border-neutral-200 py-3 text-center text-xs text-neutral-400">Aucune étape — cliquez sur Ajouter</p>
            )}
            <div className="space-y-2">
              {program.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                  <input value={step.time} onChange={e => setProgram(p => p.map(s => s.id === step.id ? { ...s, time: e.target.value } : s))}
                    placeholder="10:00" className="w-20 shrink-0 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
                  <input value={step.title} onChange={e => setProgram(p => p.map(s => s.id === step.id ? { ...s, title: e.target.value } : s))}
                    placeholder={`Étape ${i + 1}`} className={`flex-1 ${inp()}`} />
                  <button type="button" onClick={() => setProgram(p => p.filter(s => s.id !== step.id))}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-400 hover:border-red-300 hover:text-red-600">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Infos pratiques */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Infos pratiques</label>
            <textarea value={f.practicalInfo} onChange={upd('practicalInfo')}
              placeholder="Accès, parking, restauration, équipement à prévoir…"
              rows={3} className={`${inp()} resize-none`} />
          </div>

          {/* Contacts */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Email contact</label>
              <input type="email" value={f.contactEmail} onChange={upd('contactEmail')} placeholder="contact@salam.org" className={inp()} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Téléphone contact</label>
              <input type="tel" value={f.contactPhone} onChange={upd('contactPhone')} placeholder="+237 6 00 00 00 00" className={inp()} />
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-700 bg-emerald-700 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-white">Invité(s)</p>
                <p className="text-[11px] text-white/70">Sélectionnez les personnes à inviter et le niveau de confirmation attendu.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[11px] font-black text-white">
                <input type="checkbox" checked={rsvpMode === 'required'} onChange={e => setRsvpMode(e.target.checked ? 'required' : 'optional')} /> Présence obligatoire
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-[0.12em] text-white/80">Type d'invité</label>
                <select value={guestMode} onChange={e => { setGuestMode(e.target.value as GuestMode); setSelectedGroupId(null); setSelectedMemberIds([]); }} className={inp()}>
                  <option value="none">Aucun invité ciblé</option>
                  <option value="member">Membre</option>
                  <option value="bureau">Bureau exécutif</option>
                  <option value="client">Clients externes</option>
                  <option value="external">Non membre</option>
                  <option value="group">Groupe SALAM</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-[0.12em] text-white/80">Date limite de confirmation</label>
                <input type="datetime-local" value={rsvpDeadline} onChange={e => setRsvpDeadline(e.target.value)} className={inp()} />
              </div>
            </div>
            {guestMode === 'member' && (
              <div className="mt-3 space-y-2">
                <MemberFilterPanel filters={memberFilters} onChange={setMemberFilters} />
                <GuestChecklist
                  title={`Membres${alreadyInvitedMemberIds.size > 0 ? ` (${alreadyInvitedMemberIds.size} déjà invité${alreadyInvitedMemberIds.size > 1 ? 's' : ''})` : ''}`}
                  items={availableMembers.map(m => ({ id: m._id, label: `${m.firstName} ${m.lastName}`, detail: m.email }))}
                  selected={selectedMemberIds}
                  onToggle={id => toggleId(id, selectedMemberIds, setSelectedMemberIds)}
                  onToggleAll={() => setAll(availableMembers.map(m => m._id), selectedMemberIds, setSelectedMemberIds)}
                />
              </div>
            )}
            {guestMode === 'bureau' && (
              <div className="mt-3 space-y-2">
                {availableBureauMembers.length === 0 ? (
                  <p className="py-3 text-xs text-white/60">
                    {bureauMembers.length === 0 ? 'Aucun membre du bureau trouvé.' : 'Tous les membres du bureau ont déjà été invités.'}
                  </p>
                ) : (
                  <GuestChecklist
                    title={`Bureau exécutif (${availableBureauMembers.length} membre${availableBureauMembers.length > 1 ? 's' : ''}${bureauMembers.length > availableBureauMembers.length ? `, ${bureauMembers.length - availableBureauMembers.length} déjà invité${bureauMembers.length - availableBureauMembers.length > 1 ? 's' : ''}` : ''})`}
                    items={availableBureauMembers.map(b => ({ id: b._id, label: `${b.firstName} ${b.lastName}`, detail: b.bureauPoste ?? b.email }))}
                    selected={availableBureauMembers.map(b => b._id)}
                    onToggle={() => {}}
                    onToggleAll={() => {}}
                    readOnly
                  />
                )}
                <div className="mt-2">
                  <p className="mb-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-white/80">+ Invités supplémentaires</p>
                  <GuestChecklist
                    title="Autres membres à ajouter"
                    items={availableNonBureauMembers.map(m => ({ id: m._id, label: `${m.firstName} ${m.lastName}`, detail: m.email }))}
                    selected={selectedMemberIds}
                    onToggle={id => toggleId(id, selectedMemberIds, setSelectedMemberIds)}
                    onToggleAll={() => {}}
                  />
                </div>
              </div>
            )}
            {guestMode === 'group' && (
              <div className="mt-3 space-y-2">
                <select
                  value={selectedGroupId ?? ''}
                  onChange={e => setSelectedGroupId(e.target.value || null)}
                  className={inp()}>
                  <option value="">— Choisir un groupe —</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>{g.name} ({g.memberIds.length} membres)</option>
                  ))}
                </select>
                {selectedGroupId && (() => {
                  const g = groups.find(gr => gr._id === selectedGroupId);
                  const gMembers = g?.members ?? [];
                  const availableGMembers = gMembers.filter(m => !alreadyInvitedMemberIds.has(m._id));
                  const alreadyCount = gMembers.length - availableGMembers.length;
                  return availableGMembers.length > 0 ? (
                    <GuestChecklist
                      title={`Membres du groupe "${g?.name}"${alreadyCount > 0 ? ` (${alreadyCount} déjà invité${alreadyCount > 1 ? 's' : ''})` : ''}`}
                      items={availableGMembers.map(m => ({ id: m._id, label: `${m.firstName} ${m.lastName}`, detail: m.activitySector ?? m.email }))}
                      selected={availableGMembers.map(m => m._id)}
                      onToggle={() => {}}
                      onToggleAll={() => {}}
                      readOnly
                    />
                  ) : (
                    <p className="py-2 text-xs text-white/60">
                      {gMembers.length === 0 ? 'Aucun membre dans ce groupe.' : 'Tous les membres de ce groupe ont déjà été invités.'}
                    </p>
                  );
                })()}
              </div>
            )}
            {guestMode === 'client' && (
              <GuestChecklist
                title="Clients externes"
                items={clients.map(c => ({ id: c._id, label: c.name, detail: c.email || c.phone || 'Coordonnées non renseignées' }))}
                selected={selectedClientIds}
                onToggle={id => toggleId(id, selectedClientIds, setSelectedClientIds)}
                onToggleAll={() => setAll(clients.map(c => c._id), selectedClientIds, setSelectedClientIds)}
              />
            )}
            {guestMode === 'external' && (
              <div className="mt-3 space-y-2">
                {externalGuests.map((guest, index) => (
                  <div key={guest.id} className="grid gap-2 rounded-2xl border border-neutral-200 bg-white p-3 sm:grid-cols-2">
                    <input value={guest.firstName} onChange={e => setExternalGuests(prev => prev.map(g => g.id === guest.id ? { ...g, firstName: e.target.value } : g))} placeholder="Prénom" className={inp()} />
                    <input value={guest.lastName} onChange={e => setExternalGuests(prev => prev.map(g => g.id === guest.id ? { ...g, lastName: e.target.value } : g))} placeholder="Nom" className={inp()} />
                    <input value={guest.email} onChange={e => setExternalGuests(prev => prev.map(g => g.id === guest.id ? { ...g, email: e.target.value } : g))} placeholder="Email" type="email" className={inp()} />
                    <input value={guest.phone} onChange={e => setExternalGuests(prev => prev.map(g => g.id === guest.id ? { ...g, phone: e.target.value } : g))} placeholder="Téléphone" className={inp()} />
                    {externalGuests.length > 1 && <button type="button" onClick={() => setExternalGuests(prev => prev.filter(g => g.id !== guest.id))} className="text-left text-xs font-black text-red-500">Retirer l'invité {index + 1}</button>}
                  </div>
                ))}
                <button type="button" onClick={() => setExternalGuests(prev => [...prev, { id: `guest-${Date.now()}`, firstName: '', lastName: '', email: '', phone: '' }])} className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-black text-emerald-700">Ajouter un non membre</button>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Blocs libres</p>
                <p className="text-[11px] text-neutral-500">Ajoutez des éléments de contenu à déplacer et styliser.</p>
              </div>
              <button type="button" onClick={() => setExtraBlocks(prev => [...prev, { id: `activity-extra-${Date.now()}`, label: `Bloc ${prev.length + 1}`, title: '', description: '' }])}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white">
                <PlusCircle size={13} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {extraBlocks.map(block => (
                <DesignEditorField key={block.id} id={block.id} label={block.label} styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                  {style => (
                    <div className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <input
                          value={block.label}
                          onChange={e => setExtraBlocks(prev => prev.map(b => b.id === block.id ? { ...b, label: e.target.value } : b))}
                          placeholder="Libellé du bloc"
                          className="h-8 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-xs font-black uppercase tracking-[0.1em] text-neutral-500 outline-none focus:border-emerald-400"
                        />
                        <button type="button" onClick={() => setExtraBlocks(prev => prev.filter(b => b.id !== block.id))} className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 text-red-400 hover:border-red-300 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{block.label || 'Titre du bloc'}</label>
                        <RichTextEditor value={block.title} onChange={value => setExtraBlocks(prev => prev.map(b => b.id === block.id ? { ...b, title: value } : b))} placeholder="Titre" className={inp()} style={style} multiline={false} />
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description</label>
                        <RichTextEditor value={block.description} onChange={value => setExtraBlocks(prev => prev.map(b => b.id === block.id ? { ...b, description: value } : b))} placeholder="Description détaillée" className="min-h-[112px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" style={style} />
                      </div>
                    </div>
                  )}
                </DesignEditorField>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Visibilité</label>
              <select value={f.visibility} onChange={upd('visibility')} className={inp()}>
                <option value="public">Public</option>
                <option value="members">Membres uniquement</option>
                <option value="office">Bureau seulement</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Statut</label>
              <select value={f.status} onChange={upd('status')} className={inp()}>
                <option value="draft">Brouillon</option>
                <option value="published">Publiée</option>
                <option value="finished">Passée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:border-neutral-300 transition">Annuler</button>
          <button onClick={handleSubmit} disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60 transition">
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <CalendarDays size={14} />}
            {initial ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit wrapper ────────────────────────────────────────── */


const PRESENCE_CFG = {
  present: {
    label: 'Présents',
    icon: CheckCircle2,
    hdr: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ico: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  unsure: {
    label: 'Peut-être',
    icon: HelpCircle,
    hdr: 'bg-amber-50 text-amber-700 border-amber-200',
    ico: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  absent: {
    label: 'Absents',
    icon: XCircle,
    hdr: 'bg-red-50 text-red-700 border-red-200',
    ico: 'text-red-500',
    badge: 'bg-red-100 text-red-600',
  },
  pending: {
    label: 'En attente',
    icon: Clock,
    hdr: 'bg-blue-50 text-blue-700 border-blue-200',
    ico: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
} as const;

function PresenceModal({ activity, onClose }: { activity: ActivityDoc; onClose: () => void }) {
  const { data, isLoading } = useActivityInvitations(activity._id);
  const invitations = data?.data?.invitations ?? [];
  const [open, setOpen] = useState<Record<string, boolean>>({ present: true, unsure: true, absent: true, pending: true });

  const guestName = (inv: any) => {
    if (inv.memberId && typeof inv.memberId === 'object') return `${inv.memberId.firstName ?? ''} ${inv.memberId.lastName ?? ''}`.trim();
    if (inv.clientId && typeof inv.clientId === 'object') return inv.clientId.name;
    return inv.name || `${inv.externalGuest?.firstName ?? ''} ${inv.externalGuest?.lastName ?? ''}`.trim() || inv.email || 'Invité';
  };

  const toggle = (s: string) => setOpen(o => ({ ...o, [s]: !o[s] }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-emerald-50/40 px-5 py-4 shrink-0">
          <div>
            <p className="text-sm font-black text-neutral-900">Présences — {activity.title}</p>
            <p className="text-xs text-neutral-400">Réponses et QR codes liés à cette activité.</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>

        <div className="max-h-[74vh] overflow-y-auto p-4 space-y-3">
          {isLoading && <p className="py-10 text-center text-sm text-neutral-400">Chargement…</p>}
          {!isLoading && invitations.length === 0 && (
            <p className="py-10 text-center text-sm font-semibold text-neutral-400">Aucune invitation enregistrée.</p>
          )}

          {!isLoading && (['present', 'unsure', 'absent', 'pending'] as const).map(status => {
            const rows = invitations.filter(inv => inv.rsvpStatus === status);
            const cfg = PRESENCE_CFG[status];
            const Icon = cfg.icon;
            const isOpen = open[status];

            return (
              <div key={status} className={`overflow-hidden rounded-2xl border ${cfg.hdr}`}>
                {/* Header accordéon */}
                <button
                  type="button"
                  onClick={() => toggle(status)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 transition-colors hover:opacity-80 ${cfg.hdr}`}
                >
                  <span className="flex items-center gap-2 text-sm font-black">
                    <Icon size={15} className={cfg.ico} />
                    {cfg.label}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${cfg.badge}`}>{rows.length}</span>
                  </span>
                  <ChevronDown size={15} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Contenu déroulant */}
                {isOpen && (
                  <div className="divide-y divide-neutral-100 bg-white">
                    {rows.length === 0 ? (
                      <p className="px-4 py-4 text-center text-xs font-semibold text-neutral-400">Aucun invité dans cette catégorie.</p>
                    ) : (
                      rows.map(inv => {
                        const scannerName = inv.scannedBy && typeof inv.scannedBy === 'object'
                          ? `${inv.scannedBy.firstName ?? ''} ${inv.scannedBy.lastName ?? ''}`.trim()
                          : null;
                        const scanDate = inv.scannedAt
                          ? new Date(inv.scannedAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : null;

                        return (
                          <div key={inv._id} className="flex flex-wrap items-start gap-3 px-4 py-3 text-xs sm:flex-nowrap">
                            {/* Avatar initiales */}
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${cfg.badge}`}>
                              {guestName(inv).slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-black text-neutral-800 truncate">{guestName(inv)}</p>
                              <p className="mt-0.5 text-neutral-400 truncate">
                                {inv.guestType} · {inv.email || inv.phone || 'contact non renseigné'}
                              </p>
                              {inv.shortCode && (
                                <p className="mt-1 font-mono text-[11px] font-black text-emerald-700">
                                  Code {inv.shortCode} · {inv.scanStatus ?? 'unused'}
                                </p>
                              )}
                              {scanDate && (
                                <p className="mt-1 text-[11px] text-neutral-500">
                                  Scanné le {scanDate}
                                  {scannerName ? ` · par ${scannerName}` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function normalizeGuestSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function GuestChecklist({ title, items, selected, onToggle, onToggleAll, readOnly = false }: { title: string; items: { id: string; label: string; detail?: string }[]; selected: string[]; onToggle: (id: string) => void; onToggleAll: () => void; readOnly?: boolean }) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => {
    const q = normalizeGuestSearch(search.trim());
    if (!q) return items;
    return items.filter(item => normalizeGuestSearch(`${item.label} ${item.detail ?? ''}`).includes(q));
  }, [items, search]);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-3 py-2">
        <p className="text-xs font-black text-neutral-700">{title}</p>
        {!readOnly && <label className="inline-flex items-center gap-2 text-[11px] font-black text-emerald-700"><input type="checkbox" checked={items.length > 0 && selected.length === items.length} onChange={onToggleAll} /> Tout</label>}
        {readOnly && <span className="text-[11px] font-black text-emerald-700">{items.length} invités</span>}
      </div>
      {items.length > 5 && (
        <div className="border-b border-neutral-100 px-3 py-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un nom, un email…"
            className="h-8 w-full rounded-lg border border-neutral-200 px-2.5 text-xs outline-none focus:border-emerald-400"
          />
        </div>
      )}
      <div className="max-h-72 overflow-y-auto divide-y divide-neutral-50">
        {items.length === 0 && <p className="px-3 py-6 text-center text-xs font-semibold text-neutral-400">Aucun element disponible.</p>}
        {items.length > 0 && filteredItems.length === 0 && <p className="px-3 py-6 text-center text-xs font-semibold text-neutral-400">Aucun résultat pour cette recherche.</p>}
        {filteredItems.map(item => (
          <label key={item.id} className={`flex items-center gap-3 px-3 py-2.5 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-emerald-50/40'}`}>
            <input type="checkbox" checked={readOnly ? true : selected.includes(item.id)} onChange={() => !readOnly && onToggle(item.id)} disabled={readOnly} />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-neutral-800">{item.label}</span>{item.detail && <span className="block truncate text-[11px] text-neutral-400">{item.detail}</span>}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
function EditActivityModal({ activity, onClose }: { activity: ActivityDoc; onClose: () => void }) {
  const update = useUpdateActivity(activity._id);
  return (
    <ActivityForm
      title="Modifier l'activité"
      initial={activity}
      isPending={update.isPending}
      onClose={onClose}
      onSubmit={data => update.mutate(data, { onSuccess: onClose })}
    />
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminActivitesPage() {
  const [filter,      setFilter]      = useState<string>('all');
  const [showCreate,  setShowCreate]  = useState(false);
  const [editTarget,  setEditTarget]  = useState<ActivityDoc | null>(null);
  const [presenceTarget, setPresenceTarget] = useState<ActivityDoc | null>(null);

  const { data, isLoading } = useActivities({ status: filter === 'all' ? undefined : filter });
  const deleteActivity = useDeleteActivity();
  const createActivity = useCreateActivity();
  const remindInvitations = useRemindActivityInvitations();

  const activities   = data?.data?.activities ?? [];
  const unreadHrefs  = useUnreadByHref('admin');
  const markHrefRead = useMarkHrefRead('admin');
  const stats = {
    published: activities.filter(a => a.status === 'published').length,
    draft:     activities.filter(a => a.status === 'draft').length,
    finished:  activities.filter(a => a.status === 'finished').length,
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ?? Cette action est irréversible.`)) return;
    deleteActivity.mutate(id);
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Activités</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{isLoading ? '…' : `${activities.length} activité${activities.length > 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus size={14} /><span className="hidden sm:inline">Nouvelle activité</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Publiées',   value: stats.published, color: 'text-emerald-700' },
          { label: 'Brouillons', value: stats.draft,     color: 'text-yellow-700'  },
          { label: 'Passées',    value: stats.finished,  color: 'text-neutral-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-neutral-100 bg-white p-3 text-center shadow-sm sm:p-4">
            <p className={`text-2xl font-black leading-none tracking-[-0.04em] sm:text-3xl ${color}`}>{isLoading ? '…' : value}</p>
            <p className="mt-1 text-[10px] font-semibold text-neutral-500 sm:text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'published', 'draft', 'finished'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-8 rounded-full border px-3 text-xs font-bold transition-all sm:px-4 ${filter === f ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'}`}>
            {f === 'all' ? 'Toutes' : sCfg[f]?.label ?? f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {isLoading && (
          <div className="flex flex-col items-center py-14 text-center">
            <Loader2 size={24} className="animate-spin text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-400">Chargement…</p>
          </div>
        )}
        {!isLoading && activities.length === 0 && (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <CalendarDays size={32} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">Aucune activité pour le moment.</p>
          </div>
        )}
        {!isLoading && activities.length > 0 && (
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((a: ActivityDoc) => {
              const cfg        = sCfg[a.status] ?? sCfg.draft;
              const catLabel   = ACTIVITY_CATEGORIES.find(c => c.value === a.category)?.label ?? a.category;
              const hasSummary = a.invitationSummary && a.invitationSummary.total > 0;
              const actHref    = `/activites/${a.slug}`;
              const isUnread   = [...unreadHrefs].some(h => h.includes(a.slug ?? a._id));
              return (
                <article key={a._id} className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  {isUnread && <UnreadCorner />}
                  {/* Bannière catégorie */}
                  <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
                    {a.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.thumbnailUrl || a.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <CalendarDays size={48} className="text-white/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wide ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                        <Tag size={9} /> {catLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                        {visiLabels[a.visibility]}
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex flex-col gap-3 p-4">
                    {/* Titre */}
                    <div>
                      <h3 className="text-sm font-black leading-snug text-neutral-900 line-clamp-2">{a.title}</h3>
                      {a.description && (
                        <p className="mt-1 whitespace-pre-line break-words text-xs leading-5 text-neutral-500 line-clamp-2">{a.description}</p>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-neutral-400">
                      {a.location && <span className="flex items-center gap-1"><MapPin size={11} /> {a.location}</span>}
                      {a.capacity && <span className="flex items-center gap-1"><Users size={11} /> {a.capacity} places</span>}
                      {a.startDate && (
                        <span className="flex items-center gap-1" title="Heure du Cameroun">
                          <CalendarDays size={11} />
                          {new Date(a.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        </span>
                      )}
                    </div>

                    {/* Résumé présences */}
                    {hasSummary && (
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-black">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">✓ {a.invitationSummary!.present}</span>
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">? {a.invitationSummary!.unsure}</span>
                        <span className="rounded-full bg-red-50 px-2 py-1 text-red-600">✗ {a.invitationSummary!.absent}</span>
                        <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-500">⊙ {a.invitationSummary!.scanned}</span>
                      </div>
                    )}

                    {/* Séparateur */}
                    <div className="border-t border-neutral-100" />

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <Link href={actHref} target="_blank" rel="noopener noreferrer"
                        onClick={() => markHrefRead(actHref)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700"
                        title="Voir l'activité">
                        <Eye size={11} />
                      </Link>
                      <button onClick={() => setPresenceTarget(a)}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-emerald-100 px-2 text-[11px] font-black text-emerald-700 transition hover:bg-emerald-50 whitespace-nowrap">
                        <Users size={11} /> Présences
                      </button>
                      <button onClick={() => remindInvitations.mutate({ activityId: a._id })}
                        disabled={remindInvitations.isPending || !hasSummary || (a.invitationSummary!.pending + a.invitationSummary!.unsure) === 0}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-amber-300 text-amber-500 transition hover:border-amber-500 hover:bg-amber-50 disabled:opacity-40"
                        title="Relancer">
                        <Send size={11} />
                      </button>
                      <button onClick={() => setEditTarget(a)}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-neutral-200 px-2 text-[11px] font-black text-neutral-600 transition hover:border-blue-300 hover:text-blue-700 whitespace-nowrap">
                        <Edit3 size={11} /> Modifier
                      </button>
                      <button onClick={() => handleDelete(a._id, a.title)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        title="Supprimer">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <ActivityForm
          title="Nouvelle activité"
          isPending={createActivity.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={data => createActivity.mutate(data, { onSuccess: () => setShowCreate(false) })}
        />
      )}
      {editTarget && <EditActivityModal activity={editTarget} onClose={() => setEditTarget(null)} />}
      {presenceTarget && <PresenceModal activity={presenceTarget} onClose={() => setPresenceTarget(null)} />}
    </div>
  );
}

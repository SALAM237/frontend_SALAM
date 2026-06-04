'use client';

import { useState } from 'react';
import { CalendarDays, Plus, X, MapPin, Users, Loader2, Trash2, Edit3, PlusCircle } from 'lucide-react';
import {
  useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity,
  ACTIVITY_CATEGORIES, type ActivityDoc,
} from '@/lib/api/activities';
import { DesignEditorField, type DesignStyle } from '@/components/admin/DesignEditorField';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

type ExtraBlock = { id: string; label: string; title: string; description: string };

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
    title:       initial?.title       ?? '',
    category:    initial?.category    ?? '',
    description: initial?.description ?? '',
    startDate:   initial?.startDate   ? new Date(initial.startDate).toISOString().slice(0, 16) : '',
    endDate:     initial?.endDate     ? new Date(initial.endDate).toISOString().slice(0, 16)   : '',
    location:    initial?.location    ?? '',
    capacity:    initial?.capacity    ? String(initial.capacity) : '',
    visibility:  initial?.visibility  ?? 'public',
    status:      initial?.status      ?? 'draft',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeDesign, setActiveDesign] = useState<string | null>(null);
  const [styles, setStyles] = useState<Record<string, DesignStyle>>({});
  const [extraBlocks, setExtraBlocks] = useState<ExtraBlock[]>([]);

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

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
      description: [f.description, extraDescription].filter(Boolean).join('\n\n') || undefined,
      startDate: f.startDate || undefined, endDate: f.endDate || undefined,
      location: f.location || undefined,
      capacity: f.capacity ? Number(f.capacity) : undefined,
      visibility: f.visibility, status: f.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 shrink-0">
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
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description</label>
            <DesignEditorField id="description" label="Description" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>{style => <RichTextEditor value={f.description} onChange={value => setF(p => ({ ...p, description: value }))} className="min-h-[96px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" style={style} placeholder="Description" />}</DesignEditorField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date début</label>
              <DesignEditorField id="startDate" label="Date début" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                {style => <input type="datetime-local" value={f.startDate} onChange={upd('startDate')} className={inp()} style={style} />}
              </DesignEditorField>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date fin</label>
              <DesignEditorField id="endDate" label="Date fin" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                {style => <input type="datetime-local" value={f.endDate} onChange={upd('endDate')} className={inp()} style={style} />}
              </DesignEditorField>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Lieu</label>
              <DesignEditorField id="location" label="Lieu" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                {style => <input value={f.location} onChange={upd('location')} placeholder="Yaoundé" className={inp()} style={style} />}
              </DesignEditorField>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Capacité</label>
              <DesignEditorField id="capacity" label="Capacité" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                {style => <input type="number" min="1" value={f.capacity} onChange={upd('capacity')} placeholder="50" className={inp()} style={style} />}
              </DesignEditorField>
            </div>
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

  const { data, isLoading } = useActivities({ status: filter === 'all' ? undefined : filter });
  const deleteActivity = useDeleteActivity();
  const createActivity = useCreateActivity();

  const activities = data?.data?.activities ?? [];
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
          <div className="divide-y divide-neutral-50">
            {activities.map((a: ActivityDoc) => {
              const cfg      = sCfg[a.status] ?? sCfg.draft;
              const catLabel = ACTIVITY_CATEGORIES.find(c => c.value === a.category)?.label ?? a.category;
              return (
                <div key={a._id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                    <CalendarDays size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-sm text-neutral-900 truncate">{a.title}</p>
                      <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-600">{catLabel}</span>
                      {a.location  && <span className="flex items-center gap-1"><MapPin size={10} /> {a.location}</span>}
                      {a.capacity  && <span className="flex items-center gap-1"><Users size={10} /> {a.capacity} places</span>}
                    </div>
                    {a.startDate && (
                      <p className="mt-0.5 text-[11px] text-neutral-300">
                        {new Date(a.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="hidden text-[10px] font-semibold text-neutral-400 sm:inline">{visiLabels[a.visibility]}</span>
                    <button title="Modifier" onClick={() => setEditTarget(a)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:text-emerald-700">
                      <Edit3 size={12} />
                    </button>
                    <button title="Supprimer" onClick={() => handleDelete(a._id, a.title)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-300 transition hover:border-red-300 hover:text-red-600">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
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
    </div>
  );
}

'use client';

import { useState } from 'react';
import { CalendarDays, Edit3, Loader2, MapPin, Plus, Trash2, Users, X } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoActivities } from '@/data/demo/demo-activities';

type DemoActivity = {
  _id: string;
  title: string;
  category: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  visibility: 'public' | 'members' | 'office';
  status: 'published' | 'draft' | 'finished' | 'cancelled';
};

const sCfg: Record<DemoActivity['status'], { label: string; cls: string }> = {
  published: { label: 'Publiee', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  draft: { label: 'Brouillon', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  finished: { label: 'Passee', cls: 'bg-neutral-50 text-neutral-500 border-neutral-200' },
  cancelled: { label: 'Annulee', cls: 'bg-red-50 text-red-600 border-red-200' },
};

const ACTIVITY_CATEGORIES = [
  { value: 'solidarite', label: 'Solidarite' },
  { value: 'culture', label: 'Culture' },
  { value: 'education', label: 'Education' },
  { value: 'sport', label: 'Sport' },
];

const visiLabels: Record<DemoActivity['visibility'], string> = { public: 'Public', members: 'Membres', office: 'Bureau' };

function ActivityForm({ initial, onSubmit, onClose, title }: {
  initial?: Partial<DemoActivity>;
  onSubmit: (data: DemoActivity) => void;
  onClose: () => void;
  title: string;
}) {
  const [f, setF] = useState({
    title: initial?.title ?? '',
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    startDate: initial?.startDate ? new Date(initial.startDate).toISOString().slice(0, 16) : '',
    endDate: initial?.endDate ? new Date(initial.endDate).toISOString().slice(0, 16) : '',
    location: initial?.location ?? '',
    capacity: initial?.capacity ? String(initial.capacity) : '',
    visibility: initial?.visibility ?? 'public',
    status: initial?.status ?? 'draft',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const inp = (err?: string) => `w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 placeholder:text-neutral-300 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!f.title.trim()) e.title = 'Titre requis';
    if (!f.category) e.category = 'Categorie requise';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      _id: initial?._id ?? `demo-activity-${Date.now()}`,
      title: f.title,
      category: f.category,
      description: f.description || undefined,
      startDate: f.startDate || undefined,
      endDate: f.endDate || undefined,
      location: f.location || undefined,
      capacity: f.capacity ? Number(f.capacity) : undefined,
      visibility: f.visibility as DemoActivity['visibility'],
      status: f.status as DemoActivity['status'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h3 className="font-black text-neutral-900">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <input value={f.title} onChange={upd('title')} className={inp(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Categorie <span className="text-red-500">*</span></label>
            <select value={f.category} onChange={upd('category')} className={inp(errors.category)}>
              <option value="">Choisir...</option>
              {ACTIVITY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.category && <p className="text-[11px] text-red-500">{errors.category}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description</label>
            <textarea value={f.description} onChange={upd('description')} rows={3} className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date debut</label>
              <input type="datetime-local" value={f.startDate} onChange={upd('startDate')} className={inp()} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date fin</label>
              <input type="datetime-local" value={f.endDate} onChange={upd('endDate')} className={inp()} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Lieu</label>
              <input value={f.location} onChange={upd('location')} placeholder="Paris 12e" className={inp()} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Capacite</label>
              <input type="number" min="1" value={f.capacity} onChange={upd('capacity')} placeholder="50" className={inp()} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Visibilite</label>
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
                <option value="published">Publiee</option>
                <option value="finished">Passee</option>
                <option value="cancelled">Annulee</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={handleSubmit} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700">
            <CalendarDays size={14} />
            {initial ? 'Mettre a jour' : 'Creer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DemoAdminActivitiesPage() {
  const [filter, setFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<DemoActivity | null>(null);
  const [activities, setActivities] = useState<DemoActivity[]>(() => demoActivities.map((activity, index) => ({
    _id: activity.id,
    title: activity.title,
    category: activity.category,
    description: activity.description,
    startDate: `${activity.date}T10:00:00.000Z`,
    endDate: `${activity.date}T12:00:00.000Z`,
    location: activity.location,
    capacity: activity.participants + 20,
    visibility: index === 1 ? 'members' : 'public',
    status: activity.status === 'published' ? 'published' : 'draft',
  })));

  const filtered = activities.filter(a => filter === 'all' || a.status === filter);
  const stats = {
    published: activities.filter(a => a.status === 'published').length,
    draft: activities.filter(a => a.status === 'draft').length,
    finished: activities.filter(a => a.status === 'finished').length,
  };

  const upsertActivity = (activity: DemoActivity) => {
    setActivities(prev => prev.some(a => a._id === activity._id) ? prev.map(a => a._id === activity._id ? activity : a) : [activity, ...prev]);
    setShowCreate(false);
    setEditTarget(null);
  };

  return (
    <DemoPortalShell type="admin" title="Activites">
      <div className="w-full space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Activites</h1>
            <p className="mt-0.5 text-sm text-neutral-500">{filtered.length} activite{filtered.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-700">
            <Plus size={14} /><span className="hidden sm:inline">Nouvelle activite</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Publiees', value: stats.published, color: 'text-emerald-700' },
            { label: 'Brouillons', value: stats.draft, color: 'text-yellow-700' },
            { label: 'Passees', value: stats.finished, color: 'text-neutral-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-neutral-100 bg-white p-3 text-center shadow-sm sm:p-4">
              <p className={`text-2xl font-black leading-none tracking-[-0.04em] sm:text-3xl ${color}`}>{value}</p>
              <p className="mt-1 text-[10px] font-semibold text-neutral-500 sm:text-xs">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'published', 'draft', 'finished'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`h-8 rounded-full border px-3 text-xs font-bold transition-all sm:px-4 ${filter === f ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'}`}>
              {f === 'all' ? 'Toutes' : sCfg[f].label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <CalendarDays size={32} className="mb-3 text-neutral-200" />
              <p className="text-sm font-semibold text-neutral-400">Aucune activite pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {filtered.map(a => {
                const cfg = sCfg[a.status];
                const catLabel = ACTIVITY_CATEGORIES.find(c => c.value === a.category)?.label ?? a.category;
                return (
                  <div key={a._id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
                      <CalendarDays size={16} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black text-neutral-900">{a.title}</p>
                        <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-600">{catLabel}</span>
                        {a.location && <span className="flex items-center gap-1"><MapPin size={10} /> {a.location}</span>}
                        {a.capacity && <span className="flex items-center gap-1"><Users size={10} /> {a.capacity} places</span>}
                      </div>
                      {a.startDate && <p className="mt-0.5 text-[11px] text-neutral-300">{new Date(a.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="hidden text-[10px] font-semibold text-neutral-400 sm:inline">{visiLabels[a.visibility]}</span>
                      <button title="Modifier" onClick={() => setEditTarget(a)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:text-emerald-700"><Edit3 size={12} /></button>
                      <button title="Supprimer" onClick={() => setActivities(prev => prev.filter(item => item._id !== a._id))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-300 transition hover:border-red-300 hover:text-red-600"><Trash2 size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showCreate && <ActivityForm title="Nouvelle activite" onClose={() => setShowCreate(false)} onSubmit={upsertActivity} />}
        {editTarget && <ActivityForm title="Modifier l'activite" initial={editTarget} onClose={() => setEditTarget(null)} onSubmit={upsertActivity} />}
      </div>
    </DemoPortalShell>
  );
}

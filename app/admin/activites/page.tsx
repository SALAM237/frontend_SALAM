'use client';

import { useState } from 'react';
import { CalendarDays, Plus, X, MapPin, Users, Loader2, Trash2, Eye, Edit3 } from 'lucide-react';
import {
  useActivities, useCreateActivity, useDeleteActivity,
  ACTIVITY_CATEGORIES, type ActivityDoc,
} from '@/lib/api/activities';

type Status = 'published' | 'draft' | 'past' | 'cancelled';

const sCfg: Record<string, { label: string; cls: string }> = {
  published:  { label: 'Publiée',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  draft:      { label: 'Brouillon',  cls: 'bg-yellow-50  text-yellow-700  border-yellow-200'  },
  finished:   { label: 'Passée',     cls: 'bg-neutral-50 text-neutral-500 border-neutral-200' },
  cancelled:  { label: 'Annulée',    cls: 'bg-red-50     text-red-600     border-red-200'     },
};

const visiLabels: Record<string, string> = {
  public: 'Public', members: 'Membres', office: 'Bureau',
};

/* ─── Create modal ────────────────────────────────────────── */
function CreateActivityModal({ onClose }: { onClose: () => void }) {
  const [title,       setTitle]       = useState('');
  const [category,    setCategory]    = useState('');
  const [description, setDescription] = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [location,    setLocation]    = useState('');
  const [capacity,    setCapacity]    = useState('');
  const [visibility,  setVisibility]  = useState('public');
  const [status,      setStatus]      = useState('draft');
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const create = useCreateActivity();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title    = 'Titre requis';
    if (!category)     e.category = 'Catégorie requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    create.mutate(
      { title, category, description, startDate: startDate || undefined, endDate: endDate || undefined,
        location: location || undefined, capacity: capacity ? Number(capacity) : undefined, visibility, status },
      { onSuccess: () => onClose() },
    );
  };

  const inp = (err?: string) =>
    `w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 placeholder:text-neutral-300 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 shrink-0">
          <div>
            <h3 className="font-black text-neutral-900">Nouvelle activité</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Créer une activité ou un événement SALAM</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => { setTitle(e.target.value); setErrors(p => ({...p, title: ''})); }}
              placeholder="Ex: Tournoi de football SALAM 2025" className={inp(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Catégorie <span className="text-red-500">*</span></label>
            <select value={category} onChange={e => { setCategory(e.target.value); setErrors(p => ({...p, category: ''})); }}
              className={inp(errors.category)}>
              <option value="">Choisir une catégorie…</option>
              {ACTIVITY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.category && <p className="text-[11px] text-red-500">{errors.category}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} placeholder="Description de l'activité…"
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date de début</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className={inp()} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date de fin</label>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className={inp()} />
            </div>
          </div>

          {/* Location & Capacity */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Lieu</label>
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Ex: Paris 12e" className={inp()} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Capacité</label>
              <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)}
                placeholder="Ex: 50" className={inp()} />
            </div>
          </div>

          {/* Visibility & Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Visibilité</label>
              <select value={visibility} onChange={e => setVisibility(e.target.value)} className={inp()}>
                <option value="public">Public</option>
                <option value="members">Membres uniquement</option>
                <option value="office">Bureau seulement</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Statut</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inp()}>
                <option value="draft">Brouillon</option>
                <option value="published">Publier maintenant</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={handleSubmit} disabled={create.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
            {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Créer l&apos;activité
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminActivitesPage() {
  const [filter,      setFilter]      = useState<string>('all');
  const [showCreate,  setShowCreate]  = useState(false);
  const { data, isLoading } = useActivities({ status: filter === 'all' ? undefined : filter });
  const deleteActivity = useDeleteActivity();

  const activities = data?.data?.activities ?? [];

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ? Cette action est irréversible.`)) return;
    deleteActivity.mutate(id);
  };

  const stats = {
    published: activities.filter(a => a.status === 'published').length,
    draft:     activities.filter(a => a.status === 'draft').length,
    finished:  activities.filter(a => a.status === 'finished').length,
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
          <Plus size={14} />
          <span className="hidden sm:inline">Nouvelle activité</span>
        </button>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'published', 'draft', 'finished'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-8 rounded-full border px-3 text-xs font-bold transition-all sm:px-4 ${
              filter === f ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'
            }`}>
            {f === 'all' ? 'Toutes' : sCfg[f].label}
          </button>
        ))}
      </div>

      {/* List */}
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
            <p className="mt-1 text-xs text-neutral-300">Cliquez sur &quot;Nouvelle activité&quot; pour commencer.</p>
          </div>
        )}

        {!isLoading && activities.length > 0 && (
          <div className="divide-y divide-neutral-50">
            {activities.map((a: ActivityDoc) => {
              const cfg = sCfg[a.status] ?? sCfg.draft;
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
                      {a.location && <span className="flex items-center gap-1"><MapPin size={10} /> {a.location}</span>}
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

      {showCreate && <CreateActivityModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

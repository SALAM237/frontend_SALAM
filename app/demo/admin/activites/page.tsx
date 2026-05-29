'use client';

import { useState } from 'react';
import { CalendarDays, Edit3, Eye, MapPin, Plus, Trash2, Users } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoActivities } from '@/data/demo/demo-activities';
import { DemoContentEditorModal, type DemoEditorPayload } from '@/components/demo/DemoContentEditorModal';
import { RichText } from '@/components/ui/RichText';

type DemoActivity = {
  _id: string;
  title: string;
  category: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  capacity: number;
  visibility: 'public' | 'members' | 'office';
  status: 'published' | 'draft' | 'finished' | 'cancelled';
  imageUrl?: string;
};

const ACTIVITY_CATEGORIES = [
  { value: 'solidarite', label: 'Solidarite' },
  { value: 'culture', label: 'Culture' },
  { value: 'education', label: 'Education' },
  { value: 'sport', label: 'Sport' },
  { value: 'benevolat', label: 'Benevolat' },
];

const sCfg: Record<DemoActivity['status'], { label: string; cls: string }> = {
  published: { label: 'Publiee', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  draft: { label: 'Brouillon', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  finished: { label: 'Passee', cls: 'bg-neutral-50 text-neutral-500 border-neutral-200' },
  cancelled: { label: 'Annulee', cls: 'bg-red-50 text-red-600 border-red-200' },
};

function fromPayload(payload: DemoEditorPayload, base?: DemoActivity): DemoActivity {
  return {
    _id: base?._id ?? `demo-activity-${Date.now()}`,
    title: payload.title || 'Activite demo',
    category: payload.category ?? 'solidarite',
    description: payload.content || payload.excerpt || '',
    startDate: base?.startDate ?? '2026-07-05T10:00:00.000Z',
    endDate: base?.endDate ?? '2026-07-05T12:00:00.000Z',
    location: base?.location ?? 'Rabat',
    capacity: base?.capacity ?? 60,
    visibility: payload.visibility ?? 'public',
    status: payload.status ?? 'draft',
    imageUrl: payload.imageUrl,
  };
}

export default function DemoAdminActivitiesPage() {
  const [filter, setFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<DemoActivity | null>(null);
  const [preview, setPreview] = useState<DemoActivity | null>(null);
  const [activities, setActivities] = useState<DemoActivity[]>(() => demoActivities.map((activity, index) => ({
    _id: activity.id,
    title: activity.title,
    category: ['etude', 'orientation'].includes(activity.category) ? 'education' : activity.category,
    description: `<strong>${activity.title}</strong><br><br>${activity.description}<br><br><span style="color:#047857">Inscription demo active, sans envoi reel.</span>`,
    startDate: `${activity.date}T10:00:00.000Z`,
    endDate: `${activity.date}T12:00:00.000Z`,
    location: activity.location,
    capacity: activity.participants + 20,
    visibility: index === 1 ? 'members' : 'public',
    status: activity.status === 'published' ? 'published' : 'draft',
    imageUrl: index === 0 ? '/images/gallery/image_parallax_SALAM.png' : '/images/gallery/image_parallax_SALAM_1200.webp',
  })));

  const filtered = activities.filter(a => filter === 'all' || a.status === filter);
  const stats = {
    published: activities.filter(a => a.status === 'published').length,
    draft: activities.filter(a => a.status === 'draft').length,
    finished: activities.filter(a => a.status === 'finished').length,
  };
  const upsert = (payload: DemoEditorPayload, base?: DemoActivity) => {
    const next = fromPayload(payload, base);
    setActivities(prev => prev.some(item => item._id === next._id) ? prev.map(item => item._id === next._id ? next : item) : [next, ...prev]);
  };

  return (
    <DemoPortalShell type="admin" title="Activites">
      <div className="w-full space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Activites</h1>
            <p className="mt-0.5 text-sm text-neutral-500">Gestion demo avec editeur enrichi, statut, visibilite et actions fictives.</p>
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
          {(['all', 'published', 'draft', 'finished'] as const).map(item => (
            <button key={item} onClick={() => setFilter(item)} className={`h-8 rounded-full border px-3 text-xs font-bold transition-all sm:px-4 ${filter === item ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'}`}>
              {item === 'all' ? 'Toutes' : sCfg[item].label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map(activity => {
            const cfg = sCfg[activity.status];
            const catLabel = ACTIVITY_CATEGORIES.find(item => item.value === activity.category)?.label ?? activity.category;
            return (
              <article key={activity._id} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
                {activity.imageUrl && <img src={activity.imageUrl} alt="" className="h-36 w-full object-cover" />}
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.cls}`}>{cfg.label}</span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">{catLabel}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{activity.visibility === 'public' ? 'Public' : activity.visibility === 'members' ? 'Membres' : 'Bureau'}</span>
                  </div>
                  <h2 className="mt-3 line-clamp-2 text-base font-black text-neutral-900"><RichText value={activity.title} /></h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-500"><RichText value={activity.description} /></p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {activity.location}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {activity.capacity} places</span>
                    <span>{new Date(activity.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={() => setPreview(activity)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-bold text-neutral-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Eye size={12} /> Voir</button>
                    <button onClick={() => setEditTarget(activity)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-bold text-neutral-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"><Edit3 size={12} /> Modifier</button>
                    <button onClick={() => setActivities(prev => prev.filter(item => item._id !== activity._id))} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 px-3 text-xs font-bold text-red-500 hover:border-red-300"><Trash2 size={12} /> Supprimer</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {showCreate && <DemoContentEditorModal title="Nouvelle activite" categories={ACTIVITY_CATEGORIES} contentLabel="Description" onClose={() => setShowCreate(false)} onSubmit={payload => upsert(payload)} submitLabel="Creer l'activite demo" />}
        {editTarget && <DemoContentEditorModal title="Modifier l'activite" initial={{ title: editTarget.title, category: editTarget.category, content: editTarget.description, imageUrl: editTarget.imageUrl, status: editTarget.status, visibility: editTarget.visibility }} categories={ACTIVITY_CATEGORIES} contentLabel="Description" onClose={() => setEditTarget(null)} onSubmit={payload => upsert(payload, editTarget)} submitLabel="Mettre a jour" />}
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              {preview.imageUrl && <img src={preview.imageUrl} alt="" className="h-52 w-full object-cover" />}
              <div className="p-6">
                <h3 className="text-xl font-black text-neutral-900"><RichText value={preview.title} /></h3>
                <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5 text-sm leading-relaxed text-neutral-700"><RichText value={preview.description} /></div>
                <button onClick={() => setPreview(null)} className="mt-5 h-10 rounded-xl bg-neutral-900 px-5 text-sm font-black text-white">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DemoPortalShell>
  );
}

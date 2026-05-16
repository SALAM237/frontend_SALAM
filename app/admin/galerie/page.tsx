'use client';

import { Images, Plus, Trash2, Eye, Lock, Globe } from 'lucide-react';

const ALBUMS = [
  { id: 1, title: 'Soirée Networking Paris 2024', photos: 34, visibility: 'public',  date: 'Nov 2024', cover: null },
  { id: 2, title: 'Assemblée Générale 2024',       photos: 18, visibility: 'members', date: 'Juin 2024', cover: null },
  { id: 3, title: 'Hackathon Casablanca 2024',     photos: 56, visibility: 'public',  date: 'Mars 2024', cover: null },
  { id: 4, title: 'Remise diplômes 2023',           photos: 42, visibility: 'public',  date: 'Oct 2023',  cover: null },
  { id: 5, title: 'AG & Bureau 2023',              photos: 12, visibility: 'members', date: 'Juin 2023', cover: null },
  { id: 6, title: 'Photos membres privées',        photos: 8,  visibility: 'private', date: 'Divers',    cover: null },
];

const visCfg: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  public:  { label: 'Public',   cls: 'bg-emerald-50 text-emerald-700', icon: Globe },
  members: { label: 'Membres',  cls: 'bg-blue-50 text-blue-700',       icon: Lock  },
  private: { label: 'Privé',    cls: 'bg-neutral-50 text-neutral-500', icon: Lock  },
};

export default function AdminGaleriePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Galerie</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{ALBUMS.length} albums · {ALBUMS.reduce((s, a) => s + a.photos, 0)} photos</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700">
          <Plus size={14} /> Nouvel album
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALBUMS.map(({ id, title, photos, visibility, date }) => {
          const v = visCfg[visibility];
          const VIcon = v.icon;
          return (
            <div key={id} className="group relative rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
              {/* Placeholder image */}
              <div className="aspect-video bg-gradient-to-br from-emerald-900 via-[#0b1f15] to-[#061009] flex items-center justify-center">
                <Images size={32} className="text-white/20" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="flex-1 truncate font-black text-neutral-900 text-sm">{title}</h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${v.cls}`}>
                    <VIcon size={9} /> {v.label}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-neutral-400">{photos} photos · {date}</p>
                </div>
                <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-600 hover:border-emerald-300 hover:text-emerald-700">
                    <Eye size={12} /> Voir
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add album card */}
        <button className="flex aspect-auto min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 transition-all hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30">
          <Plus size={28} className="opacity-50" />
          <p className="text-sm font-black">Nouvel album</p>
        </button>
      </div>
    </div>
  );
}

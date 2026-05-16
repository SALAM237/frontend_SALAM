'use client';

import { useState } from 'react';
import { CalendarDays, MapPin, Clock, CheckCircle2, ExternalLink } from 'lucide-react';

type Status = 'inscrit' | 'ouvert' | 'passe' | 'complet';

const ACTIVITES = [
  { id: 1, title: 'Soirée Networking SALAM Paris 2025', date: '22 mai 2025',   heure: '19h00 – 22h00', lieu: 'Paris · Maison du Cameroun',   categorie: 'Networking',     status: 'inscrit' as Status, desc: 'Rencontres professionnelles entre membres et partenaires. Dîner débat.' },
  { id: 2, title: 'Atelier Leadership Jeunesse',         date: '7 juin 2025',   heure: '18h00 – 20h00', lieu: 'En ligne (Zoom)',               categorie: 'Formation',      status: 'ouvert'  as Status, desc: 'Atelier pratique animé par des membres du bureau exécutif.' },
  { id: 3, title: 'Assemblée Générale Annuelle 2025',    date: '28 juin 2025',  heure: '10h00 – 17h00', lieu: 'Paris · Salle des fêtes',       categorie: 'Institutionnel', status: 'ouvert'  as Status, desc: 'AG annuelle ouverte à tous les membres. Vote du bureau et bilan.' },
  { id: 4, title: 'Cérémonie de remise des diplômes',   date: '15 mars 2025',  heure: '15h00 – 18h00', lieu: 'Paris · Institut Français',     categorie: 'Cérémonie',     status: 'passe'   as Status, desc: 'Remise des diplômes et distinctions SALAM 2025.' },
  { id: 5, title: 'Hackathon Innovation Cameroun',       date: '1 mars 2025',   heure: '09h00 – 20h00', lieu: 'Casablanca · Hôtel Royal',      categorie: 'Innovation',    status: 'passe'   as Status, desc: '72h de hackathon autour des défis du développement camerounais.' },
];

const statusConfig: Record<Status, { label: string; cls: string }> = {
  inscrit: { label: '✓ Inscrit',          cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ouvert:  { label: 'Inscription ouverte', cls: 'bg-blue-50 text-blue-700 border-blue-100'         },
  passe:   { label: 'Passée',              cls: 'bg-neutral-50 text-neutral-500 border-neutral-100' },
  complet: { label: 'Complet',             cls: 'bg-red-50 text-red-600 border-red-100'             },
};

const catColors: Record<string, string> = {
  'Networking':    'bg-purple-50 text-purple-700',
  'Formation':     'bg-blue-50 text-blue-700',
  'Institutionnel':'bg-neutral-100 text-neutral-600',
  'Cérémonie':    'bg-yellow-50 text-yellow-700',
  'Innovation':    'bg-orange-50 text-orange-700',
};

export default function MemberActivitesPage() {
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const filtered = ACTIVITES.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Mes activités</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Événements SALAM auxquels vous participez</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'inscrit', 'ouvert', 'passe'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`h-8 rounded-full border px-4 text-xs font-bold transition-all ${filter === f ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'}`}>
            {f === 'all' ? 'Toutes' : f === 'inscrit' ? 'Mes inscriptions' : f === 'ouvert' ? 'Ouvertes' : 'Passées'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(({ id, title, date, heure, lieu, categorie, status, desc }) => {
          const s = statusConfig[status];
          return (
            <div key={id} className={`rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:shadow-md ${status === 'passe' ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-start gap-3">
                {/* Date box */}
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50 text-center">
                  <p className="text-[9px] font-black uppercase text-emerald-500">{date.split(' ')[1]?.substring(0,3)}</p>
                  <p className="text-lg font-black leading-none text-emerald-700">{date.split(' ')[0]}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${catColors[categorie] || 'bg-neutral-50 text-neutral-500'}`}>
                      {categorie}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${s.cls}`}>{s.label}</span>
                  </div>
                  <h3 className="font-black text-neutral-900">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">{desc}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Clock size={11} /> {heure}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <MapPin size={11} /> {lieu}
                    </span>
                  </div>
                </div>

                {status === 'inscrit' && (
                  <div className="flex h-8 items-center gap-1 rounded-full bg-emerald-50 px-3">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-700">Confirmé</span>
                  </div>
                )}
                {status === 'ouvert' && (
                  <button className="inline-flex h-8 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700 transition-all">
                    <ExternalLink size={11} /> S&apos;inscrire
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

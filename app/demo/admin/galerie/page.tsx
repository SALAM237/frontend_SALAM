'use client';

import Link from 'next/link';
import { Images, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ALBUMS = [
  { title: 'Forum des opportunités 2024', count: 47, date: 'Juin 2024',  visible: true,  cover: 'from-emerald-400 to-teal-600'   },
  { title: 'Tournoi de football 2024',    count: 83, date: 'Juin 2024',  visible: true,  cover: 'from-blue-400 to-indigo-600'    },
  { title: 'Soirée networking mai 2024',  count: 31, date: 'Mai 2024',   visible: false, cover: 'from-purple-400 to-pink-600'    },
  { title: 'Assemblée générale 2024',     count: 24, date: 'Avr. 2024',  visible: true,  cover: 'from-amber-400 to-orange-500'   },
  { title: 'Atelier CV mars 2024',        count: 18, date: 'Mars 2024',  visible: true,  cover: 'from-red-400 to-rose-600'       },
  { title: 'Gala solidarité 2023',        count: 96, date: 'Déc. 2023',  visible: true,  cover: 'from-neutral-400 to-neutral-600'},
];

export default function DemoAdminGalerie() {
  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#f4f6f5]">
      <header className="border-b border-neutral-200/80 bg-white/95 px-5 py-4">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <Link href="/demo/admin" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition">
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <Images size={16} className="text-emerald-600" />
            <h1 className="text-sm font-black text-neutral-900">
              Galerie <span className="font-normal text-neutral-400">({ALBUMS.length} albums)</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ALBUMS.map(a => (
            <div key={a.title} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className={`relative h-32 bg-gradient-to-br ${a.cover}`}>
                {!a.visible && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-black text-white">
                    <EyeOff size={8} /> Masqué
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-black leading-tight text-neutral-900">{a.title}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">{a.date}</span>
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <Eye size={9} /> {a.count} photos
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

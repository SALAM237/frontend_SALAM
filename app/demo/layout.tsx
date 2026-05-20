'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FlaskConical } from 'lucide-react';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.split(';').find(c => c.trim().startsWith(name + '='))?.split('=')[1] ?? null;
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const [backHref,  setBackHref]  = useState('/');
  const [backLabel, setBackLabel] = useState('Retour au site');

  useEffect(() => {
    // salam_space est le seul cookie de session lisible côté JS (salam_access est httpOnly)
    const space = readCookie('salam_space');
    if (space === 'admin')  { setBackHref('/admin/dashboard');  setBackLabel('Mon espace admin');  return; }
    if (space === 'member') { setBackHref('/member/dashboard'); setBackLabel('Mon espace membre'); return; }
  }, []);

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <FlaskConical size={14} className="shrink-0 text-amber-600" />
          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
            Mode démo — données fictives, aucune action réelle
          </span>
        </div>
        <Link
          href={backHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-black text-amber-800 transition-colors hover:bg-amber-100"
        >
          <ArrowLeft size={11} /> {backLabel}
        </Link>
      </div>
      {children}
    </>
  );
}

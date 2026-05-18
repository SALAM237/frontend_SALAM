'use client';

import Link from 'next/link';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getPostLoginRedirect } from '@/lib/auth/roles';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const backHref  = user ? getPostLoginRedirect(user) : '/';
  const backLabel = user ? 'Mon espace' : 'Retour au site';

  return (
    <>
      {/* Demo banner */}
      <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-6">
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

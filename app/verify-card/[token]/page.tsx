'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useScanLookup } from '@/lib/api/scans';
import { formatFullName } from '@/lib/format-name';

function canScan(user: ReturnType<typeof useAuthStore.getState>['user']) {
  const permissions = user?.effectivePermissions ?? [];
  return permissions.includes('*') || permissions.includes('scans.create');
}

export default function VerifyCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const user = useAuthStore(s => s.user);
  const lookup = useScanLookup();
  const allowed = canScan(user);
  const scanValue = `https://salam-cameroun.com/verify-card/${encodeURIComponent(token)}`;

  useEffect(() => {
    if (!allowed || lookup.data || lookup.isPending) return;
    lookup.mutate(scanValue);
  }, [allowed, lookup, scanValue]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12 text-white">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl backdrop-blur">
          <LockKeyhole className="mx-auto h-10 w-10 text-yellow-300" />
          <h1 className="mt-4 text-xl font-black">Connexion requise</h1>
          <p className="mt-2 text-sm text-white/65">Cette carte ne peut etre verifiee que par un administrateur autorise.</p>
          <Link href="/bureau-executif/connexion" className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-black text-neutral-950 hover:bg-emerald-400">
            Se connecter
          </Link>
        </section>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12 text-white">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl backdrop-blur">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-300" />
          <h1 className="mt-4 text-xl font-black">Acces non autorise</h1>
          <p className="mt-2 text-sm text-white/65">Votre compte ne possede pas la permission de scanner ou verifier une carte membre.</p>
        </section>
      </main>
    );
  }

  const member = lookup.data?.data;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Verification securisee</p>
            <h1 className="text-xl font-black text-neutral-950">Carte membre SALAM</h1>
          </div>
        </div>

        {lookup.isPending && (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-neutral-50 p-5 text-sm font-semibold text-neutral-500">
            <Loader2 size={16} className="animate-spin" /> Verification en cours...
          </div>
        )}

        {lookup.isError && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            {(lookup.error as Error)?.message || 'Carte introuvable ou non autorisee.'}
          </div>
        )}

        {member && (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-sm font-black text-emerald-900">Carte reconnue</p>
                  <p className="mt-1 text-lg font-black text-neutral-950">{formatFullName(member.firstName, member.lastName)}</p>
                  <p className="mt-1 font-mono text-xs text-neutral-500">{member.memberNumber}</p>
                </div>
              </div>
            </div>
            <Link href="/admin/scanner" className="inline-flex h-10 w-full items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-white hover:bg-neutral-800">
              Ouvrir le scanner admin
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
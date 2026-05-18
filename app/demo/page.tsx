import Link from 'next/link';
import { Shield, User } from 'lucide-react';

export default function DemoPage() {
  return (
    <main className="container-salam section-salam">
      <p className="font-bold text-salam-red">Mode démo isolé</p>
      <h1 className="mt-3 text-5xl font-black">Démonstration complète SALAM</h1>
      <p className="mt-4 max-w-2xl text-neutral-700">Toutes les actions réagissent avec des données fictives.</p>

      {/* Portal access — prominent CTAs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-lg">
        <Link
          href="/demo/admin"
          className="group flex items-center gap-4 rounded-2xl border-2 border-emerald-600 bg-emerald-600 px-6 py-5 text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Shield size={22} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-70">Portail</p>
            <p className="text-lg font-black leading-tight">Admin</p>
          </div>
        </Link>
        <Link
          href="/demo/member"
          className="group flex items-center gap-4 rounded-2xl border-2 border-neutral-200 bg-white px-6 py-5 text-neutral-900 shadow-lg transition-all hover:border-emerald-400 hover:shadow-xl"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <User size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Portail</p>
            <p className="text-lg font-black leading-tight">Adhérent</p>
          </div>
        </Link>
      </div>

    </main>
  );
}

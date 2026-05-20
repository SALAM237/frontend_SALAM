import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';

export const revalidate = 86400;
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = {
  title: 'Bureau exécutif',
  description: "Le bureau exécutif de l'association SALAM Cameroun.",
};

const POSTES = [
  { role: 'Président(e)', color: 'border-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  { role: 'Vice-Président(e)', color: 'border-red-400', badge: 'bg-red-100 text-red-700' },
  { role: 'Secrétaire Général(e)', color: 'border-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  { role: 'Trésorier(ère)', color: 'border-blue-400', badge: 'bg-blue-100 text-blue-700' },
  { role: 'Commissaire aux comptes', color: 'border-purple-400', badge: 'bg-purple-100 text-purple-700' },
  { role: 'Chargé(e) Communication', color: 'border-pink-400', badge: 'bg-pink-100 text-pink-700' },
  { role: 'Chargé(e) IT', color: 'border-cyan-400', badge: 'bg-cyan-100 text-cyan-700' },
  { role: 'Chargé(e) Culturel(le)', color: 'border-orange-400', badge: 'bg-orange-100 text-orange-700' },
  { role: 'Chargé(e) Sport', color: 'border-indigo-400', badge: 'bg-indigo-100 text-indigo-700' },
];

function MemberCard({ role, color, badge }: { role: string; color: string; badge: string }) {
  return (
    <div className={`group flex flex-col items-center gap-4 rounded-[1.5rem] border-2 ${color} border-opacity-40 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-opacity-70`}>
      <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300">
        <div className="absolute inset-0 flex items-center justify-center">
          <Users size={28} className="text-neutral-400" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-neutral-400 italic">À annoncer</p>
        <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${badge}`}>{role}</span>
      </div>
    </div>
  );
}

export default function BureauExecutifPage() {
  return (
    <main>
      <PageHero
        badge="Gouvernance SALAM"
        title="exécutif"
        accentWord="Bureau"
        accentPosition="start"
        subtitle="Le bureau exécutif est l'organe dirigeant de l'association SALAM. Ses membres sont élus par l'assemblée générale."
        breadcrumbs={[{ label: 'À propos', href: '/a-propos' }, { label: 'Bureau exécutif' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-start justify-between gap-4">
            <div>
              <span className="mb-2 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Membres élus</span>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
                Composition du <span className="text-emerald-700">bureau</span>
              </h2>
            </div>
            <Link href="/contact" className="hidden sm:inline-flex h-10 items-center gap-2 rounded-full border border-emerald-300 px-5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-all">
              Nous contacter
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {POSTES.map(p => <MemberCard key={p.role} {...p} />)}
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center">
            <p className="text-sm font-bold text-emerald-800">
              Les membres du bureau exécutif seront présentés après l'assemblée générale.
            </p>
            <p className="mt-1 text-xs text-emerald-600">
              Vous souhaitez vous présenter aux élections ? Contactez-nous.
            </p>
            <Link href="/contact" className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-xs font-black text-white hover:bg-emerald-700 transition-all">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: '/mot-du-president', label: 'Mot du président', desc: 'Le message du président de l\'association' },
              { href: '/conseil-des-sages', label: 'Conseil des sages', desc: 'Les personnalités qui guident SALAM' },
              { href: '/commissions', label: 'Commissions', desc: 'Les groupes de travail thématiques' },
            ].map(({ href, label, desc }) => (
              <Link key={href} href={href} className="group rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                <h3 className="font-black text-neutral-900 group-hover:text-emerald-700 transition-colors">{label}</h3>
                <p className="mt-1 text-xs text-neutral-500">{desc}</p>
                <span className="mt-3 block text-xs font-bold text-emerald-600">Découvrir →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

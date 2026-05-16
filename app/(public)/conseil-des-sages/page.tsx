import type { Metadata } from 'next';
import Link from 'next/link';
import { Star, Users } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = {
  title: 'Conseil des sages',
  description: "Le conseil des sages de l'association SALAM Cameroun.",
};

export default function ConseilDesSagesPage() {
  return (
    <main>
      <PageHero
        badge="Conseil SALAM"
        title="des sages"
        accentWord="Conseil"
        accentPosition="start"
        subtitle="Le conseil des sages est composé de personnalités expérimentées qui guident et conseillent l'association SALAM."
        breadcrumbs={[{ label: 'À propos', href: '/a-propos' }, { label: 'Conseil des sages' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">

          <div className="mb-10">
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Rôle du <span className="text-emerald-700">conseil</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.85] text-neutral-600">
              Le conseil des sages est un organe consultatif qui apporte son expertise, son expérience et sa sagesse à l'association SALAM. Ses membres sont des personnalités reconnues dans leurs domaines respectifs : académique, professionnel, associatif ou diplomatique.
            </p>
            <p className="mt-3 max-w-2xl text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.85] text-neutral-600">
              Ils contribuent à orienter la vision stratégique de l'association, valident les grandes décisions et servent d'ambassadeurs auprès des institutions et partenaires.
            </p>
          </div>

          {/* Members placeholder */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-4 rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300 shadow-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Star size={24} className="text-neutral-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-neutral-400 italic">Membre sage</p>
                  <span className="mt-2 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-[11px] font-black text-yellow-700">Conseil des sages</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-dashed border-yellow-300 bg-yellow-50 p-6 text-center">
            <p className="text-sm font-bold text-yellow-800">
              Les membres du conseil des sages seront présentés prochainement.
            </p>
            <p className="mt-1 text-xs text-yellow-600">
              Vous avez une expertise à apporter à SALAM ? Contactez-nous.
            </p>
            <Link href="/contact" className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-xs font-black text-white hover:bg-emerald-700 transition-all">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#061009] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-white">Rencontrez le bureau exécutif</h3>
            <p className="mt-1 text-sm text-white/50">Découvrez les membres élus qui dirigent l'association.</p>
          </div>
          <Link href="/bureau-executif" className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-black text-white hover:bg-emerald-400 transition-all">
            Bureau exécutif →
          </Link>
        </div>
      </section>
    </main>
  );
}

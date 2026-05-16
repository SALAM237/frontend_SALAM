import type { Metadata } from 'next';
import Link from 'next/link';
import { Quote } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = {
  title: 'Mot du président',
  description: "Message du président de l'association SALAM Cameroun.",
};

export default function MotDuPresidentPage() {
  return (
    <main>
      <PageHero
        badge="Leadership SALAM"
        title="du président"
        accentWord="Mot"
        accentPosition="start"
        subtitle="Le message du président de l'association SALAM Cameroun — vision, engagements et perspectives."
        breadcrumbs={[{ label: 'À propos', href: '/a-propos' }, { label: 'Mot du président' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-start">

            {/* Portrait */}
            <div className="flex flex-col items-center gap-4 lg:items-start">
              <div className="relative h-48 w-48 overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900 to-emerald-600 shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-black text-white/20">P</span>
                </div>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-black text-neutral-900">Le Président</p>
                <p className="text-sm text-emerald-700">Association SALAM Cameroun</p>
              </div>
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-emerald-600 via-red-500 to-yellow-500" />
            </div>

            {/* Message */}
            <div className="relative">
              <Quote size={48} className="absolute -left-4 -top-4 text-emerald-200" />
              <div className="flex flex-col gap-5 pl-4">
                <p className="text-[clamp(1rem,1.4vw,1.1rem)] font-semibold leading-[1.9] text-neutral-700">
                  Chers amis, chers membres, chers sympathisants,
                </p>
                <p className="text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.9] text-neutral-600">
                  C'est avec une immense fierté et une profonde gratitude que je prends la parole en tant que président de l'association SALAM Cameroun. Notre association est bien plus qu'un simple réseau : c'est une famille, un foyer pour chaque étudiant camerounais qui choisit de construire son avenir au Maroc ou en France.
                </p>
                <p className="text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.9] text-neutral-600">
                  Depuis notre création, nous avons accompagné des centaines d'étudiants dans leur parcours : de la préparation de leurs dossiers d'admission jusqu'à leur insertion socioprofessionnelle au Cameroun. Chaque réussite est la nôtre. Chaque étudiant qui trouve sa voie est la preuve que notre mission a du sens.
                </p>
                <p className="text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.9] text-neutral-600">
                  SALAM, c'est Solidarité, Accompagnement, Leadership, Action et Mobilisation. Ces cinq piliers ne sont pas que des mots — ce sont des actes quotidiens portés par des hommes et des femmes engagés, bénévoles, passionnés par le développement de leur pays et de leur communauté.
                </p>
                <p className="text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.9] text-neutral-600">
                  Je vous invite à rejoindre notre mouvement, à apporter vos compétences, votre énergie et votre enthousiasme. Ensemble, nous construisons des passerelles entre le Cameroun, le Maroc et le monde entier. Ensemble, nous révélons le potentiel d'une jeunesse engagée.
                </p>
                <p className="text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.9] text-neutral-600">
                  Je compte sur chacun d'entre vous. SALAM vous appartient.
                </p>
                <p className="mt-2 font-black text-neutral-900">
                  Le Président — Association SALAM Cameroun
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#061009] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-white">Rencontrez l'équipe dirigeante</h3>
              <p className="mt-1 text-sm text-white/50">Découvrez le bureau exécutif et le conseil des sages.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/bureau-executif" className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-black text-white hover:bg-emerald-400 transition-all">
                Bureau exécutif
              </Link>
              <Link href="/adhesion" className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white/65 hover:border-white/40 hover:text-white transition-all">
                Nous rejoindre
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

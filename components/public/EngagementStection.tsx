'use client';

import { useState, useEffect, useRef } from 'react';

const engagementAnimations = `
@keyframes eng-slide-left {
  0%   { opacity: 0; transform: translateX(-60px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes eng-slide-right {
  0%   { opacity: 0; transform: translateX(60px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes eng-fade-in {
  0%   { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
.eng-slide-left  { animation: eng-slide-left  1.1s cubic-bezier(.22,1,.36,1) both; }
.eng-slide-right { animation: eng-slide-right 1.1s cubic-bezier(.22,1,.36,1) both; animation-delay: 0.15s; }
.eng-fade-badge  { animation: eng-fade-in     1.0s cubic-bezier(.22,1,.36,1) both; }
`;

const cards = [
  {
    letter: 'S',
    title: 'Solidarite',
    color: 'from-red-500 to-rose-400',
    lineColor: 'bg-emerald-500',
    engagement: "Créer une communauté solidaire au service des étudiants et des personnes les plus vulnérables.",
    actions: "Entraide, réseau, soutien social, Alumni, actions solidaires et accompagnement des personnes vulnérables.",
    impact: "Une génération unie qui avance ensemble et agit pour ceux qui en ont le plus besoin.",
  },
  {
    letter: 'A',
    title: 'Accompagnement',
    color: 'from-emerald-600 to-green-400',
    lineColor: 'bg-red-500',
    engagement: "Accompagner chaque étudiant vers la réussite.",
    actions: "Orientation, préparation, accompagnement et intégration.",
    impact: "Des étudiants mieux préparés, plus confiants et moins isolés.",
  },
  {
    letter: 'L',
    title: 'Leadership',
    color: 'from-yellow-500 to-amber-300',
    lineColor: 'bg-yellow-400',
    engagement: "Transformer les compétences en opportunités.",
    actions: "Insertion professionnelle, networking, projets et entrepreneuriat.",
    impact: "Créer et offrir plus d'opportunités académiques, professionnelles et entrepreneuriales pour les jeunes camerounais.",
  },
  {
    letter: 'A',
    title: 'Action',
    color: 'from-blue-600 to-cyan-400',
    lineColor: 'bg-red-500',
    engagement: "Faire des étudiants des acteurs du développement.",
    actions: "Innovation, engagement citoyen et transmission d'expertise.",
    impact: "Contribuer concrètement au développement du Cameroun.",
  },
  {
    letter: 'M',
    title: 'Mobilisation',
    color: 'from-emerald-800 to-emerald-500',
    lineColor: 'bg-emerald-500',
    engagement: "Mobiliser les talents et les énergies autour d'un impact collectif durable.",
    actions: "Actions citoyennes, initiatives communautaires, projets solidaires et mobilisation de la jeunesse.",
    impact: "Une jeunesse engagée capable de porter des changements durables pour la société.",
  },
];

export function EngagementSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{engagementAnimations}</style>
      <section className="relative min-h-screen overflow-hidden bg-[#fffdf8] px-5 pt-[clamp(3rem,6vw,5rem)] pb-1.5 md:px-8 lg:px-3">
        <div className="absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute right-[-120px] top-32 h-96 w-96 rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-200/20 blur-3xl" />

        <div ref={sectionRef} className="relative z-10 mx-auto max-w-7xl lg:max-w-5xl">
          <div className="mx-auto max-w-4xl text-center">
            <span
              className={
                'inline-flex rounded-full border border-emerald-300 bg-emerald-600 px-3 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-white shadow-sm backdrop-blur ' +
                (visible ? 'eng-fade-badge' : 'opacity-0')
              }
            >
              Nos engagements
            </span>

            <h1 className="mt-6 text-[clamp(2rem,6vw,2.8rem)] lg:text-[clamp(1.6rem,3.2vw,2.8rem)] font-black leading-[0.92] tracking-[-0.07em] text-white">
              <span className={'inline-block ' + (visible ? 'eng-slide-left' : 'opacity-0')}>
                <span className="text-emerald-700">Révéler</span>
              </span>{' '}
              <span className={'inline-block ' + (visible ? 'eng-slide-right' : 'opacity-0')}>
                <span className="text-black">le potentiel d&apos;une jeunesse engagée</span>
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-[clamp(1rem,1.3vw,1.15rem)] leading-8 text-neutral-600">
              Accompagner les étudiants, soutenir les plus vulnérables et mobiliser les talents pour contribuer au développement du Cameroun.
            </p>
          </div>

          <div className="mt-8 mb-14 flex flex-col gap-[6px] md:mb-20 md:gap-2 lg:mt-8 lg:mb-16 lg:gap-3">
            {cards.map((card, index) => (
              <article
                key={card.title}
                className={
                  'group relative overflow-hidden rounded-[1.2rem] md:rounded-[1.5rem] lg:rounded-[2.5rem] border border-white/70 bg-emerald-50/60 shadow-[0_12px_40px_rgba(15,23,42,0.06),0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] hover:scale-[1.012] hover:shadow-[0_24px_80px_rgba(15,23,42,0.14),0_50px_140px_rgba(15,23,42,0.18)] ' +
                  (card.lineColor === 'bg-emerald-500'
                    ? 'hover:border-emerald-500/70'
                    : card.lineColor === 'bg-red-500'
                      ? 'hover:border-red-500/70'
                      : 'hover:border-yellow-400/80')
                }
              >
                <div className="overflow-hidden">
                  {/* Mobile / Tablet Premium Accordion */}
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="relative flex min-h-[96px] w-full items-center justify-between overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#10261a] px-5 py-3.5 text-left lg:hidden"
                  >
                    <div className={'absolute inset-0 bg-gradient-to-br ' + card.color + ' opacity-[0.08]'} />

                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[6rem] font-black leading-none tracking-[-0.08em] text-emerald-500/10">
                      {card.letter}
                    </span>

                    <div className="relative z-10 flex items-center justify-between gap-4 w-full">
                      <div className="pl-8">
                        <h3 className="text-[1.5rem] md:text-[1.8rem] lg:text-[clamp(1.65rem,2.8vw,2.3rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">
                          {card.title}
                        </h3>
                        <div className={'mt-3 h-[4px] w-16 rounded-[6px] ' + card.lineColor} />
                      </div>

                      <div
                        className={
                          'flex h-8 w-8 items-center justify-center rounded-[0.8rem] border border-white/10 bg-white/5 text-xl text-white/70 backdrop-blur transition-all duration-500 ' +
                          (openIndex === index ? 'rotate-180 bg-white/10' : '')
                        }
                      >
                        {openIndex === index ? '−' : '+'}
                      </div>
                    </div>
                  </button>

                  <div
                    className={
                      'grid transition-[grid-template-rows] ease-[cubic-bezier(.22,1,.36,1)] lg:[grid-template-rows:1fr] ' +
                      (openIndex === index
                        ? 'grid-rows-[1fr] duration-500'
                        : 'grid-rows-[0fr] duration-300')
                    }
                  >
                  <div className="min-h-0 overflow-hidden lg:grid lg:grid-cols-[240px_0.82fr]">
                    {/* Left block — desktop only */}
                    <div className="relative hidden flex-col justify-center overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#10261a] p-6 shadow-[inset_-1px_0_0_rgba(255,255,255,0.6)] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.015] lg:flex lg:border-b-0 lg:border-r lg:p-3">
                      <div className={'absolute inset-0 bg-gradient-to-br ' + card.color + ' opacity-[0.08]'} />

                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12rem] lg:text-[7rem] font-black leading-none tracking-[-0.08em] text-emerald-500/10 transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110">
                        {card.letter}
                      </span>

                      <div className="relative z-10">
                        <h3 className="mt-3 text-[clamp(1.1rem,1.8vw,1.5rem)] font-black leading-[0.94] tracking-[-0.05em] text-white">
                          {card.title}
                        </h3>
                        <div className={'mt-4 h-[4px] w-20 rounded-full ' + card.lineColor + ' transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:w-28'} />
                      </div>
                    </div>

                    {/* Right block */}
                    <div className="min-h-0 overflow-hidden border-t border-emerald-100 p-4 transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] lg:border-t-0 lg:w-[780px] lg:max-w-[780px] lg:gap-1 lg:py-3">
                      <div className="flex flex-col gap-2 p-2 md:flex-row md:items-center md:gap-6">
                        <p className="relative min-w-[120px] pl-4 lg:pl-0 text-[13px] lg:text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 md:self-center before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-emerald-500 lg:before:hidden">
                          Engagement
                        </p>
                        <p className="w-full text-[12px] leading-[1.35] text-neutral-700">
                          {card.engagement}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 p-2 md:flex-row md:items-center md:gap-6">
                        <p className="relative min-w-[120px] pl-4 lg:pl-0 text-[13px] lg:text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 md:self-center before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-emerald-500 lg:before:hidden">
                          Actions
                        </p>
                        <p className="w-full text-[12px] leading-[1.35] text-neutral-700">
                          {card.actions}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 p-2 md:flex-row md:items-center md:gap-6">
                        <p className="relative min-w-[120px] pl-4 lg:pl-0 text-[13px] lg:text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 md:self-center before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-emerald-500 lg:before:hidden">
                          Impact
                        </p>
                        <p className="w-full text-[12px] font-semibold leading-[1.35] text-neutral-950">
                          {card.impact}
                        </p>
                      </div>
                    </div>
                  </div>{/* inner min-h-0 */}
                  </div>{/* outer grid */}
                </div>{/* overflow-hidden wrapper */}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

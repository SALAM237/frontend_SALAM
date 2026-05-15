'use client';

import React, { useEffect, useRef, useState } from 'react';

const MISSIONS = [
  {
    num: '01',
    badge: 'Mission 1',
    lines: ['Préparer les', 'futurs étudiants'],
    accent: '#0B8F3A',
    resume:
      "Informer, orienter et accompagner les nouveaux bacheliers camerounais souhaitant poursuivre leurs études supérieures au Maroc.",
    actions: [
      "Réunions d'information",
      'Orientation académique',
      'Préparation administrative',
      'Vie étudiante au Maroc',
      'Mise en relation',
      'Accompagnement avant le départ',
    ],
  },
  {
    num: '02',
    badge: 'Mission 2',
    lines: ['Insertion socio‑', 'professionnelle'],
    accent: '#C8102E',
    resume:
      'Accompagner les étudiants camerounais formés au Maroc dans leur retour au Cameroun et faciliter leur intégration socioprofessionnelle.',
    actions: [
      'Préparation au retour',
      'Orientation professionnelle',
      'Mise en relation avec les entreprises',
      'Forums & networking',
      'Accompagnement carrière',
      'Réseau Alumni',
    ],
  },
  {
    num: '03',
    badge: 'Mission 3',
    lines: ['Solidarité &', 'action sociale'],
    accent: '#F7C600',
    resume:
      "Promouvoir la solidarité, l'entraide et l'action sociale en faveur des étudiants et des populations les plus vulnérables.",
    actions: [
      'Actions solidaires',
      'Soutien aux personnes vulnérables',
      'Fundraising & collectes',
      'Aide humanitaire',
      'Mobilisation citoyenne',
      'Partenariats sociaux',
    ],
  },
  {
    num: '04',
    badge: 'Mission 4',
    lines: ['Développement', 'du Cameroun'],
    accent: '#3B82F6',
    resume:
      "Valoriser les compétences acquises à l'international afin de contribuer activement au développement économique, social et entrepreneurial du Cameroun.",
    actions: [
      'Forums & conférences',
      'Entrepreneuriat & innovation',
      'Accompagnement de projets',
      "Réseau d'expertise",
      'Coopération & partenariats',
      'Contribution citoyenne',
    ],
  },
] as const;

const N = MISSIONS.length;

function ha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const sectionAnimations = `
@keyframes slide-bottom {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.slide-bottom {
  -webkit-animation: slide-bottom .5s cubic-bezier(.25,.46,.45,.94) both;
  animation: slide-bottom .5s cubic-bezier(.25,.46,.45,.94) both;
}
`;

export default function MissionsSectionPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [panelStep, setPanelStep] = useState(760);

  useEffect(() => {
    const section = sectionRef.current;
    const rightPane = rightPaneRef.current;
    if (!section || !rightPane) return;

    let raf = 0;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const nextProgress = total <= 0 ? 0 : Math.min(1, scrolled / total);
      const nextIndex = Math.min(N - 1, Math.round(nextProgress * (N - 1)));

      setProgress(nextProgress);
      setActiveIdx(nextIndex);

      const width = window.innerWidth;
      const nextPanelStep = Math.min(width * 0.58, 760);
      setPanelStep(nextPanelStep);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        update();
        raf = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <style>{sectionAnimations}</style>

      <section
        ref={sectionRef}
        className="relative bg-[#070f09] text-white md:h-[400vh]"
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_24%,rgba(11,143,58,0.18),transparent_28%),radial-gradient(circle_at_54%_42%,rgba(200,16,46,0.10),transparent_30%),radial-gradient(circle_at_86%_68%,rgba(247,198,0,0.12),transparent_30%)]" />

        <div className="sticky top-0 hidden h-screen overflow-hidden md:block">
          <div className="absolute left-0 right-0 top-0 z-40 h-[2px] bg-white/5">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg,#0B8F3A 0%,#C8102E 50%,#F7C600 100%)',
              }}
            />
          </div>

          <div className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-[clamp(1.5rem,3.5vw,4.5rem)] pt-[clamp(0.85rem,2vw,1.35rem)]">
            <div>
              <span className="mb-1 block text-[0.72rem] font-black uppercase tracking-[0.32em] text-emerald-400/70 md:text-[0.9rem]">
                Association SALAM
              </span>
              <h2 className="text-[clamp(1.15rem,1.8vw,1.75rem)] font-black tracking-[-0.03em] text-white">
                Nos Missions
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {MISSIONS.map((m, i) => (
                <div
                  key={m.num}
                  className="rounded-full transition-all duration-500 ease-out"
                  style={{
                    height: '0.32rem',
                    width: i === activeIdx ? '1.65rem' : '0.32rem',
                    background: i === activeIdx ? m.accent : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-[-2vw] right-[2vw] z-[1] select-none font-black leading-none tracking-[-0.08em] text-white/[0.035] transition-all duration-500 ease-out" style={{ fontSize: 'clamp(10rem,22vw,24rem)' }}>
            {MISSIONS[activeIdx].num}
          </div>

          <div className="relative z-10 grid h-full grid-cols-[minmax(420px,0.95fr)_minmax(0,1.05fr)] gap-[clamp(2.5rem,5vw,6rem)] px-[clamp(1.5rem,3.5vw,4.5rem)] pt-[clamp(4.25rem,8vh,5.75rem)] pb-[clamp(1rem,4vh,2rem)]">
            <StickyMissionStack activeIdx={activeIdx} />

            <div ref={rightPaneRef} className="relative min-w-0 overflow-hidden">
              <div
                className="absolute bottom-[15%] left-0 top-[15%] z-20 w-px slide-bottom"
                style={{ background: ha(MISSIONS[activeIdx].accent, 0.18) }}
              />

              

              <div className="relative h-full w-full">
                {MISSIONS.map((mission, index) => {
                  const arrivalGap = 340;
                  const maxTranslate = (N - 1) * (panelStep + arrivalGap);
                  const delayedOffset = index * 0.08;
                  const delayedProgress = Math.min(
                    1,
                    Math.max(0, (progress - delayedOffset) / (1 - delayedOffset))
                  );
                  const rawX = 20 + index * (panelStep + arrivalGap) - delayedProgress * maxTranslate;
                  const x = Math.max(25, rawX);

                  const topPinnedIndex = MISSIONS.reduce((latestPinnedIndex, _mission, missionIndex) => {
                    const missionDelayedOffset = missionIndex * 0.08;
                    const missionDelayedProgress = Math.min(
                      1,
                      Math.max(0, (progress - missionDelayedOffset) / (1 - missionDelayedOffset))
                    );
                    const missionRawX = 20 + missionIndex * (panelStep + arrivalGap) - missionDelayedProgress * maxTranslate;
                    return missionRawX <= 25 ? missionIndex : latestPinnedIndex;
                  }, -1);

                  const hiddenBehind = topPinnedIndex > index;
                  const visible = rawX < window.innerWidth;

                  return (
                    <MissionActionsPanel
                      key={mission.num}
                      mission={mission}
                      x={x}
                      zIndex={index + 1}
                      visible={visible}
                      hiddenBehind={hiddenBehind}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-5 px-4 py-14 md:hidden">
          {MISSIONS.map((mission) => (
            <MobileMissionCard key={mission.num} mission={mission} />
          ))}
        </div>
      </section>
    </>
  );
}

function StickyMissionStack({ activeIdx }: { activeIdx: number }) {
  return (
    <aside className="relative min-w-0 overflow-hidden">
      {MISSIONS.map((mission, index) => {
        const isActive = index === activeIdx;
        const isPast = index < activeIdx;
        const acc = mission.accent;

        return (
          <div
            key={mission.num}
            className="absolute inset-0 flex min-w-0 flex-col justify-center transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{
              zIndex: isActive ? 20 : index,
              opacity: isActive ? 1 : isPast ? 0 : 0,
              transform: isActive
                ? 'translate3d(0,0,0) scale(1)'
                : isPast
                  ? 'translate3d(0,-22px,0) scale(.985)'
                  : 'translate3d(0,38px,0) scale(.985)',
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            <div className="mb-[clamp(1rem,2vw,1.45rem)]">
              <span
                className="inline-flex items-center gap-2.5 rounded-full border border-current/25 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.2em] md:px-5 md:py-2.5 md:text-[0.78rem]"
                style={{ background: ha(acc, 0.09), color: acc }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: acc }} />
                {mission.badge}
              </span>
            </div>

            <h3
              className="font-black text-white"
              style={{
                fontSize: 'clamp(2.15rem,5.2vw,5.5rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.045em',
                marginBottom: 'clamp(1rem,2vw,1.35rem)',
                maxWidth: mission.num === '04' ? '12ch' : '14ch',
              }}
            >
              <span>
                {mission.num === '02' ? (
                  <>
                    <span>Insertion</span>
                    <br />
                    <span style={{ color: acc }}>socio‑</span>
                  </>
                ) : (
                  mission.lines[0]
                )}
              </span>
              <br />
              <span style={{ color: acc }}>{mission.lines[1]}</span>
            </h3>

            <div className="mb-[clamp(1rem,2vw,1.4rem)] flex items-center gap-2">
              <div className="h-[2px] w-10 rounded-full" style={{ background: acc }} />
              <div className="h-[2px] w-3 rounded-full" style={{ background: ha(acc, 0.38) }} />
            </div>

            <p className="max-w-[42ch] text-[clamp(0.9rem,1.08vw,1.08rem)] leading-[1.9] text-white/58 md:text-[1.05rem]">
              {mission.resume}
            </p>
          </div>
        );
      })}
    </aside>
  );
}

function MissionActionsPanel({
  mission,
  x,
  zIndex,
  visible,
  hiddenBehind,
}: {
  mission: (typeof MISSIONS)[number];
  x: number;
  zIndex: number;
  visible: boolean;
  hiddenBehind: boolean;
}) {
  const acc = mission.accent;

  return (
    <article
      className="absolute top-0 flex h-full w-[min(58vw,760px)] shrink-0 items-center pr-[clamp(1.5rem,3vw,3rem)] transition-transform duration-75 ease-linear will-change-transform"
      style={{
        zIndex: zIndex,
        transform: `translate3d(${x}px, 0, 0)`,
        opacity: hiddenBehind ? 0 : visible ? 1 : 0,
        visibility: hiddenBehind ? 'hidden' : 'visible',
      }}
    >
      <div className="w-full rounded-[clamp(1.4rem,3vw,2.25rem)] border border-white/10 bg-white/[0.06] backdrop-blur-xl p-[clamp(1.2rem,2vw,2.2rem)] shadow-[0_26px_90px_rgba(0,0,0,0.22)] lg:p-[2.2rem]">
        <div className="mb-[clamp(1rem,2vw,1.35rem)]">
          <p className="text-[clamp(0.95rem,1.15vw,1.15rem)] font-semibold leading-snug text-white/72">
            Comment cette mission
            <br />
            <span className="font-black text-white">se concrétise&nbsp;?</span>
          </p>
        </div>

        <div className="mb-[clamp(1rem,2vw,1.35rem)] h-px w-8 rounded-full" style={{ background: ha(acc, 0.48) }} />

        <ul className="m-0 grid list-none gap-2.5 p-0 lg:grid-cols-2">
          {mission.actions.map((action) => (
            <li key={action} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 backdrop-blur-md">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: acc, opacity: 0.9 }} />
              <span className="text-[clamp(0.86rem,0.98vw,0.98rem)] font-medium leading-snug tracking-[0.005em] text-white/62 md:text-[1rem]">
                {action}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(1.2rem,2vw,1.8rem)] text-[0.5rem] font-black uppercase tracking-[0.28em] text-white/12">
          {mission.num}&ensp;/&ensp;{String(N).padStart(2, '0')}
        </div>
      </div>
    </article>
  );
}

function MobileMissionCard({ mission }: { mission: (typeof MISSIONS)[number] }) {
  const acc = mission.accent;

  return (
    <article className="rounded-[1.75rem] bg-white/[0.035] p-5">
      <span
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-current/25 px-4 py-2 text-[0.7rem] font-black uppercase tracking-[0.18em]"
        style={{ background: ha(acc, 0.09), color: acc }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: acc }} />
        {mission.badge}
      </span>

      <h3 className="text-[clamp(2rem,12vw,3.4rem)] font-black leading-[0.92] tracking-[-0.045em] text-white">
        {mission.num === '02' ? (
          <>
            Insertion
            <br />
            <span style={{ color: acc }}>socio‑</span>
            <br />
            <span style={{ color: acc }}>professionnelle</span>
          </>
        ) : (
          <>
            {mission.lines[0]}
            <br />
            <span style={{ color: acc }}>{mission.lines[1]}</span>
          </>
        )}
      </h3>

      <p className="mt-5 text-sm leading-7 text-white/62">{mission.resume}</p>

      <div className="my-5 h-px w-8 rounded-full" style={{ background: ha(acc, 0.48) }} />

      <ul className="grid gap-2.5">
        {mission.actions.map((action) => (
          <li key={action} className="flex items-center gap-3 rounded-2xl bg-black/10 px-3.5 py-3">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: acc }} />
            <span className="text-sm font-medium text-white/62">{action}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

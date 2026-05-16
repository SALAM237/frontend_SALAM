"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const MISSIONS = [
  {
    num: "01",
    badge: "Mission 1",
    lines: ["Préparer les", "futurs étudiants"],
    accent: "#0B8F3A",
    resume:
      "Informer, orienter et accompagner les nouveaux bacheliers camerounais souhaitant poursuivre leurs études supérieures au Maroc.",
    actions: [
      "Réunions d'information",
      "Orientation académique",
      "Préparation administrative",
      "Vie étudiante au Maroc",
      "Mise en relation",
      "Accompagnement avant le départ",
    ],
  },
  {
    num: "02",
    badge: "Mission 2",
    lines: ["Insertion socio-", "professionnelle"],
    accent: "#C8102E",
    resume:
      "Accompagner les étudiants camerounais formés au Maroc dans leur retour au Cameroun et faciliter leur intégration socioprofessionnelle.",
    actions: [
      "Préparation au retour",
      "Orientation professionnelle",
      "Mise en relation avec les entreprises",
      "Forums & networking",
      "Accompagnement carrière",
      "Réseau Alumni",
    ],
  },
  {
    num: "03",
    badge: "Mission 3",
    lines: ["Solidarité &", "action sociale"],
    accent: "#F7C600",
    resume:
      "Promouvoir la solidarité, l'entraide et l'action sociale en faveur des étudiants et des populations les plus vulnérables.",
    actions: [
      "Actions solidaires",
      "Soutien aux personnes vulnérables",
      "Fundraising & collectes",
      "Aide humanitaire",
      "Mobilisation citoyenne",
      "Partenariats sociaux",
    ],
  },
  {
    num: "04",
    badge: "Mission 4",
    lines: ["Développement", "du Cameroun"],
    accent: "#3B82F6",
    resume:
      "Valoriser les compétences acquises à l'international afin de contribuer activement au développement économique, social et entrepreneurial du Cameroun.",
    actions: [
      "Forums & conférences",
      "Entrepreneuriat & innovation",
      "Accompagnement de projets",
      "Réseau d'expertise",
      "Coopération & partenariats",
      "Contribution citoyenne",
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
  animation: slide-bottom .5s cubic-bezier(.25,.46,.45,.94) both;
}

@keyframes fade-in-left {
  0%   { transform: translateX(-50px); opacity: 0; }
  100% { transform: translateX(0);     opacity: 1; }
}
.fade-in-left {
  -webkit-animation: fade-in-left 1.2s cubic-bezier(.39,.575,.565,1.000) both;
          animation: fade-in-left 1.2s cubic-bezier(.39,.575,.565,1.000) both;
}

@keyframes fade-in-right {
  0%   { transform: translateX(50px); opacity: 0; }
  100% { transform: translateX(0);    opacity: 1; }
}
.fade-in-right {
  -webkit-animation: fade-in-right 1.2s cubic-bezier(.39,.575,.565,1.000) both;
          animation: fade-in-right 1.2s cubic-bezier(.39,.575,.565,1.000) both;
}
`;

export default function MissionsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [panelStep, setPanelStep] = useState(760);
  const [mobilePanelStep, setMobilePanelStep] = useState(420);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTitleAnimated(true); io.disconnect(); } },
      { threshold: 0.10 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const holdDistance = window.innerHeight * 0.8;
      const animTotal = Math.max(0, total - holdDistance);
      const scrolled = Math.max(0, -rect.top);
      const nextProgress = animTotal <= 0 ? 0 : Math.min(1, scrolled / animTotal);
      const nextIndex = Math.min(N - 1, Math.round(nextProgress * (N - 1)));

      setProgress(nextProgress);
      setActiveIdx(nextIndex);
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({ width, height });
      setPanelStep(Math.min(width * 0.58, 760));
      setMobilePanelStep(Math.min(height * 0.48, 440));
    };

    const onScroll = () => {
      if (raf) return;

      raf = requestAnimationFrame(() => {
        update();
        raf = 0;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <style>{sectionAnimations}</style>

      <section
        ref={sectionRef}
        id="missions-section"
        className="relative h-[500svh] bg-[#070f09] text-white"
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_24%,rgba(11,143,58,0.18),transparent_28%),radial-gradient(circle_at_54%_42%,rgba(200,16,46,0.10),transparent_30%),radial-gradient(circle_at_86%_68%,rgba(247,198,0,0.12),transparent_30%)]" />

        <div className="pointer-events-none absolute inset-0 z-[1] hidden lg:block">
          <div
            className="absolute left-[-10%] top-[12%] h-[22rem] w-[22rem] rounded-full blur-3xl"
            style={{ background: ha('#0B8F3A', 0.14) }}
          />

          <div
            className="absolute left-[8%] bottom-[10%] h-[16rem] w-[16rem] rounded-full blur-3xl"
            style={{ background: ha('#C8102E', 0.12) }}
          />

          <div
            className="absolute right-[-8%] top-[10%] h-[24rem] w-[24rem] rounded-full blur-3xl"
            style={{ background: ha('#F7C600', 0.12) }}
          />

          <div
            className="absolute right-[6%] bottom-[8%] h-[18rem] w-[18rem] rounded-full blur-3xl"
            style={{ background: ha('#3B82F6', 0.10) }}
          />

          <div
            className="absolute right-[14%] top-[24%] h-40 w-40 rounded-full blur-2xl"
            style={{ background: ha(MISSIONS[activeIdx].accent, 0.10) }}
          />
        </div>

        <div className="pointer-events-none absolute right-[-10%] top-[8%] z-[1] flex flex-col gap-[30vh] lg:hidden">
          {MISSIONS.map((mission, index) => {
            const isActive = index === activeIdx;

            return (
              <div
                key={mission.num}
                className="relative transition-all duration-700 ease-out"
                style={{
                  opacity: isActive ? 0.80 : 0.16,
                  transform: `scale(${isActive ? 0.82 : 0.75})`,
                }}
              >
                <div
                  className="h-[16rem] w-[16rem] rounded-full blur-3xl md:h-[20rem] md:w-[20rem]"
                  style={{
                    background: ha(mission.accent, isActive ? 0.28 : 0.11),
                  }}
                />

                <div
                  className="absolute right-[10%] top-[18%] h-22 w-22 rounded-full blur-2xl"
                  style={{
                    background: ha(mission.accent, isActive ? 0.20 : 0.09),
                  }}
                />
              </div>
            );
          })}
        </div>

        

        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#070f09]">
          <div className="absolute left-0 right-0 top-0 z-40 h-[2px] bg-white/5">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress * 100}%`,
                background:
                  "linear-gradient(90deg,#0B8F3A 0%,#C8102E 50%,#F7C600 100%)",
              }}
            />
          </div>

          <div className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-[7%] pt-[clamp(1.35rem,3vw,2.2rem)] lg:px-[clamp(1rem,3.5vw,4.5rem)] lg:pt-[clamp(0.8rem,2vw,1.35rem)]">
            <div>
              
              <h2 className={`text-[clamp(1rem,1.8vw,1.75rem)] font-black tracking-[-0.03em] text-white ${titleAnimated ? 'fade-in-left' : 'opacity-0'}`}>
                Nos Missions
              </h2>
              <div
                className={`mt-1 h-[2px] w-[45%] rounded-full transition-all duration-500 ${titleAnimated ? 'fade-in-right' : 'opacity-0'}`}
                style={{ animationDelay: titleAnimated ? '0.2s' : undefined, background: MISSIONS[activeIdx].accent } as React.CSSProperties}
              />
            </div>

            <div className="flex items-center gap-2">
              {MISSIONS.map((m, i) => (
                <div
                  key={m.num}
                  className="rounded-full transition-all duration-500 ease-out"
                  style={{
                    height: "0.32rem",
                    width: i === activeIdx ? "1.65rem" : "0.32rem",
                    background:
                      i === activeIdx ? m.accent : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Chiffre — desktop uniquement */}
          <div
            className="pointer-events-none absolute bottom-[-2vw] right-[2vw] z-[1] hidden select-none font-black leading-none tracking-[-0.08em] text-white/[0.035] transition-all duration-500 ease-out lg:block"
            style={{ fontSize: "clamp(7rem,22vw,24rem)" }}
          >
            {MISSIONS[activeIdx].num}
          </div>

          {/* Chiffre + Voir tout — mobile uniquement */}
          <div className="pointer-events-none absolute right-[4%] top-[3rem] z-40 flex flex-col items-end lg:hidden">
            <div
              className="select-none font-black leading-none tracking-[-0.08em] text-white/[0.035] transition-all duration-500 ease-out"
              style={{ fontSize: "clamp(7rem,22vw,24rem)" }}
            >
              {MISSIONS[activeIdx].num}
            </div>
            <Link
              href={`/missions?m=${{ "01": "preparer", "02": "insertion", "03": "solidarite", "04": "developpement" }[MISSIONS[activeIdx].num]}`}
              className="pointer-events-auto -mt-1 inline-flex items-center gap-1.5 text-xs font-black tracking-[0.04em] transition-opacity duration-200 hover:opacity-70"
              style={{ color: MISSIONS[activeIdx].accent }}
            >
              Voir tout
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <DesktopMissionsView
            progress={progress}
            activeIdx={activeIdx}
            panelStep={panelStep}
            viewportWidth={viewport.width}
          />

          <MobileTabletMissionsView
            progress={progress}
            activeIdx={activeIdx}
            panelStep={mobilePanelStep}
            viewportHeight={viewport.height}
          />
        </div>
      </section>
    </>
  );
}

function DesktopMissionsView({
  progress,
  activeIdx,
  panelStep,
  viewportWidth,
}: {
  progress: number;
  activeIdx: number;
  panelStep: number;
  viewportWidth: number;
}) {
  return (
    <div className="relative z-10 hidden h-full grid-cols-[minmax(420px,0.95fr)_minmax(0,1.05fr)] gap-[clamp(2.5rem,5vw,6rem)] px-[clamp(1.5rem,3.5vw,4.5rem)] pt-[clamp(4.25rem,8vh,5.75rem)] pb-[clamp(1rem,4vh,2rem)] lg:grid">
      <StickyMissionStack activeIdx={activeIdx} />

      <div className="relative min-w-0 overflow-hidden">
        <div
          className="absolute bottom-[15%] left-0 top-[15%] z-20 w-px slide-bottom"
          style={{ background: ha(MISSIONS[activeIdx].accent, 0.18) }}
        />

        <div className="relative h-full w-full">
          {MISSIONS.map((mission, index) => {
            const arrivalGap = 260;
            const pinX = 25;
            const startX = 20;
            const maxTranslate = (N - 1) * (panelStep + arrivalGap);
            const DELAYS = [0, 0.14, 0.34, 0.54];
            const delayedOffset = DELAYS[index];
            const delayedProgress = Math.min(
              1,
              Math.max(0, (progress - delayedOffset) / (1 - delayedOffset))
            );

            const rawX =
              startX + index * (panelStep + arrivalGap) - delayedProgress * maxTranslate;
            const x = Math.max(pinX, rawX);

            const topPinnedIndex = MISSIONS.reduce(
              (latestPinnedIndex, _mission, missionIndex) => {
                const missionDelayedOffset = DELAYS[missionIndex];
                const missionDelayedProgress = Math.min(
                  1,
                  Math.max(
                    0,
                    (progress - missionDelayedOffset) / (1 - missionDelayedOffset)
                  )
                );
                const missionRawX =
                  startX +
                  missionIndex * (panelStep + arrivalGap) -
                  missionDelayedProgress * maxTranslate;

                return missionRawX <= pinX ? missionIndex : latestPinnedIndex;
              },
              -1
            );

            return (
              <MissionActionsPanel
                key={mission.num}
                mission={mission}
                x={x}
                y={0}
                zIndex={index + 1}
                visible={rawX < viewportWidth}
                hiddenBehind={topPinnedIndex > index}
                orientation="horizontal"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileTabletMissionsView({
  progress,
  activeIdx,
  panelStep,
  viewportHeight,
}: {
  progress: number;
  activeIdx: number;
  panelStep: number;
  viewportHeight: number;
}) {
  return (
    <div className="relative z-10 flex h-[100svh] flex-col px-[4%] pt-[clamp(4.5rem,9vh,5.8rem)] pb-0 lg:hidden">
      <div className="relative mx-auto min-h-[28svh] w-[92%] max-w-[32rem] shrink-0 overflow-hidden">
        <StickyMissionStack activeIdx={activeIdx} compact />
      </div>

      <div className="relative my-1.5 h-px shrink-0 overflow-visible bg-white/10">
        <div
          className="absolute left-0 top-0 h-px w-full slide-bottom"
          style={{ background: ha(MISSIONS[activeIdx].accent, 0.28) }}
        />
      </div>

      <div className="relative min-h-0 flex-1 self-stretch overflow-visible">
        {MISSIONS.map((mission, index) => {
          const arrivalGap = 110;
          const pinY = 5;
          const startY = pinY;
          const stickyHold = 0.12;
          const endProgress = 1 - stickyHold;
          const maxTranslate = (N - 1) * (panelStep + arrivalGap);
          const DELAYS = [0, 0.14, 0.34, 0.54];
          const delayedOffset = DELAYS[index];
          const delayedProgress = Math.min(
            1,
            Math.max(0, (progress - delayedOffset) / Math.max(0.001, endProgress - delayedOffset))
          );

          const rawY =
            startY + index * (panelStep + arrivalGap) - delayedProgress * maxTranslate;
          const y = Math.max(pinY, rawY);

          const topPinnedIndex = MISSIONS.reduce(
            (latestPinnedIndex, _mission, missionIndex) => {
              const missionDelayedOffset = DELAYS[missionIndex];
              const missionDelayedProgress = Math.min(
                1,
                Math.max(
                  0,
                  (progress - missionDelayedOffset) / (1 - missionDelayedOffset)
                )
              );
              const missionRawY =
                startY +
                missionIndex * (panelStep + arrivalGap) -
                missionDelayedProgress * maxTranslate;

              return missionRawY <= pinY ? missionIndex : latestPinnedIndex;
            },
            -1
          );

          return (
            <MissionActionsPanel
              key={mission.num}
              mission={mission}
              x={0}
              y={y}
              zIndex={index + 1}
              visible={rawY < viewportHeight}
              hiddenBehind={topPinnedIndex > index}
              orientation="vertical"
            />
          );
        })}
      </div>
    </div>
  );
}

function StickyMissionStack({
  activeIdx,
  compact = false,
}: {
  activeIdx: number;
  compact?: boolean;
}) {
  return (
    <aside className="relative h-full min-w-0 overflow-hidden mobile-mission-stack">
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
              opacity: isActive ? 1 : 0,
              transform: isActive
                ? "translate3d(0,0,0) scale(1)"
                : isPast
                  ? "translate3d(0,-22px,0) scale(.985)"
                  : "translate3d(0,38px,0) scale(.985)",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <div className="mb-[clamp(0.75rem,1.6vw,1.45rem)]">
              <span
                className="inline-flex items-center gap-2.5 rounded-full border border-current/25 px-3.5 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.18em] md:px-4 md:py-2 md:text-[0.7rem] lg:px-5 lg:py-2.5 lg:text-[0.78rem]"
                style={{ background: ha(acc, 0.09), color: acc }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: acc }}
                />
                {mission.badge}
              </span>
            </div>

            <h3
              className="font-black text-white"
              style={{
                fontSize: compact
                  ? "clamp(1.8rem,8vw,4.6rem)"
                  : "clamp(2.15rem,5.2vw,5.5rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                marginBottom: compact
                  ? "clamp(0.75rem,1.8vw,1.15rem)"
                  : "clamp(1rem,2vw,1.35rem)",
                maxWidth: mission.num === "04" ? "12ch" : "14ch",
                ...(!compact && {
                  transform: isActive ? "translateY(0)" : "translateY(14px)",
                  transition: "transform 0.65s cubic-bezier(.22,1,.36,1)",
                  transitionDelay: isActive ? "0.1s" : "0s",
                }),
              }}
            >
              {mission.num === "02" ? (
                <>
                  <span>Insertion</span>
                  <br />
                  <span style={{ color: acc }} className="max-lg:text-[1.3rem]">socio-professionnelle</span>
                </>
              ) : (
                <>
                  {mission.lines[0]}
                  <br />
                  <span style={{ color: acc }}>{mission.lines[1]}</span>
                </>
              )}
            </h3>

            <div className="mb-[clamp(0.8rem,1.8vw,1.35rem)] flex items-center gap-2">
              <div
                className="h-[2px] w-10 rounded-full"
                style={{ background: acc }}
              />
              <div
                className="h-[2px] w-3 rounded-full"
                style={{ background: ha(acc, 0.38) }}
              />
            </div>

            <p className="max-w-[50ch] text-[clamp(0.82rem,2.3vw,1.05rem)] leading-[1.72] text-white/60 lg:max-w-[42ch] lg:leading-[1.9]">
              {mission.resume}
            </p>

            <Link
              href={`/missions?m=${{ "01": "preparer", "02": "insertion", "03": "solidarite", "04": "developpement" }[mission.num]}`}
              className="mt-[clamp(0.8rem,1.8vw,1.2rem)] hidden items-center gap-1.5 text-[clamp(0.78rem,1.5vw,0.88rem)] font-black tracking-[0.04em] transition-opacity duration-200 hover:opacity-70 lg:inline-flex"
              style={{ color: acc }}
            >
              Voir tout
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        );
      })}
    </aside>
  );
}

function MissionActionsPanel({
  mission,
  x,
  y,
  zIndex,
  visible,
  hiddenBehind,
  orientation,
}: {
  mission: (typeof MISSIONS)[number];
  x: number;
  y: number;
  zIndex: number;
  visible: boolean;
  hiddenBehind: boolean;
  orientation: "horizontal" | "vertical";
}) {
  const acc = mission.accent;

  return (
    <article
      className={
        orientation === "horizontal"
          ? "absolute top-0 flex h-full w-[min(58vw,760px)] shrink-0 items-center pr-[clamp(1.5rem,3vw,3rem)] lg:w-[min(54vw,720px)] transition-[transform,opacity] duration-300 ease-out will-change-transform"
          : "absolute left-0 right-0 top-0 mx-auto flex h-auto w-[92%] max-w-[32rem] items-start transition-[transform,opacity] duration-300 ease-out will-change-transform"
      }
      style={{
        zIndex,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        opacity: hiddenBehind ? 0 : visible ? 1 : 0,
        visibility: hiddenBehind ? "hidden" : "visible",
      }}
    >
      <div
        className="w-full rounded-[clamp(1.1rem,3vw,2.25rem)] border p-[clamp(0.9rem,2.6vw,2rem)] shadow-[0_24px_90px_rgba(0,0,0,0.2)] lg:backdrop-blur-xl lg:p-[2.2rem]"
        style={{
          background: orientation === 'vertical' ? 'rgba(10,25,14,0.85)' : 'rgba(255,255,255,0.06)',
          borderColor: ha(acc, 0.18),
        }}
      >
        <div className="mb-[clamp(0.9rem,2vw,1.35rem)]">
          <p className="text-[clamp(0.9rem,2.4vw,1.15rem)] font-semibold leading-snug text-white/72 lg:text-[0.88rem]">
            {orientation === "vertical" ? (
              <>
                Comment cette mission <span className="font-black text-white">se concrétise&nbsp;?</span>
              </>
            ) : (
              <>
                Comment cette mission
                <br />
                <span className="font-black text-white">se concrétise&nbsp;?</span>
              </>
            )}
          </p>
        </div>

        <div
          className="mb-[clamp(0.9rem,2vw,1.35rem)] h-px w-8 rounded-full"
          style={{ background: ha(acc, 0.48) }}
        />

        <ul className="m-0 grid list-none gap-1.5 p-0 sm:grid-cols-2 lg:gap-2">
          {mission.actions.map((action) => (
            <li
              key={action}
              className="mx-auto flex min-w-0 w-[82%] items-center gap-2 rounded-[0.9rem] border px-2 py-2.5 backdrop-blur-md md:w-full md:px-3 md:py-3"
              style={{
                background: orientation === 'vertical' ? 'rgba(0,0,0,0.20)' : 'rgba(0,0,0,0.25)',
                borderColor: ha(acc, 0.22),
              }}
            >
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: acc, opacity: 0.9 }}
              />
              <span className="text-[clamp(0.82rem,2.3vw,0.95rem)] font-medium leading-snug tracking-[0.005em] text-white/68 lg:text-[0.98rem]">
                {action}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(1rem,2vw,1.8rem)] text-[0.5rem] font-black uppercase tracking-[0.28em] text-white/12">
          {mission.num}&ensp;/&ensp;{String(N).padStart(2, "0")}
        </div>
      </div>
    </article>
  );
}

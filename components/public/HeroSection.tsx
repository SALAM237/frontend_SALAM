'use client';
import { useState } from 'react';
import Link from 'next/link';

type IconProps = {
  className?: string;
};

function ArrowUpRightIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7H17V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.5 9H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 5H17.5C18.6046 5 19.5 5.89543 19.5 7V18C19.5 19.1046 18.6046 20 17.5 20H6.5C5.39543 20 4.5 19.1046 4.5 18V7C4.5 5.89543 5.39543 5 6.5 5Z" stroke="currentColor" strokeWidth="2" />
      <path d="M8 13H8.01M12 13H12.01M16 13H16.01M8 17H8.01M12 17H12.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function GraduationCapIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9L12 4L21 9L12 14L3 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 11.5V16C7 17.7 9.2 19 12 19C14.8 19 17 17.7 17 16V11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeartHandshakeIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20S4 15.2 4 8.8C4 6.2 6 4.5 8.3 4.5C9.7 4.5 11 5.2 12 6.3C13 5.2 14.3 4.5 15.7 4.5C18 4.5 20 6.2 20 8.8C20 15.2 12 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 13L10 11L12 13L14 11L16 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 19C16 16.8 14.2 15 12 15H8C5.8 15 4 16.8 4 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 12C12.2091 12 14 10.2091 14 8C14 5.79086 12.2091 4 10 4C7.79086 4 6 5.79086 6 8C6 10.2091 7.79086 12 10 12Z" stroke="currentColor" strokeWidth="2" />
      <path d="M20 19C20 17.2 18.8 15.7 17.2 15.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 4.5C18.1 5.1 19 6.4 19 8C19 9.6 18.1 10.9 16.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SparklesIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 16L5.6 17.4L7 18L5.6 18.6L5 20L4.4 18.6L3 18L4.4 17.4L5 16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

const navItems = [
  { label: "Accueil",      href: "/" },
  { label: "À propos",     href: "/a-propos" },
  { label: "Missions",     href: "/missions" },
  { label: "Activités",    href: "/activites" },
  { label: "Actualités",   href: "/actualites" },
  { label: "Contact",      href: "/contact" },
];

export function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative mx-3 my-3 overflow-hidden rounded-2xl lg:rounded-[2.5rem] bg-[#06130b] px-[clamp(1rem,3vw,3rem)] py-[clamp(0.8rem,2vw,1.5rem)] text-white" style={{ height: 'calc(100vh - 1.5rem)', minHeight: 'calc(100svh - 1.5rem)' }}>

      {/* ── Video background ── */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/videos/hero-bg.mp4#t=0.1" type="video/mp4" />
      </video>

      {/* ── Overlays ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-emerald-950/[0.78] via-emerald-950/[0.48] to-black/[0.18]" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/[0.62] via-black/[0.05] to-black/25" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_18%_24%,rgba(250,204,21,0.14),transparent_30%),radial-gradient(circle_at_82%_30%,rgba(220,38,38,0.12),transparent_34%)]" />

      {/* ── Decorative bottom curves ── */}
      <div className="pointer-events-none absolute bottom-[-18rem] left-[-14rem] z-10 h-[30rem] w-[62rem] rotate-6 rounded-[100%] bg-emerald-700/20 blur-[1px]" />
      <div className="pointer-events-none absolute bottom-[-16rem] right-[-16rem] z-10 h-[27rem] w-[66rem] -rotate-6 rounded-[100%] bg-red-600/[0.16] blur-[1px]" />
      <div className="pointer-events-none absolute bottom-[-18rem] right-[-8rem] z-10 h-[24rem] w-[52rem] -rotate-3 rounded-[100%] bg-yellow-400/[0.18] blur-[1px]" />

      {/* ── Navbar ── */}
      <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl md:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Accueil SALAM">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/logo_salam_wbg.png"
            alt="Logo SALAM"
            className="h-10 w-10 shrink-0 rounded-full object-cover shadow-md"
          />
          <div className="min-w-0 leading-tight">
            <p className="hidden text-[0.78rem] font-black tracking-[0.18em] text-white lg:block">SALAM</p>
            <p className="hidden text-[0.68rem] font-semibold text-white/70 lg:block">Cameroun • Maroc</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-[0.92rem] font-semibold text-white/80 lg:flex" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href === "/" ? "text-yellow-300" : "transition hover:text-yellow-300"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop: Rejoindre SALAM */}
          <Link href="/adhesion" className="hidden items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-emerald-950/40 transition hover:-translate-y-0.5 hover:bg-emerald-700 lg:inline-flex">
            <UsersIcon className="h-4 w-4" /> Rejoindre SALAM
          </Link>

          {/* Mobile: burger 2 traits */}
          <button
            className="flex flex-col gap-[5px] rounded-lg p-2 transition hover:bg-white/10 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span className="block h-0.5 w-5 rounded-full bg-white transition-all" />
            <span className="block h-0.5 w-5 rounded-full bg-white transition-all" />
          </button>
        </div>
      </header>

      {/* ── Mobile menu panel ── */}
      {menuOpen && (
        <div className="absolute left-[clamp(1rem,3vw,3rem)] right-[clamp(1rem,3vw,3rem)] top-[4rem] z-40 rounded-2xl border border-white/20 bg-emerald-950/92 p-5 shadow-2xl backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition ${item.href === "/" ? "text-yellow-300" : "text-white/80 hover:text-yellow-300"}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-white/15 pt-4">
            <Link
              href="/adhesion"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-bold text-white shadow-xl transition hover:bg-emerald-700"
              onClick={() => setMenuOpen(false)}
            >
              <UsersIcon className="h-4 w-4" /> Rejoindre SALAM
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero content ── */}
      <div className="relative z-20 mx-auto flex h-[calc(100svh-5rem)] max-w-7xl items-center">
        <div className="max-w-[680px] pt-[clamp(0.4rem,1.5vw,1rem)] text-center lg:text-left">

          {/* Pills badge */}
          <div className="mb-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.12] px-2.5 py-1 text-[0.6rem] font-bold text-white shadow-lg backdrop-blur-xl lg:gap-2.5 lg:px-3 lg:py-1.5 lg:text-xs">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 lg:h-2 lg:w-2" /> Solidarité</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500 lg:h-2 lg:w-2" /> Engagement</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-300 lg:h-2 lg:w-2" /> Réussite</span>
          </div>

          {/* H1 */}
          <h1 className="mx-auto max-w-4xl text-[clamp(1.6rem,3.8vw,3.6rem)] font-black leading-[0.93] tracking-[-0.06em] text-white drop-shadow-[0_18px_50px_rgba(0,0,0,0.55)] lg:mx-0">
            <span className="block">Ensemble,</span>
            <span className="block">construisons</span>
            <span className="block">notre avenir.</span>
            <span className="mt-3 block tracking-[0.035em]">
              <span className="text-emerald-300">S</span>
              <span className="text-red-400">A</span>
              <span className="text-yellow-300">L</span>
              <span className="text-red-400">A</span>
              <span className="text-emerald-300">M</span>
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-xl text-[0.75rem] leading-6 text-white/[0.82] drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] lg:mx-0 lg:mt-5 lg:text-[clamp(0.92rem,1.15vw,1.02rem)] lg:leading-7">
            Une communauté d&apos;anciens étudiants camerounais du Maroc engagée pour accompagner les plus jeunes, favoriser l&apos;intégration professionnelle et contribuer au développement du Cameroun.
          </p>

          {/* CTAs */}
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:items-stretch lg:mt-6 lg:gap-3 lg:justify-start">
            <Link href="/adhesion" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-[0.75rem] font-extrabold text-white shadow-2xl shadow-emerald-950/35 transition hover:-translate-y-0.5 lg:gap-2 lg:px-5 lg:py-2.5 lg:text-[0.92rem]">
              Devenir membre <ArrowUpRightIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </Link>
            <Link href="/activites" className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/[0.14] px-4 py-2 text-[0.75rem] font-extrabold text-white shadow-xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.22] lg:gap-2 lg:px-5 lg:py-2.5 lg:text-[0.92rem]">
              Voir les activités <CalendarIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </Link>
          </div>

          {/* Info cards — mobile only, below CTAs */}
          <div className="mt-16 grid grid-cols-3 gap-2 lg:hidden">
            <div className="rounded-xl border border-white/[0.18] bg-white/10 p-2.5 backdrop-blur-xl">
              <UsersIcon className="mx-auto mb-1 block h-3.5 w-3.5 text-emerald-300" />
              <p className="text-center text-[0.65rem] font-black leading-tight text-white">Réseau</p>
              <p className="mt-0.5 text-center text-[0.55rem] font-medium leading-snug text-white/60">Anciens & partenaires</p>
            </div>
            <div className="rounded-xl border border-white/[0.18] bg-white/10 p-2.5 backdrop-blur-xl">
              <GraduationCapIcon className="mx-auto mb-1 block h-3.5 w-3.5 text-yellow-300" />
              <p className="text-center text-[0.65rem] font-black leading-tight text-white">Réussite</p>
              <p className="mt-0.5 text-center text-[0.55rem] font-medium leading-snug text-white/60">Diplôme & carrière</p>
            </div>
            <div className="rounded-xl border border-white/[0.18] bg-white/10 p-2.5 backdrop-blur-xl">
              <HeartHandshakeIcon className="mx-auto mb-1 block h-3.5 w-3.5 text-red-300" />
              <p className="text-center text-[0.65rem] font-black leading-tight text-white">Transmission</p>
              <p className="mt-0.5 text-center text-[0.55rem] font-medium leading-snug text-white/60">Conseil, suivi & accompagnement</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Info cards — bottom right, contained inside section ── */}
      <div className="absolute bottom-[clamp(1.5rem,2.5vh,2rem)] right-[clamp(1rem,4vw,3rem)] z-20 hidden w-[clamp(22rem,28vw,32rem)] grid-cols-3 gap-2.5 lg:grid">
        <div className="rounded-2xl border border-white/[0.18] bg-white/10 p-3 backdrop-blur-xl">
          <UsersIcon className="mx-auto mb-1.5 block h-4 w-4 text-emerald-300" />
          <p className="text-center text-sm font-black leading-tight text-white">Réseau</p>
          <p className="mt-1 text-center text-[0.68rem] font-medium leading-snug text-white/70">Anciens, étudiants et partenaires</p>
        </div>
        <div className="rounded-2xl border border-white/[0.18] bg-white/10 p-3 backdrop-blur-xl">
          <GraduationCapIcon className="mx-auto mb-1.5 block h-4 w-4 text-yellow-300" />
          <p className="text-center text-sm font-black leading-tight text-white">Réussite</p>
          <p className="mt-1 text-center text-[0.68rem] font-medium leading-snug text-white/70">Études, diplôme, carrière</p>
        </div>
        <div className="rounded-2xl border border-white/[0.18] bg-white/10 p-3 backdrop-blur-xl">
          <HeartHandshakeIcon className="mx-auto mb-1.5 block h-4 w-4 text-red-300" />
          <p className="text-center text-sm font-black leading-tight text-white">Transmission</p>
          <p className="mt-1 text-center text-[0.68rem] font-medium leading-snug text-white/70">Conseil, suivi & accompagnement</p>
        </div>
      </div>
    </section>
  );
}

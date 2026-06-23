import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Crumb { label: string; href?: string; }

interface PageHeroProps {
  badge?: string;
  title: string;
  accentWord?: string;
  accentPosition?: 'start' | 'end';
  subtitle?: string;
  breadcrumbs?: Crumb[];
  accentColor?: 'green' | 'red' | 'yellow';
  children?: React.ReactNode;
}

export function PageHero({
  badge,
  title,
  accentWord,
  accentPosition = 'start',
  subtitle,
  breadcrumbs,
  accentColor = 'green',
  children,
}: PageHeroProps) {
  const accent = { green: 'text-emerald-400', red: 'text-red-400', yellow: 'text-yellow-300' }[accentColor];

  const renderTitle = () => {
    if (!accentWord) return <span className="text-white">{title}</span>;
    return accentPosition === 'start' ? (
      <><span className={accent}>{accentWord}</span>{' '}<span className="text-white">{title}</span></>
    ) : (
      <><span className="text-white">{title}</span>{' '}<span className={accent}>{accentWord}</span></>
    );
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#061009] px-5 pb-[clamp(2.25rem,4.5vw,3.8rem)] pt-[clamp(1.5rem,3vw,2.5rem)] md:px-8 lg:px-12">
      {/* Motif ornemental ndop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.15] md:opacity-[0.12]"
        style={{
          backgroundImage: "url('/images/placeholders/ndop motif WBG.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="pointer-events-none absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6%] bottom-[-10%] h-64 w-64 rounded-full bg-yellow-500/6 blur-3xl" />
      <div className="pointer-events-none absolute left-[40%] top-[20%] h-48 w-48 rounded-full bg-red-500/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {breadcrumbs && (
          <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-white/35" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:text-white/65 transition-colors">Accueil</Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={10} className="opacity-50" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white/65 transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-white/60">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {badge && (
          <div className="mb-5">
            <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] md:px-3.5 md:py-1.5 md:text-[11px] font-black uppercase tracking-[0.22em] text-emerald-400">
              {badge}
            </span>
          </div>
        )}

        <h1 className="text-[clamp(1.4rem,2.8vw,2.4rem)] font-black leading-[0.96] tracking-[-0.04em]">
          {renderTitle()}
        </h1>

        {subtitle && (
          <p className="mt-4 max-w-2xl text-[clamp(0.86rem,1.15vw,1rem)] leading-[1.58] text-white/50">
            {subtitle}
          </p>
        )}

        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

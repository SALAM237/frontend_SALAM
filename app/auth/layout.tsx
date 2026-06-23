import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">

      {/* Panneau gauche - identite SALAM */}
      <div className="relative hidden w-[480px] shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#05120b] via-[#07190f] to-[#061009] lg:flex xl:w-[520px]">

        {/* Texture subtile */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        {/* Motif ndop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.15] lg:opacity-[0.12]"
          style={{
            backgroundImage: "url('/images/placeholders/ndop motif WBG.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Lueur verte centrale */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-[80px]" />

        {/* Flag stripe */}
        <div className="h-[4px] w-full shrink-0" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />

        <div className="relative flex flex-1 flex-col px-10 py-10 xl:px-12">

          {/* Logo */}
          <Link href="/" className="group flex w-fit items-center gap-3">
            <Image
              src="/images/logo/logo_salam_96.webp"
              alt="SALAM"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-emerald-500/30 transition group-hover:ring-emerald-400/60"
              priority
            />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-white">SALAM</p>
              <p className="text-[9px] font-semibold tracking-[0.18em] text-white/30">ASSOCIATION</p>
            </div>
          </Link>

          {/* Contenu central */}
          <div className="flex flex-1 flex-col justify-center gap-10">

            {/* Accroche */}
            <div>
              <span className="mb-3 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                Espace membre
              </span>
              <h1 className="text-[2rem] font-black leading-[1.1] tracking-[-0.04em] text-white xl:text-[2.4rem]">
                Votre réseau,<br />
                <span className="text-emerald-400">votre avenir.</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/45">
                Rejoignez une communauté d&apos;étudiants et de diplômés camerounais qui construisent ensemble un avenir ambitieux.
              </p>
            </div>

          </div>

          {/* Footer */}
          <p className="text-[10px] text-white/20">
            © {new Date().getFullYear()} Association SALAM · Rabat, Maroc
          </p>
        </div>
      </div>

      {/* Panneau droit - formulaire */}
      <div className="flex flex-1 flex-col bg-[#f7f8f6]">

        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b border-neutral-200/80 bg-white px-5 py-4 lg:hidden">
          <div className="h-[3px] w-6 rounded-full" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo/logo_salam_96.webp"
              alt="SALAM"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
              priority
            />
            <span className="text-sm font-black tracking-[0.15em] text-neutral-800">SALAM</span>
          </Link>
        </div>

        <div className="hidden justify-end px-8 pt-6 lg:flex">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-neutral-500 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span aria-hidden="true">&larr;</span>
            Retour au site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}


import Link from 'next/link';
import { Mail, MapPin, Globe, Share2, Video, X, ExternalLink } from 'lucide-react';
import { SalamLogo } from '@/components/brand/SalamLogo';
import { DON_NAV_ITEM, PUBLIC_NAV_ITEMS } from '@/lib/navigation';

const NAV_COLS = [
  {
    title: 'Navigation rapide',
    links: [
      ...PUBLIC_NAV_ITEMS.map(item => [item.label, item.href] as const),
      ['Bureau exécutif', '/bureau-executif'] as const,
    ],
  },
  {
    title: 'Soutenir',
    links: [
      [DON_NAV_ITEM.label, DON_NAV_ITEM.href],
      ['Adhésion', '/adhesion'],
      ['Mode démo', '/demo'],
    ],
  },
  {
    title: 'Espace membre',
    links: [
      ['Mon espace',  '/member/dashboard'],
      ['Connexion',   '/auth/login'],
      ['Mode démo',   '/demo'],
    ],
  },
];

const SOCIALS = [
  { Icon: Share2,  label: 'Facebook',  href: '#' },
  { Icon: Globe,   label: 'Instagram', href: '#' },
  { Icon: X,       label: 'Twitter/X', href: '#' },
  { Icon: Video,   label: 'YouTube',   href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-salam-ink text-white">
      <div className="container-salam">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-2 gap-8 py-[clamp(3.5rem,7vw,6rem)] lg:grid-cols-5 lg:gap-10">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            {/* Logo */}
            <div className="mb-6">
              <SalamLogo size="sm" variant="white" href="/" />
            </div>

            <p className="max-w-[280px] text-sm leading-relaxed text-white/55">
              Réseau d'entraide et de solidarité unissant les Les camerounais Lauréats du Maroc. Networking, Emploi, Mentorat, Sport, culture, éducation et accompagnement.
            </p>

            {/* Socials */}
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-full border border-white/10 text-white/45 transition-all duration-200 hover:border-salam-green hover:text-salam-green hover:bg-green-950"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map(({ title, links }) => (
            <div key={title}>
              <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[.12em] text-white/35">
                {title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[13px] font-medium text-white/55 transition-colors duration-150 hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Contact strip ── */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/8 py-5 text-[13px] text-white/35">
          <span className="flex items-center gap-2">
            <Mail size={13} className="shrink-0" />
            contact@salam-cameroun.com
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={13} className="shrink-0" />
            Yaoundé - Cameroun
          </span>
          <a
            href="https://salam-cameroun.com"
            className="ml-auto hidden items-center gap-1.5 text-white/35 hover:text-white transition-colors sm:flex"
          >
            salam-cameroun.com <ExternalLink size={11} />
          </a>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col gap-3 border-t border-white/6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-white/28">
            © {new Date().getFullYear()} Association SALAM Cameroun. Tous droits réservés.
          </p>
          <nav className="flex gap-5 text-[12px]" aria-label="Liens légaux">
            <Link href="/mentions-legales" className="text-white/28 hover:text-white/60 transition-colors">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="text-white/28 hover:text-white/60 transition-colors">
              Confidentialité
            </Link>
            <Link href="/conditions" className="text-white/28 hover:text-white/60 transition-colors">
              CGU
            </Link>
          </nav>
        </div>
      </div>

      {/* ── Cameroon flag stripe + iPhone home bar safe area ── */}
      <div className="flag-stripe-cm w-full" style={{ height: 'max(5px, env(safe-area-inset-bottom))' }} />
    </footer>
  );
}

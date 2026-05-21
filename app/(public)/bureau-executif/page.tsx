'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import { usePublicBureau, type BureauMember } from '@/lib/api/roles';
import { assetUrl } from '@/lib/assets';
import { formatFullName } from '@/lib/format-name';

const PLACEHOLDER_PHOTO = '/images/gallery/image_parallax_SALAM.png';
const PRESIDENT_PHOTO = '/images/bureau/aoua_presidente_salam_2_bn.jpg';
const FEMININE_BUREAU_POSTES: Record<string, string> = {
  president: 'Présidente',
  'president e': 'Présidente',
  'vice president': 'Vice-Présidente',
  'vice president e': 'Vice-Présidente',
  'secretaire general': 'Secrétaire Générale',
  'secretaire general e': 'Secrétaire Générale',
  'secretaire adjoint': 'Secrétaire Adjointe',
  'secretaire adjoint e': 'Secrétaire Adjointe',
  tresorier: 'Trésorière',
  'tresorier e': 'Trésorière',
  'tresorier adjoint': 'Trésorière Adjointe',
  'tresorier e adjoint e': 'Trésorière Adjointe',
  responsable: 'Responsable',
  'commissaire aux comptes': 'Commissaire aux comptes',
  'membre sage': 'Membre sage',
  conseiller: 'Conseillère',
  'conseiller e': 'Conseillère',
  'sage conseiller': 'Sage conseillère',
  'sage conseiller e': 'Sage conseillère',
};

const KNOWN_POSTES = [
  { key: 'president', label: 'Président', aliases: ['presidente', 'president e'] },
  { key: 'vice president', label: 'Vice-Président', aliases: ['vice presidente', 'vice president e'] },
  { key: 'secretaire general', label: 'Secrétaire Général', aliases: ['secretaire generale'] },
  { key: 'secretaire adjoint', label: 'Secrétaire Adjoint', aliases: ['secretaire adjointe'] },
  { key: 'tresorier', label: 'Trésorier', aliases: ['tresoriere'] },
  { key: 'commissaire aux comptes', label: 'Commissaire aux comptes', aliases: ['commissaire au compte', 'commissaire aux compte'] },
  { key: 'tresorier adjoint', label: 'Trésorier Adjoint', aliases: ['tresoriere adjointe'] },
  { key: 'responsable communication', label: 'Responsable Communication', aliases: [] },
  { key: 'responsable informatique it', label: 'Responsable Informatique IT', aliases: ['responsable informatique', 'responsable it'] },
  { key: 'responsable culture', label: 'Responsable Culture', aliases: ['responsable culturelle'] },
  { key: 'responsable sport', label: 'Responsable Sport', aliases: ['responsable sports'] },
  { key: 'responsable partenariats', label: 'Responsable Partenariats', aliases: [] },
  {
    key: 'responsable emploi insertion et orientation eio',
    label: 'Responsable Emploi, Insertion et Orientation (EIO)',
    aliases: [
      'responsable emploi insertion orientation',
      'responsable eio',
      'responsable emploi',
      'responsable insertion',
      'responsable orientation',
    ],
  },
  { key: 'responsable solidarite', label: 'Responsable Solidarité', aliases: [] },
  { key: 'conseiller', label: 'Conseiller', aliases: ['conseillere'] },
];

function normalizePoste(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(e\)/g, ' e')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanGenericBureauTitle(value?: string | null) {
  return (value ?? '')
    .replace(/\s*\(e\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesPoste(memberPoste: string, poste: (typeof KNOWN_POSTES)[number]) {
  const normalized = normalizePoste(memberPoste);
  const candidates = [poste.key, ...poste.aliases].map(normalizePoste);

  return candidates.some(candidate => normalized === candidate);
}

function getYear(date: string) {
  const year = new Date(date).getFullYear();
  return Number.isFinite(year) ? year : 2026;
}

function formatBureauTitle(member: BureauMember) {
  const title = cleanGenericBureauTitle(member.title ?? member.bureauPoste);
  if (member.gender?.toLowerCase() !== 'femme') return title;
  return FEMININE_BUREAU_POSTES[normalizePoste(title)] ?? FEMININE_BUREAU_POSTES[normalizePoste(member.bureauPoste)] ?? title;
}

function MemberCard({ member }: { member: BureauMember }) {
  const isPresident = normalizePoste(member.bureauPoste).includes('president');
  const title = formatBureauTitle(member);
  const photo = assetUrl(member.image ?? member.bureauPhoto) || (isPresident ? PRESIDENT_PHOTO : PLACEHOLDER_PHOTO);
  const name = formatFullName(member.firstName, member.lastName);
  const year = member.nominationYear ?? member.bureauNominationYear ?? getYear(member.createdAt);

  return (
    <article tabIndex={0} className="team-touch-card group relative aspect-[4/5] min-h-[340px] w-[clamp(18.55rem,88vw,22.25rem)] overflow-hidden rounded-[1.65rem] border border-white/70 bg-neutral-950 shadow-[0_18px_50px_rgba(15,23,42,0.14)] ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(6,78,59,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 sm:w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt={`${name} - ${title}`}
        className="team-touch-card__image absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-active:scale-110 group-focus-visible:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/0 opacity-90 transition-opacity duration-500 group-hover:opacity-95 group-active:opacity-95" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="translate-y-0 transition-transform duration-500 group-hover:-translate-y-1 group-active:-translate-y-1">
          <p className="text-xl font-black leading-tight tracking-[-0.03em] text-white transition-all duration-500 group-hover:text-sm group-hover:font-bold group-hover:tracking-normal group-hover:text-yellow-300 group-active:text-sm group-active:font-bold group-active:tracking-normal group-active:text-yellow-300">
            {name}
          </p>
          <h3 className="mt-1 max-w-[13rem] text-sm font-black uppercase leading-tight tracking-[0.12em] text-emerald-300 transition-all duration-500 group-hover:max-w-full group-hover:text-[clamp(1.55rem,3vw,2.2rem)] group-hover:normal-case group-hover:tracking-[-0.04em] group-hover:text-white group-active:max-w-full group-active:text-[clamp(1.55rem,3vw,2.2rem)] group-active:normal-case group-active:tracking-[-0.04em] group-active:text-white">
            {title}
          </h3>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[11px] font-black text-white/85 backdrop-blur-md">
              Depuis {year}
            </span>
            <span className="h-px flex-1 bg-white/20 transition-colors duration-500 group-hover:bg-yellow-300/70 group-active:bg-yellow-300/70" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[1.65rem] ring-1 ring-inset ring-white/15 transition-all duration-500 group-hover:ring-yellow-300/55" />
    </article>
  );
}

function PlaceholderCard({ poste }: { poste: string }) {
  return (
    <article className="group relative aspect-[4/5] min-h-[340px] w-[clamp(18.55rem,88vw,22.25rem)] overflow-hidden rounded-[1.65rem] border border-white/70 bg-neutral-950 shadow-[0_18px_50px_rgba(15,23,42,0.14)] ring-1 ring-black/5 sm:w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PLACEHOLDER_PHOTO}
        alt={poste}
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="text-xl font-black leading-tight tracking-[-0.03em] text-white/40">À annoncer</p>
        <h3 className="mt-1 text-sm font-black uppercase leading-tight tracking-[0.12em] text-emerald-300/50">
          {poste}
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black text-white/35">
            Poste à pourvoir
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[1.65rem] ring-1 ring-inset ring-white/10" />
    </article>
  );
}

export default function BureauExecutifPage() {
  const { data, isLoading } = usePublicBureau();
  const members: BureauMember[] = data?.data ?? [];

  const matchedCards = KNOWN_POSTES.map(poste => ({
    ...poste,
    member: members.find(member => matchesPoste(member.bureauPoste, poste)),
  }));
  const matchedIds = new Set(matchedCards.map(card => card.member?._id).filter(Boolean));
  const extraMembers = members.filter(member => !matchedIds.has(member._id));
  const announcedCards = matchedCards.filter(card => card.member);
  const pendingCards = matchedCards.filter(card => !card.member);

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
            <Link href="/contact" className="hidden h-10 items-center gap-2 rounded-full border border-emerald-300 px-5 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-50 sm:inline-flex">
              Nous contacter
            </Link>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 size={28} className="animate-spin text-emerald-600" />
              <p className="text-sm text-neutral-500">Chargement du bureau...</p>
            </div>
          )}

          {!isLoading && (
            <div className="grid justify-items-center gap-5 sm:grid-cols-2 sm:justify-items-stretch md:grid-cols-3">
              {announcedCards.map(({ key, member }) => (
                member ? <MemberCard key={key} member={member} /> : null
              ))}
              {extraMembers.map(member => (
                <MemberCard key={member._id} member={member} />
              ))}
              {pendingCards.map(({ key, label }) => (
                <PlaceholderCard key={key} poste={label} />
              ))}
            </div>
          )}

          {!isLoading && members.length === 0 && (
            <div className="mt-10 rounded-[1.5rem] border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center">
              <p className="text-sm font-bold text-emerald-800">
                Les membres du bureau exécutif seront présentés après l'assemblée générale.
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                Vous souhaitez vous présenter aux élections ? Contactez-nous.
              </p>
              <Link href="/contact" className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-xs font-black text-white transition-all hover:bg-emerald-700">
                Nous contacter
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: '/mot-du-president', label: 'Mot de la présidente', desc: "Le message de la présidente de l'association" },
              { href: '/conseil-des-sages', label: 'Conseil des sages', desc: 'Les personnalités qui guident SALAM' },
              { href: '/commissions', label: 'Commissions', desc: 'Les groupes de travail thématiques' },
            ].map(({ href, label, desc }) => (
              <Link key={href} href={href} className="group rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                <h3 className="font-black text-neutral-900 transition-colors group-hover:text-emerald-700">{label}</h3>
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

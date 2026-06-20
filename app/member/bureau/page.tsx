'use client';

import { Loader2, Users } from 'lucide-react';
import { useMemberBureau, type BureauMember } from '@/lib/api/roles';
import { assetUrl } from '@/lib/assets';
import { formatFullName } from '@/lib/format-name';
import { AvatarLightbox } from '@/components/portal/AvatarLightbox';

const PLACEHOLDER_PHOTO = '/images/gallery/image_parallax_SALAM_1200.webp';

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
  censeur: 'Censeure',
  responsable: 'Responsable',
  'commissaire aux comptes': 'Commissaire aux comptes',
  'membre sage': 'Membre sage',
  conseiller: 'Conseillère',
  'conseiller e': 'Conseillère',
  'sage conseiller': 'Sage conseillère',
  'sage conseiller e': 'Sage conseillère',
};

const COMMISSION_DESCRIPTIONS: Record<string, string> = {
  'Commission Communication': "Gestion des réseaux sociaux, communication externe et image de l'association.",
  'Commission IT': 'Développement numérique, outils digitaux et transformation numérique de SALAM.',
  'Commission Culturelle': 'Organisation des événements culturels, valorisation des cultures camerounaise et marocaine.',
  'Commission Sport': 'Tournois, activités sportives et promotion du sport comme vecteur de cohésion sociale.',
  'Commission Emploi': "Réseau emploi, accompagnement professionnel et opportunités pour les membres.",
  'Commission Orientation': "Accompagnement des bacheliers, ateliers d'orientation et préparation aux études supérieures.",
  'Commission Insertion': 'Réseau professionnel, forums emploi, accompagnement carrière et entrepreneuriat.',
  'Commission Solidarité': 'Actions humanitaires, soutien aux personnes vulnérables et collectes de fonds.',
};

const EXECUTIVE_ORDER = [
  'Président', 'Vice-Président', 'Secrétaire Général', 'Secrétaire Adjoint',
  'Trésorier', 'Commissaire aux comptes', 'Trésorier Adjoint',
  'Censeur',
  'Responsable Communication', 'Responsable Informatique IT',
  'Responsable Culture', 'Responsable Sport', 'Responsable Partenariats',
  'Responsable Emploi, Insertion et Orientation (EIO)',
  'Responsable Solidarité', 'Conseiller',
];

const COMMISSION_ORDER = Object.keys(COMMISSION_DESCRIPTIONS);
const COUNCIL_ORDER = ['Conseil des sages'];

function normalize(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(e\)/g, ' e')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const SLOT_ALIASES: Record<string, string> = {
  presidente: 'president',
  'vice presidente': 'vice president',
  'secretaire generale': 'secretaire general',
  'secretaire adjointe': 'secretaire adjoint',
  tresoriere: 'tresorier',
  'tresoriere adjointe': 'tresorier adjoint',
  'commissaire au compte': 'commissaire aux comptes',
  'commissaire aux compte': 'commissaire aux comptes',
  censeure: 'censeur',
  conseillere: 'conseiller',
  'sage conseillere': 'sage conseiller',
  'responsable informatique': 'responsable informatique it',
  'responsable it': 'responsable informatique it',
  'responsable culturelle': 'responsable culture',
  'responsable sports': 'responsable sport',
  'responsable emploi insertion orientation': 'responsable emploi insertion et orientation eio',
  'responsable emploi': 'responsable emploi insertion et orientation eio',
  'responsable insertion': 'responsable emploi insertion et orientation eio',
  'responsable orientation': 'responsable emploi insertion et orientation eio',
  'responsable eio': 'responsable emploi insertion et orientation eio',
};

function slotKey(value?: string | null) {
  const key = normalize(value);
  return SLOT_ALIASES[key] ?? key;
}

function cleanGenericBureauTitle(value?: string | null) {
  return (value ?? '')
    .replace(/\s*\(e\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueByNormalized(values: string[]) {
  const seen = new Set<string>();
  return values.filter(value => {
    const key = slotKey(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function firstMeaningfulLabel(values: Array<string | null | undefined>, fallback: string) {
  const ignored = new Set(['commissions', 'commission', 'responsable', 'bureau executif']);
  return values.find(value => {
    const key = slotKey(value);
    return key && !ignored.has(key);
  }) ?? fallback;
}

function matchesSlot(member: BureauMember, slot: string) {
  const expectedSlot = slotKey(slot);
  const candidates = [
    member.bureauPoste,
    member.title,
    member.bureauGroup,
    member.categoryLabel,
  ].filter(isNonEmptyString);

  return candidates.some(candidate => slotKey(candidate) === expectedSlot);
}

function commissionGroupFor(member: BureauMember) {
  const standard = COMMISSION_ORDER.find(group => matchesSlot(member, group));
  if (standard) return standard;
  return firstMeaningfulLabel([member.bureauGroup, member.categoryLabel, member.bureauPoste, member.title], 'Commission');
}

function councilGroupFor(member: BureauMember) {
  return firstMeaningfulLabel([member.bureauGroup, member.categoryLabel], 'Conseil des sages');
}

function categoryLabel(member: BureauMember) {
  if (member.bureauCategory === 'commission') return member.bureauGroup ?? member.categoryLabel ?? 'Commission';
  if (member.bureauCategory === 'council') return 'Conseil des sages';
  return 'Bureau exécutif';
}

function memberTitle(member: BureauMember) {
  const title = cleanGenericBureauTitle(member.bureauCategory === 'commission' ? (member.title ?? 'Responsable') : (member.title ?? member.bureauPoste));
  if (member.gender?.toLowerCase() !== 'femme') return title;
  return FEMININE_BUREAU_POSTES[normalize(title)] ?? FEMININE_BUREAU_POSTES[normalize(member.bureauPoste)] ?? title;
}

function TeamCard({ member, badge }: { member: BureauMember; badge: string }) {
  const name = formatFullName(member.firstName, member.lastName);
  const title = memberTitle(member);
  const year = member.nominationYear ?? member.bureauNominationYear ?? new Date(member.createdAt).getFullYear();
  const photo = assetUrl(member.image ?? member.bureauPhoto) || PLACEHOLDER_PHOTO;

  return (
    <article tabIndex={0} className="team-touch-card group relative aspect-[4/5] min-h-[330px] w-full max-w-[clamp(18.55rem,88vw,22.25rem)] overflow-hidden rounded-[1.65rem] border border-white/70 bg-neutral-950 shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(6,78,59,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <AvatarLightbox src={photo} alt={name} className="team-touch-card__image absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-active:scale-110 group-focus-visible:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/0 opacity-90 transition-opacity duration-500 group-hover:opacity-95 group-active:opacity-95" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="translate-y-0 transition-transform duration-500 group-hover:-translate-y-1 group-active:-translate-y-1">
          <p className="text-xl font-black leading-tight tracking-[-0.03em] text-white transition-all duration-500 group-hover:text-sm group-hover:font-bold group-hover:tracking-normal group-hover:text-yellow-300 group-active:text-sm group-active:font-bold group-active:tracking-normal group-active:text-yellow-300">
            {name}
          </p>
          <h3 className="mt-1 max-w-[13rem] text-sm font-black uppercase leading-tight tracking-[0.12em] text-emerald-300 transition-all duration-500 group-hover:max-w-full group-hover:text-[clamp(1.45rem,3vw,2.1rem)] group-hover:normal-case group-hover:tracking-[-0.04em] group-hover:text-white group-active:max-w-full group-active:text-[clamp(1.45rem,3vw,2.1rem)] group-active:normal-case group-active:tracking-[-0.04em] group-active:text-white">
            {title}
          </h3>
          <div className="mt-3 flex items-center gap-2 pr-20">
            <span className="inline-flex rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[11px] font-black text-white/85 backdrop-blur-md">
              Depuis {Number.isFinite(year) ? year : '—'}
            </span>
            <span className="h-px flex-1 bg-white/20 transition-colors duration-500 group-hover:bg-yellow-300/70 group-active:bg-yellow-300/70" />
          </div>
        </div>
      </div>

      <span className="absolute bottom-5 right-5 max-w-[7.5rem] truncate rounded-full border border-yellow-300/40 bg-yellow-300/15 px-2.5 py-1 text-[10px] font-black text-yellow-200 backdrop-blur-md">
        {badge}
      </span>
      <div className="pointer-events-none absolute inset-0 rounded-[1.65rem] ring-1 ring-inset ring-white/15 transition-all duration-500 group-hover:ring-yellow-300/55" />
    </article>
  );
}

function EmptyCard({ title, badge }: { title: string; badge: string }) {
  return (
    <article className="relative flex aspect-[4/5] min-h-[330px] w-full max-w-[clamp(18.55rem,88vw,22.25rem)] flex-col justify-end overflow-hidden rounded-[1.65rem] border border-dashed border-neutral-200 bg-neutral-100 p-5 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-800/35 to-transparent" />
      <div className="relative">
        <p className="text-xl font-black leading-tight tracking-[-0.03em] text-white/45">À annoncer</p>
        <h3 className="mt-1 text-sm font-black uppercase leading-tight tracking-[0.12em] text-emerald-200/65">{title}</h3>
        <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black text-white/35">
          Responsable à annoncer
        </p>
      </div>
      <span className="absolute bottom-5 right-5 max-w-[7.5rem] truncate rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-black text-white/55 backdrop-blur-md">
        {badge}
      </span>
    </article>
  );
}

function Section({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</span>
        <h2 className="text-[clamp(1.35rem,3vw,2rem)] font-black tracking-[-0.04em] text-neutral-950">{title}</h2>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">{description}</p>}
      </div>
      <div className="grid justify-items-center gap-5 sm:grid-cols-2 sm:justify-items-stretch xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

export default function MemberBureauPage() {
  const { data, isLoading } = useMemberBureau();
  const members = data?.data ?? [];

  const executive = members.filter(member => (member.bureauCategory ?? 'executive') === 'executive');
  const commissions = members.filter(member => member.bureauCategory === 'commission');
  const council = members.filter(member => member.bureauCategory === 'council');
  const executiveSlotIds = new Set(
    EXECUTIVE_ORDER
      .map(poste => executive.find(item => matchesSlot(item, poste))?._id)
      .filter(isNonEmptyString),
  );
  const executiveExtras = executive.filter(member => !executiveSlotIds.has(member._id));
  const commissionGroups = uniqueByNormalized([
    ...COMMISSION_ORDER,
    ...commissions.map(commissionGroupFor),
  ]);
  const councilGroups = uniqueByNormalized([
    ...COUNCIL_ORDER,
    ...council.map(councilGroupFor),
  ]);
  const announcedExecutive = EXECUTIVE_ORDER
    .map(poste => ({ poste, member: executive.find(item => matchesSlot(item, poste)) }))
    .filter((item): item is { poste: string; member: BureauMember } => !!item.member);
  const pendingExecutive = EXECUTIVE_ORDER.filter(
    poste => !executive.some(item => matchesSlot(item, poste)),
  );
  const announcedCommissionGroups = commissionGroups.filter(group =>
    commissions.some(item => slotKey(commissionGroupFor(item)) === slotKey(group)),
  );
  const pendingCommissionGroups = commissionGroups.filter(group =>
    !commissions.some(item => slotKey(commissionGroupFor(item)) === slotKey(group)),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="overflow-hidden rounded-[1.5rem] bg-[#07140d] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-3 inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Gouvernance SALAM
            </span>
            <h1 className="max-w-full whitespace-nowrap text-[clamp(1.35rem,3.6vw,3.1rem)] font-black leading-[1] tracking-[-0.05em]">
              Bureau, commissions et conseil
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
              Retrouvez les membres engagés dans la coordination de l'association, regroupés par responsabilités.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-center">
            {[
              ['Bureau', executive.length],
              ['Commissions', commissions.length],
              ['Sages', council.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/[0.04] px-3 py-2">
                <p className="text-lg font-black text-white">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-100 bg-white py-20">
          <Loader2 className="animate-spin text-emerald-600" size={26} />
          <p className="mt-3 text-sm text-neutral-400">Chargement du bureau...</p>
        </div>
      )}

      {!isLoading && members.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white px-6 py-16 text-center">
          <Users size={34} className="mb-3 text-neutral-200" />
          <p className="text-sm font-semibold text-neutral-500">Aucun membre de bureau publié pour le moment.</p>
        </div>
      )}

      {!isLoading && (
        <>
          <Section title="Bureau exécutif" eyebrow="Direction">
            {announcedExecutive.map(({ poste, member }) => (
              <TeamCard key={poste} member={member} badge="Bureau exécutif" />
            ))}
            {executiveExtras.map(member => (
              <TeamCard key={member._id} member={member} badge="Bureau exécutif" />
            ))}
            {pendingExecutive.map(poste => (
              <EmptyCard key={poste} title={poste} badge="Bureau exécutif" />
            ))}
          </Section>

          <Section
            title="Commissions"
            eyebrow="Groupes de travail"
            description="Chaque commission est pilotée par un responsable chargé de coordonner les actions et les membres du groupe."
          >
            {announcedCommissionGroups.map(group => {
              const groupMembers = commissions.filter(item => slotKey(commissionGroupFor(item)) === slotKey(group));
              return <TeamCard key={group} member={groupMembers[0]} badge={group} />;
            })}
            {pendingCommissionGroups.map(group => (
              <EmptyCard key={group} title={group} badge={group} />
            ))}
          </Section>

          <Section title="Conseil des sages" eyebrow="Conseil" description="Un espace de conseil et de transmission pour accompagner les grandes orientations de SALAM.">
            {councilGroups.map(group => {
              const groupMembers = council.filter(item => slotKey(councilGroupFor(item)) === slotKey(group));
              if (groupMembers.length === 0) return <EmptyCard key={group} title="Membre sage" badge={group} />;
              return groupMembers.map(member => <TeamCard key={member._id} member={member} badge={group} />);
            })}
          </Section>
        </>
      )}
    </div>
  );
}

'use client';

import { DemoPortalShell } from '../../_components/DemoShell';

const demoBureau = [
  {
    group: 'Bureau exécutif',
    eyebrow: 'Direction',
    members: [
      { name: 'Aoua BABA', title: 'Présidente', year: 2026, badge: 'Bureau exécutif', photo: '/images/bureau/aoua_presidente_salam_2_bn.jpg' },
      { name: 'Maurice NDO', title: 'Vice-Président', year: 2026, badge: 'Bureau exécutif', photo: '/images/bureau/maurice_vice_president_salam_bn.jpg' },
      { name: 'Inès MFOU', title: 'Secrétaire Générale', year: 2026, badge: 'Bureau exécutif', photo: '/images/bureau/ines_SG_salam_3bn.jpg' },
    ],
  },
  {
    group: 'Commissions',
    eyebrow: 'Groupes de travail',
    members: [
      { name: 'Sammy ETOA', title: 'Responsable', year: 2026, badge: 'Commission Culturelle', photo: '/images/bureau/sammy_conseiller_salam_bn.jpg' },
      { name: 'Khadidja ALI', title: 'Responsable', year: 2026, badge: 'Commission Solidarité', photo: '/images/bureau/khadidja_tresorier_salam_bn.jpg' },
      { name: 'Bertrand ZAMBO', title: 'Responsable', year: 2026, badge: 'Commission IT', photo: '/images/bureau/bertrand_commissaire_salam_bn.jpg' },
    ],
  },
  {
    group: 'Conseil des sages',
    eyebrow: 'Conseil',
    members: [
      { name: 'Bouba HAMADOU', title: 'Sage conseiller', year: 2026, badge: 'Conseil des sages', photo: '/images/bureau/bouba_conseiller_salam_bn.jpg' },
      { name: 'Saïdou TALL', title: 'Conseiller', year: 2026, badge: 'Conseil des sages', photo: '/images/bureau/saidou_conseiller_salam_bn.jpg' },
    ],
  },
];

function DemoTeamCard({ member }: { member: (typeof demoBureau)[number]['members'][number] }) {
  return (
    <article tabIndex={0} className="team-touch-card group relative aspect-[4/5] min-h-[330px] w-full max-w-[clamp(18.55rem,88vw,22.25rem)] overflow-hidden rounded-[1.65rem] border border-white/70 bg-neutral-950 shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(6,78,59,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={member.photo}
        alt={`${member.name} - ${member.title}`}
        className="team-touch-card__image absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-active:scale-110 group-focus-visible:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/0 opacity-90 transition-opacity duration-500 group-hover:opacity-95 group-active:opacity-95" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="translate-y-0 transition-transform duration-500 group-hover:-translate-y-1 group-active:-translate-y-1">
          <p className="text-xl font-black leading-tight tracking-[-0.03em] text-white transition-all duration-500 group-hover:text-sm group-hover:font-bold group-hover:tracking-normal group-hover:text-yellow-300 group-active:text-sm group-active:font-bold group-active:tracking-normal group-active:text-yellow-300">
            {member.name}
          </p>
          <h3 className="mt-1 max-w-[13rem] text-sm font-black uppercase leading-tight tracking-[0.12em] text-emerald-300 transition-all duration-500 group-hover:max-w-full group-hover:text-[clamp(1.45rem,3vw,2.1rem)] group-hover:normal-case group-hover:tracking-[-0.04em] group-hover:text-white group-active:max-w-full group-active:text-[clamp(1.45rem,3vw,2.1rem)] group-active:normal-case group-active:tracking-[-0.04em] group-active:text-white">
            {member.title}
          </h3>
          <div className="mt-3 flex items-center gap-2 pr-20">
            <span className="inline-flex rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[11px] font-black text-white/85 backdrop-blur-md">
              Depuis {member.year}
            </span>
            <span className="h-px flex-1 bg-white/20 transition-colors duration-500 group-hover:bg-yellow-300/70 group-active:bg-yellow-300/70" />
          </div>
        </div>
      </div>

      <span className="absolute bottom-5 right-5 max-w-[7.5rem] truncate rounded-full border border-yellow-300/40 bg-yellow-300/15 px-2.5 py-1 text-[10px] font-black text-yellow-200 backdrop-blur-md">
        {member.badge}
      </span>
      <div className="pointer-events-none absolute inset-0 rounded-[1.65rem] ring-1 ring-inset ring-white/15 transition-all duration-500 group-hover:ring-yellow-300/55" />
    </article>
  );
}

export default function DemoMemberBureauPage() {
  return (
    <DemoPortalShell type="member" title="Bureau & commissions">
      <div className="space-y-8">
        <div className="overflow-hidden rounded-[1.5rem] bg-[#07140d] p-6 text-white shadow-sm sm:p-8">
          <span className="mb-3 inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
            Gouvernance SALAM
          </span>
          <h1 className="max-w-3xl text-[clamp(2rem,6vw,4.5rem)] font-black leading-[0.9] tracking-[-0.06em]">
            Bureau, commissions et conseil
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
            Démonstration des membres responsables, regroupés par catégories avec des données fictives.
          </p>
        </div>

        {demoBureau.map(section => (
          <section key={section.group} className="space-y-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">{section.eyebrow}</span>
              <h2 className="text-[clamp(1.35rem,3vw,2rem)] font-black tracking-[-0.04em] text-neutral-950">{section.group}</h2>
            </div>
            <div className="grid justify-items-center gap-5 sm:grid-cols-2 sm:justify-items-stretch xl:grid-cols-3">
              {section.members.map(member => <DemoTeamCard key={`${section.group}-${member.name}`} member={member} />)}
            </div>
          </section>
        ))}
      </div>
    </DemoPortalShell>
  );
}

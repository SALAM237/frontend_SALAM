"use client";


type IconProps = { className?: string };

function UsersIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M16 19C16 16.8 14.2 15 12 15H8C5.8 15 4 16.8 4 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M20 19C20 17.2 18.8 15.7 17.2 15.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21s-8-4.8-9.7-10.2C1.1 6.9 3.4 4 6.8 4c2 0 3.6 1 4.6 2.4C12.4 5 14 4 16 4c3.4 0 5.7 2.9 4.5 6.8C20 16.2 12 21 12 21Z" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getSalamAge(): number {
  const now = new Date();
  const anniversary = new Date(now.getFullYear(), 1, 20);
  return now >= anniversary ? now.getFullYear() - 2010 : now.getFullYear() - 2011;
}

const stats = [
  { label: "Membres",              value: 400,           suffix: "+", icon: UsersIcon,    color: "text-emerald-700", bg: "bg-emerald-50", line: "bg-emerald-700" },
  { label: "Années d'existence",   value: getSalamAge(), suffix: "",  icon: ClockIcon,    color: "text-emerald-700", bg: "bg-emerald-50", line: "bg-emerald-700" },
  { label: "Actions sociales",     value: 126,           suffix: "+", icon: HeartIcon,    color: "text-red-600",     bg: "bg-red-50",     line: "bg-red-600"     },
  { label: "Événements organisés", value: 100,           suffix: "+", icon: CalendarIcon, color: "text-yellow-500",  bg: "bg-yellow-50",  line: "bg-yellow-400"  },
];

export default function SalamStatsSection() {

  return (
    <section
      className="relative overflow-hidden px-[clamp(1rem,4vw,4.5rem)] py-[clamp(2.5rem,5vw,4rem)]"
    >
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-yellow-200/50 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-emerald-700 via-red-600 to-yellow-400" />

      <div className="relative z-10 mx-auto max-w-5xl">

        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
            SALAM en chiffres
          </p>
          <h2 className="text-[clamp(1.6rem,3.2vw,2.8rem)] font-black leading-tight tracking-[-0.04em] text-neutral-950">
            Une communauté qui agit, transmet et construit.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[clamp(0.85rem,1.1vw,0.98rem)] leading-7 text-neutral-500">
            Des anciens étudiants camerounais du Maroc engagés pour accompagner les jeunes,
            renforcer le réseau et participer au développement du Cameroun.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="group relative overflow-hidden rounded-xl border border-neutral-100 bg-white px-3 py-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md lg:rounded-2xl lg:px-4 lg:py-4"
              >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-700 via-red-600 to-yellow-400 opacity-0 transition group-hover:opacity-100" />

                <div className={`mb-2 grid h-7 w-7 place-items-center rounded-lg lg:mb-3 lg:h-9 lg:w-9 lg:rounded-xl ${item.bg}`}>
                  <Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${item.color}`} />
                </div>

                <div className="flex items-end gap-0.5">
                  <span className={`text-[clamp(1.3rem,4vw,2.4rem)] font-black leading-none ${item.color}`}>
                    {item.value.toLocaleString("fr-FR")}{item.suffix}
                  </span>
                </div>

                <p className="mt-1 text-[0.7rem] font-semibold leading-snug text-neutral-600 lg:mt-1.5 lg:text-sm">
                  {item.label}
                </p>

                <span className={`mt-2 block h-0.5 w-6 rounded-full lg:mt-3 lg:w-8 ${item.line}`} />
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}

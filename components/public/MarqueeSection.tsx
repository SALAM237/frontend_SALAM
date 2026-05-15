import { Marquee } from '@/components/magic-ui/Marquee';

const TAGS = [
  { text: 'Solidarité',         color: 'text-salam-green', dot: 'bg-salam-green' },
  { text: 'Culture Cameroun',   color: 'text-salam-red',   dot: 'bg-salam-red' },
  { text: 'Réseau Professionnel',color: 'text-amber-600',  dot: 'bg-salam-yellow' },
  { text: 'Sport & Fraternité', color: 'text-blue-600',    dot: 'bg-blue-500' },
  { text: 'Éducation',          color: 'text-purple-600',  dot: 'bg-purple-500' },
  { text: 'Culture Maroc',      color: 'text-salam-green', dot: 'bg-salam-green' },
  { text: 'Bénévolat',          color: 'text-salam-red',   dot: 'bg-salam-red' },
  { text: 'Entraide',           color: 'text-amber-600',   dot: 'bg-salam-yellow' },
];

export function MarqueeSection() {
  return (
    <section className="overflow-hidden py-4">
      <Marquee speed={35} pauseOnHover className="py-2">
        {TAGS.map(({ text, color, dot }) => (
          <span
            key={text}
            className={`inline-flex shrink-0 items-center gap-2.5 rounded-full bg-neutral-50 px-5 py-2 text-[12px] font-bold ${color}`}
          >
            <span className={`size-2 shrink-0 rounded-full ${dot}`} />
            {text}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Size    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Variant = 'default' | 'white';

interface SalamLogoProps {
  size?:      Size;
  showText?:  boolean;
  variant?:   Variant;
  className?: string;
  href?:      string | null;
}

const PX: Record<Size, number> = { xs: 28, sm: 40, md: 56, lg: 72, xl: 100 };

const TEXT_SIZE: Record<Size, string> = {
  xs: 'text-[13px]',
  sm: 'text-[17px]',
  md: 'text-[22px]',
  lg: 'text-[28px]',
  xl: 'text-[36px]',
};

export function SalamLogo({
  size      = 'sm',
  showText  = true,
  variant   = 'default',
  className,
  href      = '/',
}: SalamLogoProps) {
  const px = PX[size];

  const inner = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/images/logo/logo_salam_96.webp"
        alt="Logo SALAM"
        width={px}
        height={px}
        priority
        className="shrink-0 rounded-full object-cover drop-shadow-lg"
        style={{ width: px, height: px }}
      />
      {showText && (
        <span className="leading-none">
          <span
            className={cn(
              'block font-black tracking-tight leading-none',
              TEXT_SIZE[size],
              variant === 'white' ? 'text-white' : 'text-salam-ink',
            )}
          >
            SALAM
          </span>
          <span
            className={cn(
              'mt-0.5 block text-[10px] font-semibold uppercase tracking-[.14em] leading-none',
              variant === 'white' ? 'text-white/45' : 'text-neutral-400',
            )}
          >
            Cameroun · Maroc
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="SALAM - Retour ?? l'accueil" className="inline-flex">
      {inner}
    </Link>
  );
}


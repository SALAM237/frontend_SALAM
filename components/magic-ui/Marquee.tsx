'use client';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  innerClassName?: string;
}

export function Marquee({
  children,
  direction = 'left',
  speed = 40,
  pauseOnHover = true,
  className = '',
  innerClassName = '',
}: MarqueeProps) {
  const cls = direction === 'left' ? 'marquee-left' : 'marquee-right';

  return (
    <div
      className={cn('overflow-hidden', className)}
      style={{ '--marquee-dur': `${speed}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          'flex w-max gap-[clamp(1rem,2vw,2rem)]',
          cls,
          pauseOnHover && 'hover:[animation-play-state:paused]',
          innerClassName,
        )}
        aria-hidden
      >
        {children}
        {children}
      </div>
    </div>
  );
}

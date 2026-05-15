'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'green' | 'red' | 'yellow' | 'white';
type Size    = 'sm' | 'md' | 'lg';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
}

const variantCls: Record<Variant, string> = {
  green:  'bg-salam-green  text-white  hover:bg-green-800  focus-visible:ring-salam-green  shadow-lg shadow-green-900/15',
  red:    'bg-salam-red    text-white  hover:bg-red-800    focus-visible:ring-salam-red',
  yellow: 'bg-salam-yellow text-salam-ink hover:bg-yellow-400 focus-visible:ring-salam-yellow',
  white:  'bg-white        text-salam-green hover:bg-green-50  focus-visible:ring-white      shadow-lg shadow-black/10',
};

const sizeCls: Record<Size, string> = {
  sm: 'min-h-[36px] px-4 py-2 text-xs',
  md: 'min-h-[44px] px-6 py-2.5 text-sm',
  lg: 'min-h-[52px] px-8 py-3.5 text-sm',
};

export function ShimmerButton({
  href,
  children,
  className,
  variant = 'green',
  size = 'md',
  ...props
}: ShimmerButtonProps) {
  const cls = cn(
    'shimmer-btn relative inline-flex items-center justify-center gap-2',
    'rounded-full font-bold overflow-hidden',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '-webkit-tap-highlight-color: transparent',
    variantCls[variant],
    sizeCls[size],
    className,
  );

  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...props}>{children}</button>;
}

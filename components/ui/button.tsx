import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
type Size    = 'sm' | 'md' | 'lg';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: Variant;
  size?: Size;
};

const variantCls: Record<Variant, string> = {
  primary:   'bg-salam-green  text-white hover:bg-green-800  focus-visible:ring-salam-green',
  secondary: 'bg-salam-red    text-white hover:bg-red-800    focus-visible:ring-salam-red',
  outline:   'border-2 border-neutral-200 bg-transparent text-salam-ink hover:border-salam-green hover:text-salam-green hover:bg-green-50',
  ghost:     'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-salam-ink',
  white:     'bg-white text-salam-green hover:bg-green-50 shadow-sm shadow-black/5',
};

const sizeCls: Record<Size, string> = {
  sm: 'min-h-[36px] px-4 py-2 text-xs',
  md: 'min-h-[44px] px-5 py-2.5 text-sm',
  lg: 'min-h-[52px] px-7 py-3.5 text-base',
};

export function Button({
  href,
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: Props) {
  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-bold',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.96] active:brightness-90',
    variantCls[variant],
    sizeCls[size],
    className,
  );

  return href
    ? <Link href={href} className={cls}>{children}</Link>
    : <button className={cls} {...props}>{children}</button>;
}

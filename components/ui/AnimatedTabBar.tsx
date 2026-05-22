'use client';

import { useRef } from 'react';
import Link from 'next/link';

export type AnimatedTabItem<T extends string = string> = {
  value: T;
  label: string;
  href?: string;
  icon?: React.ElementType;
  count?: number;
};

interface AnimatedTabBarProps<T extends string = string> {
  items: AnimatedTabItem<T>[];
  value: T;
  onChange?: (value: T) => void;
  className?: string;
  itemClassName?: string;
}

function ease(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function AnimatedTabBar<T extends string>({
  items,
  value,
  onChange,
  className = '',
  itemClassName = '',
}: AnimatedTabBarProps<T>) {
  const navRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const prevValueRef = useRef<T>(value);

  const smoothScroll = (targetLeft: number, duration = 380) => {
    const nav = navRef.current;
    if (!nav) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = nav.scrollLeft;
    const distance = targetLeft - start;
    if (Math.abs(distance) < 1) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      nav.scrollLeft = start + distance * ease(progress);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const slideTo = (nextValue: T) => {
    const nav = navRef.current;
    if (!nav) return;
    const previousIndex = items.findIndex(item => item.value === prevValueRef.current);
    const nextIndex = items.findIndex(item => item.value === nextValue);
    const nodes = nav.querySelectorAll<HTMLElement>('[data-animated-tab]');
    const node = nodes[nextIndex];
    if (!node) return;

    const maxScroll = nav.scrollWidth - nav.clientWidth;
    let target: number;
    if (nextIndex > previousIndex) {
      target = Math.min(node.offsetLeft - 8, maxScroll);
    } else if (nextIndex < previousIndex) {
      target = Math.max(node.offsetLeft + node.offsetWidth - nav.clientWidth + 8, 0);
    } else {
      target = Math.min(Math.max(node.offsetLeft - nav.clientWidth / 2 + node.offsetWidth / 2, 0), maxScroll);
    }

    prevValueRef.current = nextValue;
    smoothScroll(target);
  };

  const baseClass = 'relative inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition-all duration-200';
  const inactiveClass = 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800';
  const activeClass = 'bg-emerald-600 text-white shadow-sm';

  return (
    <div className={`overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      <div ref={navRef} className="scroll-smooth overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-1">
          {items.map(item => {
            const active = value === item.value;
            const Icon = item.icon;
            const content = (
              <>
                {Icon && <Icon size={14} />}
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20' : 'bg-neutral-100'}`}>
                    {item.count}
                  </span>
                )}
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.value}
                  href={item.href}
                  data-animated-tab
                  onClick={() => slideTo(item.value)}
                  className={`${baseClass} ${active ? activeClass : inactiveClass} ${itemClassName}`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.value}
                type="button"
                data-animated-tab
                onClick={() => {
                  onChange?.(item.value);
                  slideTo(item.value);
                }}
                className={`${baseClass} ${active ? activeClass : inactiveClass} ${itemClassName}`}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  const updateIndicator = () => {
    const nav = navRef.current;
    if (!nav) return;
    const nodes = nav.querySelectorAll<HTMLElement>('[data-animated-tab]');
    const index = items.findIndex(item => item.value === value);
    const node = nodes[index];
    if (!node) return;
    setIndicator({
      left: node.offsetLeft,
      top: node.offsetTop,
      width: node.offsetWidth,
      height: node.offsetHeight,
      ready: true,
    });
  };

  useLayoutEffect(() => {
    updateIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items]);

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

  const baseClass = 'relative z-10 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition-colors duration-200';
  const inactiveClass = 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800';
  const activeClass = 'text-white';

  return (
    <div className={`overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      <div ref={navRef} className="scroll-smooth overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative flex min-w-max gap-1">
          <span
            aria-hidden="true"
            className="absolute rounded-xl bg-emerald-600 shadow-sm transition-all duration-300 ease-out"
            style={{
              width: indicator.width,
              height: indicator.height,
              transform: `translate(${indicator.left}px, ${indicator.top}px)`,
              opacity: indicator.ready ? 1 : 0,
            }}
          />
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
                  className={`${baseClass} whitespace-nowrap ${active ? activeClass : inactiveClass} ${itemClassName}`}
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
                className={`${baseClass} whitespace-nowrap ${active ? activeClass : inactiveClass} ${itemClassName}`}
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

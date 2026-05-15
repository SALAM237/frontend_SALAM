'use client';
import { useEffect, useRef } from 'react';
import { animate, useInView } from 'framer-motion';

interface NumberTickerProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export function NumberTicker({
  value,
  suffix = '',
  prefix = '',
  duration = 2.2,
  delay = 0,
  className = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      const ctrl = animate(0, value, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate(v) {
          if (ref.current) {
            ref.current.textContent =
              prefix + Math.round(v).toLocaleString('fr-FR') + suffix;
          }
        },
      });
      return () => ctrl.stop();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, value, duration, delay, prefix, suffix]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}0{suffix}
    </span>
  );
}

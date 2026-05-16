'use client';
import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

export type AnimVariant = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'popIn' | 'fade' | 'bounceIn';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const VARIANTS: Record<AnimVariant, Variants> = {
  fadeUp:    { hidden: { opacity: 0, y: 38 },       visible: { opacity: 1, y: 0 } },
  fadeDown:  { hidden: { opacity: 0, y: -28 },      visible: { opacity: 1, y: 0 } },
  fadeLeft:  { hidden: { opacity: 0, x: -38 },      visible: { opacity: 1, x: 0 } },
  fadeRight: { hidden: { opacity: 0, x: 38 },       visible: { opacity: 1, x: 0 } },
  popIn:     { hidden: { opacity: 0, scale: 0.78 }, visible: { opacity: 1, scale: 1 } },
  fade:      { hidden: { opacity: 0 },              visible: { opacity: 1 } },
  bounceIn:  { hidden: { opacity: 0, scale: 0.65 }, visible: { opacity: 1, scale: 1 } },
};

interface AnimateInProps {
  children: ReactNode;
  variant?: AnimVariant;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export function AnimateIn({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.65,
  className,
  threshold = 0.15,
}: AnimateInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={VARIANTS[variant]}
      transition={
        variant === 'bounceIn'
          ? { type: 'spring', stiffness: 260, damping: 18, delay }
          : { duration, delay, ease: EASE }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Wrapper stagger container — enfants doivent utiliser StaggerItem */
export function StaggerIn({
  children,
  className,
  stagger = 0.1,
  threshold = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  threshold?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  variant = 'fadeUp',
  className,
}: {
  children: ReactNode;
  variant?: AnimVariant;
  className?: string;
}) {
  return (
    <motion.div
      variants={VARIANTS[variant]}
      transition={{ duration: 0.6, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

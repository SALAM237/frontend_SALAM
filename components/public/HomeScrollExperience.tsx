'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HomeScrollExperience({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const scenes = gsap.utils.toArray<HTMLElement>('[data-scroll-scene]');
    const media = gsap.matchMedia();

    media.add('(min-width: 768px)', () => {
      scenes.forEach((scene, index) => {
        const direction = index % 2 === 0 ? -1 : 1;
        const heading = scene.querySelector<HTMLElement>('h2');
        const content = scene.querySelector<HTMLElement>('[data-scroll-content]');

        gsap.fromTo(scene,
          { autoAlpha: 0, x: direction * 34, y: 42 },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: scene, start: 'top 86%', once: true },
          },
        );

        if (heading) {
          gsap.fromTo(heading,
            { autoAlpha: 0, yPercent: 45, filter: 'blur(7px)' },
            {
              autoAlpha: 1,
              yPercent: 0,
              filter: 'blur(0px)',
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: { trigger: heading, start: 'top 90%', once: true },
            },
          );
        }

        if (content && scene.dataset.scrollDrift === 'true') {
          gsap.fromTo(content, { y: -14 }, {
            y: 18,
            ease: 'none',
            scrollTrigger: {
              trigger: scene,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          });
        }
      });
    });

    media.add('(max-width: 767px)', () => {
      scenes.forEach(scene => {
        const heading = scene.querySelector<HTMLElement>('h2');
        gsap.fromTo(scene, { autoAlpha: 0, y: 24 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: { trigger: scene, start: 'top 92%', once: true },
        });
        if (heading) {
          gsap.fromTo(heading, { autoAlpha: 0, y: 18 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: { trigger: heading, start: 'top 94%', once: true },
          });
        }
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      window.removeEventListener('load', refresh);
      media.revert();
    };
  }, { scope: root });

  return <div ref={root}>{children}</div>;
}
"use client";

import { useEffect, useRef } from "react";

export function ParallaxBanner() {
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mobileRef.current;
    if (!el) return;

    const onScroll = () => {
      /*
        Correction :
        Avant, le parallax JS était désactivé dès 768px.
        Or les tablettes font souvent 768px, 820px, 834px ou 1024px.
        Donc on garde le parallax JS actif jusqu'à 1024px.
      */
      if (window.innerWidth >= 1024) {
        el.style.transform = "translateY(0)";
        return;
      }

      const section = el.parentElement;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const offset = -(rect.top * 0.4);

      el.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ height: "100vh" }}>
      {/* Desktop lg+ : bg-fixed → parallax CSS natif */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-fixed lg:block"
        style={{
          backgroundImage: "url('/images/gallery/image_parallax_SALAM.png')",
        }}
      />

      {/* Mobile + tablette : parallax JS via translateY */}
      <div
        ref={mobileRef}
        className="absolute inset-x-0 -top-[25%] bottom-[-25%] bg-cover bg-center will-change-transform lg:hidden"
        style={{
          backgroundImage: "url('/images/gallery/image_parallax_SALAM.png')",
        }}
      />

      {/* Overlay vert sombre */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-black/55 to-black/30" />

      {/* Contenu */}
      <div className="relative z-10 flex h-full flex-col items-start justify-center px-[clamp(1.5rem,6vw,6rem)]">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
          Notre mission
        </p>

        <h2 className="max-w-2xl text-[clamp(1.1rem,3vw,2.55rem)] font-black leading-tight tracking-[-0.04em] text-white drop-shadow-lg">
          Construire des passerelles entre <br className="hidden sm:block" />
          le <span className="text-emerald-400">Cameroun</span>, le <span className="text-red-400">Maroc</span> et le <span className="text-yellow-300">monde.</span>
        </h2>

        <p className="mt-4 max-w-xl text-[clamp(0.85rem,1.2vw,1rem)] leading-7 text-white/75">
          SALAM accompagne chaque lauréat dans son parcours — de l&apos;université
          à la carrière — en s&apos;appuyant sur un réseau solidaire de plus de
          400 membres.
        </p>

        <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 via-red-400 to-yellow-300" />
      </div>
    </section>
  );
}
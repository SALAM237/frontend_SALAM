"use client";

import { useEffect, useRef, useState } from "react";

export function ParallaxBanner() {
  const mobileRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ height: "100vh" }}>
      <style>{`
        @keyframes bounce-in-left {
          0%   { transform: translateX(-600px); opacity: 0; animation-timing-function: ease-in; }
          38%  { transform: translateX(0);      opacity: 1; animation-timing-function: ease-out; }
          55%  { transform: translateX(-50px);  animation-timing-function: ease-in; }
          72%  { transform: translateX(0);      animation-timing-function: ease-out; }
          81%  { transform: translateX(-20px);  animation-timing-function: ease-in; }
          90%  { transform: translateX(0);      animation-timing-function: ease-out; }
          95%  { transform: translateX(-6px);   animation-timing-function: ease-in; }
          100% { transform: translateX(0);      animation-timing-function: ease-out; }
        }
        .bounce-in-left {
          -webkit-animation: bounce-in-left 1.3s both;
                  animation: bounce-in-left 1.3s both;
        }
        @keyframes bounce-in-right {
          0%   { transform: translateX(600px); opacity: 0; animation-timing-function: ease-in; }
          38%  { transform: translateX(0);     opacity: 1; animation-timing-function: ease-out; }
          55%  { transform: translateX(50px);  animation-timing-function: ease-in; }
          72%  { transform: translateX(0);     animation-timing-function: ease-out; }
          81%  { transform: translateX(20px);  animation-timing-function: ease-in; }
          90%  { transform: translateX(0);     animation-timing-function: ease-out; }
          95%  { transform: translateX(6px);   animation-timing-function: ease-in; }
          100% { transform: translateX(0);     animation-timing-function: ease-out; }
        }
        .bounce-in-right {
          -webkit-animation: bounce-in-right 1.3s both;
                  animation: bounce-in-right 1.3s both;
        }
        @keyframes fade-in-bck {
          0%   { transform: translateZ(80px); opacity: 0; }
          100% { transform: translateZ(0);    opacity: 1; }
        }
        .fade-in-bck {
          -webkit-animation: fade-in-bck 1.1s cubic-bezier(.39,.575,.565,1.000) both;
                  animation: fade-in-bck 1.1s cubic-bezier(.39,.575,.565,1.000) both;
        }
        @keyframes puff-in-center {
          0%   { transform: scale(2); filter: blur(4px); opacity: 0; }
          100% { transform: scale(1); filter: blur(0);   opacity: 1; }
        }
        .puff-in-center {
          -webkit-animation: puff-in-center 1.0s cubic-bezier(.47,0.000,.745,.715) both;
                  animation: puff-in-center 1.0s cubic-bezier(.47,0.000,.745,.715) both;
        }
      `}</style>
      {/* Desktop lg+ : bg-fixed → parallax CSS natif */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-fixed lg:block"
        style={{
          backgroundImage: "url('/images/gallery/image_parallax_SALAM_1920.webp')",
        }}
      />

      {/* Mobile + tablette : parallax JS via translateY */}
      <div
        ref={mobileRef}
        className="absolute inset-x-0 -top-[25%] bottom-[-25%] bg-cover bg-center will-change-transform lg:hidden"
        style={{
          backgroundImage: "url('/images/gallery/image_parallax_SALAM_1200.webp')",
        }}
      />

      {/* Overlay vert sombre */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-black/55 to-black/30" />

      {/* Contenu */}
      <div className="relative z-10 flex h-full flex-col items-start justify-center px-[clamp(1.5rem,6vw,6rem)]">
        <p style={visible ? { animationDelay: '0.2s' } : undefined} className={`mb-3 text-xs font-black uppercase tracking-[0.28em] text-emerald-300 ${visible ? 'bounce-in-left' : 'opacity-0'}`}>
          Notre mission
        </p>

        <h2 className="max-w-2xl text-[clamp(1.1rem,3vw,2.55rem)] font-black leading-tight tracking-[-0.04em] text-white drop-shadow-lg">
          <span style={visible ? { animationDelay: '1.7s' } : undefined} className={`block ${visible ? 'bounce-in-right' : 'opacity-0'}`}>
            Construire des passerelles entre
          </span>
          <span style={visible ? { animationDelay: '3.2s' } : undefined} className={`block ${visible ? 'bounce-in-left' : 'opacity-0'}`}>
            le <span className="text-emerald-400">Cameroun</span>, le <span className="text-red-400">Maroc</span> et le <span className="text-yellow-300">monde.</span>
          </span>
        </h2>

        <p style={visible ? { animationDelay: '4.7s' } : undefined} className={`mt-4 max-w-xl text-[clamp(0.85rem,1.2vw,1rem)] leading-7 text-white/75 ${visible ? 'fade-in-bck' : 'opacity-0'}`}>
          SALAM accompagne chaque lauréat dans son parcours — de l&apos;université
          à la carrière — en s&apos;appuyant sur un réseau solidaire de plus de
          400 membres.
        </p>

        <div style={visible ? { animationDelay: '6.0s' } : undefined} className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 via-red-400 to-yellow-300 ${visible ? 'puff-in-center' : 'opacity-0'}`} />
      </div>
    </section>
  );
}

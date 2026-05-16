'use client';

import { useRef } from 'react';

export type MemberCardData = {
  id: string;          // ex: SALAM-2024-0042
  firstName: string;
  lastName: string;
  role: string;        // ex: Membre actif, Alumni, Bureau
  antenne?: string;    // ex: Paris, Casablanca
  year: number;        // année de validité
  photo?: string;
};

function QRCode({ data, size = 120 }: { data: string; size?: number }) {
  const encoded = encodeURIComponent(data);
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=07140d&color=ffffff&margin=6&qzone=1`}
      alt="QR code carte de membre"
      width={size}
      height={size}
      className="rounded-lg"
    />
  );
}

export function MemberCard({ member, printable = false }: { member: MemberCardData; printable?: boolean }) {
  const verifyUrl = `https://www.association-salam.org/verify/${member.id}`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl w-full ${printable ? 'shadow-none' : 'shadow-2xl shadow-emerald-950/40'}`}
      style={{ maxWidth: 400, aspectRatio: '8/5', background: 'linear-gradient(135deg, #07140d 0%, #0b1f15 55%, #10261a 100%)' }}
    >
      {/* Flag stripe top */}
      <div className="absolute left-0 right-0 top-0 h-[5px]" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <div className="absolute right-[-40px] top-[-40px] h-48 w-48 rounded-full bg-emerald-500/5" />
      <div className="absolute bottom-[-30px] left-[-30px] h-40 w-40 rounded-full bg-yellow-400/5" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-5 pt-6">

        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            {/* Logo + name */}
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo/logo_salam_wbg.png" alt="SALAM" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20" />
              <div>
                <p className="text-[11px] font-black tracking-[0.22em] text-white">SALAM</p>
                <p className="text-[8px] font-medium tracking-[0.1em] text-white/45">SOLIDAIRE ASSOCIATIVE</p>
              </div>
            </div>
            {/* Badge */}
            <div className="mt-3 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400">Carte de membre</span>
            </div>
          </div>

          {/* QR Code */}
          <QRCode data={verifyUrl} size={80} />
        </div>

        {/* Bottom row */}
        <div>
          {/* Member name */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Titulaire</p>
          <p className="mt-0.5 text-[1.45rem] font-black leading-tight tracking-[-0.02em] text-white">
            {member.firstName} {member.lastName.toUpperCase()}
          </p>

          {/* Role + ID + year */}
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-emerald-400">{member.role}</p>
              {member.antenne && <p className="text-[9px] text-white/35">Antenne {member.antenne}</p>}
            </div>
            <div className="text-right">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">N° membre</p>
              <p className="text-[11px] font-black tracking-[0.08em] text-white/70">{member.id}</p>
              <p className="text-[9px] text-white/30">Valide {member.year}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flag stripe bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
    </div>
  );
}

'use client';

import Image from 'next/image';
import { formatFullName } from '@/lib/format-name';

export type MemberCardData = {
  id: string;
  firstName: string;
  lastName: string;
  gender?: 'homme' | 'femme';
  role: string;
  antenne?: string;
  year: number;
  photo?: string;
};

function QRCode({ data, size = 72 }: { data: string; size?: number }) {
  const encoded = encodeURIComponent(data);
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=07140d&color=ffffff&margin=4&qzone=1`}
      alt="QR code"
      width={size}
      height={size}
      className="rounded-lg shrink-0"
      crossOrigin="anonymous"
    />
  );
}

export function MemberCard({ member, printable = false }: { member: MemberCardData; printable?: boolean }) {
  const verifyUrl = `https://www.association-salam.org/verify/${member.id}`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl w-full ${printable ? 'shadow-none' : 'shadow-2xl shadow-emerald-950/40'}`}
      style={{
        maxWidth: 'clamp(18.55rem, 92vw, 25rem)',
        aspectRatio: '8/5',
        minHeight: 200,
        background: 'linear-gradient(135deg, #07140d 0%, #0b1f15 55%, #10261a 100%)',
      }}
    >
      {/* Flag stripe top */}
      <div className="absolute left-0 right-0 top-0 h-[5px]" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <div className="absolute right-[-40px] top-[-40px] h-48 w-48 rounded-full bg-emerald-500/5" />
      <div className="absolute bottom-[-30px] left-[-30px] h-40 w-40 rounded-full bg-yellow-400/5" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-3.5 pt-5 sm:p-5 sm:pt-6">

        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Image src="/images/logo/logo_salam_wbg.png" alt="SALAM" width={36} height={36} className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/20 sm:h-9 sm:w-9" />
              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-[0.22em] text-white sm:text-[11px]">SALAM</p>
                <p className="text-[7px] font-medium tracking-[0.1em] text-white/45 sm:text-[8px]">SOLIDAIRE ASSOCIATIVE</p>
              </div>
            </div>
            <div className="mt-2 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-400 sm:text-[9px]">Carte de membre</span>
            </div>
          </div>

          {/* QR Code */}
          <QRCode data={verifyUrl} size={64} />
        </div>

        {/* Bottom row */}
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40 sm:text-[10px]">Titulaire</p>
          {member.gender && (
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/35 sm:text-[9px]">
              {member.gender === 'femme' ? 'Madame' : 'Monsieur'}
            </p>
          )}
          <p className="mt-0.5 truncate text-[1.1rem] font-black leading-tight tracking-[-0.02em] text-white sm:text-[1.3rem]">
            {formatFullName(member.firstName, member.lastName)}
          </p>

          <div className="mt-1.5 flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-semibold text-emerald-400 sm:text-[10px]">{member.role}</p>
              {member.antenne && <p className="truncate text-[8px] text-white/35 sm:text-[9px]">Antenne {member.antenne}</p>}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/35 sm:text-[9px]">N° membre</p>
              <p className="text-[10px] font-black tracking-[0.06em] text-white/70 sm:text-[11px]">{member.id}</p>
              <p className="text-[8px] text-white/30 sm:text-[9px]">Valide {member.year}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flag stripe bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
    </div>
  );
}

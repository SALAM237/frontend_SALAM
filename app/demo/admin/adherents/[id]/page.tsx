'use client';

import Link from 'next/link';
import { CreditCard, Mail, MapPin } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../../_components/DemoShell';
import { demoMembers } from '@/data/demo/demo-members';

export default function DemoAdminMemberDetailPage({ params }: { params: { id: string } }) {
  const member = demoMembers.find(item => item.id === params.id) ?? demoMembers[0];
  return (
    <DemoPortalShell type="admin" title={member.name}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <DemoCard className="p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-lg font-black text-emerald-700">{member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-black text-neutral-900">{member.name}</p>
              <p className="text-sm text-neutral-500">{member.role}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <DemoStatus tone={member.status === 'active' ? 'green' : 'amber'}>{member.status === 'active' ? 'Actif' : 'En attente'}</DemoStatus>
                <DemoStatus tone="blue">Profil demo</DemoStatus>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-neutral-50 p-4"><Mail className="mb-2 text-emerald-600" size={16} /><p className="text-xs text-neutral-400">Email</p><p className="text-sm font-semibold">demo@salam.org</p></div>
            <div className="rounded-xl bg-neutral-50 p-4"><MapPin className="mb-2 text-emerald-600" size={16} /><p className="text-xs text-neutral-400">Ville</p><p className="text-sm font-semibold">{member.city}</p></div>
            <div className="rounded-xl bg-neutral-50 p-4"><CreditCard className="mb-2 text-emerald-600" size={16} /><p className="text-xs text-neutral-400">Carte</p><p className="text-sm font-semibold">SALAM-2026</p></div>
          </div>
        </DemoCard>
        <DemoCard className="p-5">
          <p className="text-sm font-black">Actions demo</p>
          <div className="mt-4 space-y-2">
            <Link href="/demo/admin/cartes" className="block rounded-xl border border-neutral-100 px-4 py-3 text-sm font-semibold">Voir la carte</Link>
            <Link href="/demo/admin/facturation" className="block rounded-xl border border-neutral-100 px-4 py-3 text-sm font-semibold">Generer facture</Link>
            <Link href="/demo/admin/messages" className="block rounded-xl border border-neutral-100 px-4 py-3 text-sm font-semibold">Envoyer message</Link>
          </div>
        </DemoCard>
      </div>
    </DemoPortalShell>
  );
}

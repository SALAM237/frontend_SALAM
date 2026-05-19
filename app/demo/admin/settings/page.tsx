'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

export default function DemoAdminSettings() {
  const [saved,     setSaved]     = useState(false);
  const [assocName, setAssocName] = useState('Association SALAM Cameroun');
  const [email,     setEmail]     = useState('contact@salam-cameroun.com');
  const [notifs,    setNotifs]    = useState({ newMember: true, newMsg: true, activity: false });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs(v => ({ ...v, [key]: !v[key] }));

  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#f4f6f5]">
      <header className="border-b border-neutral-200/80 bg-white/95 px-5 py-4">
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <Link href="/demo/admin" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition">
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-emerald-600" />
            <h1 className="text-sm font-black text-neutral-900">Paramètres</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 p-5">
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Informations de l&apos;association</p>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Nom de l&apos;association</label>
            <input
              value={assocName}
              onChange={e => setAssocName(e.target.value)}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Email de contact</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Site web</label>
            <input
              disabled
              defaultValue="https://www.salam-cameroun.com"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-400"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Notifications admin</p>
          {[
            { key: 'newMember' as const, label: 'Nouvel adhérent inscrit'  },
            { key: 'newMsg'    as const, label: 'Nouveau message reçu'     },
            { key: 'activity'  as const, label: 'Nouvelle activité créée'  },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <p className="text-sm text-neutral-700">{label}</p>
              <button
                onClick={() => toggleNotif(key)}
                className={`relative h-6 w-11 rounded-full transition-all ${notifs[key] ? 'bg-emerald-500' : 'bg-neutral-200'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${notifs[key] ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition-all ${
            saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {saved
            ? <><CheckCircle2 size={15} /> Enregistré !</>
            : <><Save size={15} /> Enregistrer (démo)</>
          }
        </button>
      </main>
    </div>
  );
}

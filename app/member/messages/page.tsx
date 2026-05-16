'use client';

import { useState } from 'react';
import { Send, MessageSquare, Search, ArrowLeft } from 'lucide-react';

type Message = { id: number; from: string; subject: string; preview: string; date: string; read: boolean; body: string };

const MESSAGES: Message[] = [
  { id: 1, from: 'Équipe SALAM',       subject: 'Bienvenue dans votre espace membre !',      preview: 'Bonjour Jean, nous sommes ravis de vous accueillir…', date: '14 mai', read: false, body: "Bonjour Jean,\n\nNous sommes ravis de vous accueillir dans la communauté SALAM !\n\nVotre espace membre est maintenant actif. Vous pouvez y accéder à votre carte de membre, consulter les activités à venir et gérer votre profil.\n\nN'hésitez pas à nous contacter pour toute question.\n\nCordialement,\nL'équipe SALAM" },
  { id: 2, from: 'Équipe SALAM',       subject: 'Votre carte de membre est disponible',       preview: 'Votre carte officielle SALAM est prête à être téléchargée…', date: '14 mai', read: false, body: "Bonjour Jean,\n\nVotre carte de membre SALAM est maintenant disponible dans votre espace.\n\nVous pouvez la télécharger ou la partager directement depuis la rubrique \"Ma carte\".\n\nLe QR code intégré permet de vérifier votre adhésion lors de nos événements.\n\nCordialement,\nL'équipe SALAM" },
  { id: 3, from: 'Bureau exécutif',    subject: 'Invitation : Soirée Networking 22 mai',      preview: 'Cher membre, nous avons le plaisir de vous inviter…', date: '10 mai', read: true,  body: "Cher membre,\n\nNous avons le plaisir de vous inviter à notre soirée Networking du 22 mai 2025 à Paris.\n\nAu programme : rencontres professionnelles, dîner débat et échanges en réseau.\n\nInscription obligatoire avant le 20 mai.\n\nCordialement,\nLe Bureau exécutif" },
  { id: 4, from: 'Admin SALAM',        subject: 'Renouvellement adhésion 2025',               preview: 'Votre adhésion pour 2025 est confirmée. Voici les détails…', date: '2 mai', read: true,   body: "Bonjour Jean,\n\nNous confirmons votre adhésion SALAM pour l'année 2025.\n\nVotre numéro de membre : SALAM-2024-0042\nStatut : Membre actif\nAntenne : Paris\n\nMerci pour votre engagement.\n\nL'Administration SALAM" },
];

export default function MessagesPage() {
  const [selected, setSelected]   = useState<Message | null>(MESSAGES[0]);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch]       = useState('');
  const [reply, setReply]         = useState('');
  const [replySent, setReplySent] = useState(false);

  const filtered = MESSAGES.filter(m =>
    `${m.from} ${m.subject} ${m.preview}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleReply = () => {
    if (!reply.trim()) return;
    setReplySent(true);
    setReply('');
    setTimeout(() => setReplySent(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5">
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Messages</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Communications de l&apos;équipe SALAM</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] min-h-[420px] lg:h-[calc(100vh-200px)]">

        {/* Message list */}
        <div className={`flex-col rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden ${showDetail ? 'hidden lg:flex' : 'flex'}`}>
          <div className="border-b border-neutral-100 p-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-xs placeholder:text-neutral-400 focus:outline-none focus:border-emerald-300"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
            {filtered.map(m => (
              <button
                key={m.id}
                onClick={() => { setSelected(m); setShowDetail(true); }}
                className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-neutral-50 ${selected?.id === m.id ? 'bg-emerald-50/60 border-l-[3px] border-l-emerald-500' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-xs ${m.read ? 'font-semibold text-neutral-600' : 'font-black text-neutral-900'}`}>{m.from}</p>
                  <span className="shrink-0 text-[10px] text-neutral-400">{m.date}</span>
                </div>
                <p className={`mt-0.5 truncate text-xs ${m.read ? 'text-neutral-500' : 'font-semibold text-neutral-700'}`}>{m.subject}</p>
                <p className="mt-0.5 truncate text-[10px] text-neutral-400">{m.preview}</p>
                {!m.read && (
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="py-8 text-center">
                <MessageSquare size={28} className="mx-auto text-neutral-200" />
                <p className="mt-2 text-xs text-neutral-400">Aucun message</p>
              </div>
            )}
          </div>
        </div>

        {/* Message view */}
        {selected ? (
          <div className={`flex-col rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden ${showDetail ? 'flex' : 'hidden lg:flex'}`}>
            {/* Header */}
            <div className="border-b border-neutral-100 p-5">
              <button onClick={() => setShowDetail(false)} className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 lg:hidden">
                <ArrowLeft size={13} /> Retour aux messages
              </button>
              <h2 className="font-black text-neutral-900">{selected.subject}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[10px] font-black text-white">
                  {selected.from[0]}
                </div>
                <p className="text-xs font-semibold text-neutral-600">{selected.from}</p>
                <span className="text-[10px] text-neutral-400">{selected.date}</span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <p className="whitespace-pre-line text-sm leading-[1.75] text-neutral-700">{selected.body}</p>
            </div>

            {/* Reply */}
            <div className="border-t border-neutral-100 p-4">
              <div className="flex gap-2">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Écrire une réponse…"
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-neutral-200 px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  onClick={handleReply}
                  disabled={!reply.trim() || replySent}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl transition-all ${replySent ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'} disabled:opacity-40`}
                >
                  <Send size={15} />
                </button>
              </div>
              {replySent && <p className="mt-2 text-xs font-semibold text-emerald-600">✓ Réponse envoyée</p>}
            </div>
          </div>
        ) : (
          <div className="hidden items-center justify-center rounded-2xl border border-neutral-100 bg-white shadow-sm lg:flex">
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto text-neutral-200" />
              <p className="mt-3 text-sm font-semibold text-neutral-400">Sélectionnez un message</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

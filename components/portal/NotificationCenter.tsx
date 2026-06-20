'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { type PortalSpace, useNotifications, useReadAllNotifications, useReadNotification } from '@/lib/api/notifications';

function relativeDate(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(delta / 60_000));
  if (minutes < 1) return 'A l instant';
  if (minutes < 60) return 'Il y a ' + minutes + ' min';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return 'Il y a ' + hours + ' h';
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function NotificationCenter({ space }: { space: PortalSpace }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data, isLoading } = useNotifications(space);
  const readOne = useReadNotification(space);
  const readAll = useReadAllNotifications(space);
  const feed = data?.data;

  const openItem = (id: string, href: string) => {
    readOne.mutate(id);
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="relative">
      <button type="button" aria-label="Notifications" onClick={() => setOpen(value => !value)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-emerald-300 hover:text-emerald-700">
        <Bell size={15} />
        {(feed?.unread ?? 0) > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
            {Math.min(feed?.unread ?? 0, 99)}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button type="button" aria-label="Fermer les notifications" className="fixed inset-0 z-[90] cursor-default" onClick={() => setOpen(false)} />
            <motion.section initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
              className="fixed left-3 right-3 top-16 z-[100] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px]">
              <header className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-neutral-900">Notifications</p>
                  <p className="text-[11px] text-neutral-400">{feed?.unread ?? 0} non lue(s)</p>
                </div>
                {(feed?.unread ?? 0) > 0 && (
                  <button type="button" onClick={() => readAll.mutate()} disabled={readAll.isPending}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800">
                    <CheckCheck size={13} /> Tout marquer comme lu
                  </button>
                )}
              </header>
              <div className="max-h-[min(70vh,480px)] overflow-y-auto">
                {isLoading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600" size={20} /></div>}
                {!isLoading && !feed?.items.length && (
                  <div className="px-5 py-12 text-center">
                    <Bell className="mx-auto mb-3 text-neutral-200" size={28} />
                    <p className="text-sm font-semibold text-neutral-500">Aucune notification</p>
                    <p className="mt-1 text-xs text-neutral-300">Vous etes a jour.</p>
                  </div>
                )}
                {feed?.items.map(item => (
                  <button key={item._id} type="button" onClick={() => openItem(item._id, item.href)}
                    className={'relative block w-full border-b border-neutral-50 px-4 py-3 text-left transition hover:bg-neutral-50 ' + (!item.readAt ? 'bg-emerald-50/40' : '')}>
                    {!item.readAt && <span className="absolute left-1.5 top-5 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-black text-neutral-800">{item.title}</p>
                      <span className="shrink-0 text-[10px] text-neutral-400">{relativeDate(item.occurredAt)}</span>
                    </div>
                    {item.message && <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-neutral-500">{item.message}</p>}
                  </button>
                ))}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
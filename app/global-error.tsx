'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="m-0 grid min-h-screen place-items-center bg-neutral-50 px-5 py-10 text-neutral-900">
        <main className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-red-50 text-xl font-black text-red-600">
            !
          </div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Cette page ne peut pas s’afficher
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            L’incident a été signalé automatiquement. Réessayez dans quelques instants.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="min-h-11 rounded-full bg-salam-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salam-green"
            >
              Réessayer
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salam-green"
            >
              Retour à l’accueil
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}

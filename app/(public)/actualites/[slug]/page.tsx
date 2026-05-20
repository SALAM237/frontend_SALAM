import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Newspaper, ChevronRight } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = { title: 'Actualité SALAM' };

export default function ActualiteDetailPage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <div className="border-b border-neutral-200 bg-white px-5 py-4 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-700 transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <Link href="/actualites" className="hover:text-neutral-700 transition-colors">Actualités</Link>
          <ChevronRight size={10} />
          <span className="text-neutral-600 capitalize">{params.slug.replace(/-/g, ' ')}</span>
        </div>
      </div>

      <div className="px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Link href="/actualites" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-emerald-700">
            <ArrowLeft size={15} /> Retour aux actualités
          </Link>

          <div className="mt-4 flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
              <Newspaper size={28} className="text-neutral-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-neutral-900">Article introuvable</h1>
              <p className="mt-2 max-w-sm text-sm text-neutral-500">
                Cet article n'existe pas encore ou n'est pas encore publié.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/actualites" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition-all">
                Toutes les actualités
              </Link>
              <Link href="/demo" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 transition-all">
                Voir la démo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

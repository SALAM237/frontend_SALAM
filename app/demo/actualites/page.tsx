'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Newspaper, FlaskConical, Calendar, User } from 'lucide-react';

const NEWS = [
  { id: 'n1', slug: 'lancement-plateforme-salam', title: 'Lancement de la nouvelle plateforme SALAM', excerpt: 'Une plateforme moderne pour connecter les membres et simplifier la gestion associative.', category: 'association', date: '15 mai 2026', author: 'Bureau SALAM' },
  { id: 'n2', slug: 'forum-emploi-2026', title: 'Forum Emploi SALAM 2026 : 200 participants réunis', excerpt: 'La 5e édition du Forum Emploi a réuni employeurs et jeunes professionnels de la diaspora camerounaise.', category: 'reseau', date: '10 mai 2026', author: 'Commission Réseau' },
  { id: 'n3', slug: 'partenariat-minsup', title: 'Partenariat officiel avec le MINSUP', excerpt: 'SALAM renforce ses liens avec le Ministère de l\'Enseignement Supérieur pour accompagner les étudiants.', category: 'partenariat', date: '2 mai 2026', author: 'Président SALAM' },
  { id: 'n4', slug: 'bourse-excellence-2026', title: 'Bourse d\'excellence SALAM 2026 — Candidatures ouvertes', excerpt: 'Les dossiers de candidature pour la bourse d\'excellence SALAM sont disponibles jusqu\'au 30 juin.', category: 'etude', date: '25 avr 2026', author: 'Commission Études' },
  { id: 'n5', slug: 'tournoi-sport-printemps', title: 'Tournoi sportif du printemps : résultats', excerpt: 'Le tournoi inter-antennes de football a rassemblé 8 équipes et plus de 120 joueurs à Paris.', category: 'sport', date: '18 avr 2026', author: 'Commission Sport' },
  { id: 'n6', slug: 'journee-integration', title: 'Journée d\'intégration des nouveaux membres', excerpt: 'Accueil chaleureux pour les 24 nouveaux membres ayant rejoint l\'association en avril 2026.', category: 'association', date: '12 avr 2026', author: 'Bureau SALAM' },
];

const CATS = [
  { id: 'all',          label: 'Toutes' },
  { id: 'association',  label: 'Association' },
  { id: 'reseau',       label: 'Réseau' },
  { id: 'etude',        label: 'Études' },
  { id: 'sport',        label: 'Sport' },
  { id: 'partenariat',  label: 'Partenariat' },
];

const CAT_COLORS: Record<string, string> = {
  association: 'bg-emerald-100 text-emerald-700',
  reseau:      'bg-blue-100 text-blue-700',
  etude:       'bg-yellow-100 text-yellow-700',
  sport:       'bg-red-100 text-red-700',
  partenariat: 'bg-purple-100 text-purple-700',
};

const CAT_GRADIENTS: Record<string, string> = {
  association: 'from-emerald-400 to-emerald-600',
  reseau:      'from-blue-400 to-blue-600',
  etude:       'from-yellow-400 to-orange-400',
  sport:       'from-red-400 to-red-600',
  partenariat: 'from-purple-400 to-purple-600',
};

export default function DemoActualitesPage() {
  const [cat, setCat] = useState('all');
  const list = cat === 'all' ? NEWS : NEWS.filter(n => n.category === cat);

  return (
    <main className="min-h-screen bg-[#fffdf8]">

      {/* Demo banner */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 border-b border-yellow-200 bg-yellow-50 px-5 py-2.5 md:px-8">
        <div className="flex items-center gap-2 text-xs font-bold text-yellow-800">
          <FlaskConical size={13} />
          Mode démo — données fictives
        </div>
        <Link href="/demo/actualites" className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 transition-colors">
          ← Version production
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <Link href="/demo" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-neutral-700 transition-colors">
            <ArrowLeft size={14} /> Démo
          </Link>
          <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
            Actualités <span className="text-emerald-600">SALAM</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{NEWS.length} articles publiés</p>
        </div>
      </div>

      <section className="px-5 py-10 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATS.map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`h-9 rounded-full px-4 text-xs font-bold transition-all ${
                  cat === c.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-dashed border-neutral-200 bg-white py-20 text-center">
              <Newspaper size={32} className="text-neutral-300" />
              <p className="text-sm font-bold text-neutral-400">Aucun article dans cette catégorie</p>
              <button onClick={() => setCat('all')} className="text-xs font-semibold text-emerald-700">Voir tous les articles</button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map(n => (
                <Link
                  key={n.id}
                  href={`/demo/actualites/${n.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className={`aspect-[16/9] bg-gradient-to-br ${CAT_GRADIENTS[n.category] ?? 'from-neutral-300 to-neutral-400'} flex items-center justify-center`}>
                    <Newspaper size={28} className="text-white/40" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${CAT_COLORS[n.category] ?? 'bg-neutral-100 text-neutral-600'}`}>
                      {n.category}
                    </span>
                    <h2 className="font-black leading-snug text-neutral-900 group-hover:text-emerald-700 transition-colors">
                      {n.title}
                    </h2>
                    <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-neutral-500">{n.excerpt}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-neutral-400 pt-1">
                      <span className="flex items-center gap-1"><Calendar size={10} />{n.date}</span>
                      <span className="flex items-center gap-1"><User size={10} />{n.author}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

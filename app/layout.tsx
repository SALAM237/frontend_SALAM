import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConditionalHeader } from '@/components/layout/ConditionalHeader';
import { Footer }            from '@/components/layout/Footer';
import { Providers }         from '@/components/shared/Providers';

/* ── Font ── */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/* ── Metadata ── */
export const metadata: Metadata = {
  title: {
    default: 'SALAM Cameroun — Réseau solidaire Cameroun & Maroc',
    template: '%s | SALAM Cameroun',
  },
  description:
    'Association SALAM — Entraide, culture, sport et accompagnement des lauréats camerounais et marocains en France. Rejoignez notre réseau solidaire.',
  keywords: ['SALAM', 'Cameroun', 'Maroc', 'association', 'solidarité', 'culture', 'sport', 'réseau'],
  authors: [{ name: 'Association SALAM Cameroun' }],
  metadataBase: new URL('https://salam-cameroun.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Association SALAM Cameroun',
    title: 'SALAM Cameroun — Réseau solidaire Cameroun & Maroc',
    description: 'Entraide, culture, sport et accompagnement des lauréats camerounais et marocains en France.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B8F3A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          <ConditionalHeader />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

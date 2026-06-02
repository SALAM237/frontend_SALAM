import type { Viewport } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { ConditionalHeader } from '@/components/layout/ConditionalHeader';
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';
import { Providers }         from '@/components/shared/Providers';
import SalamChatbot          from '@/components/chat/SalamChatbot';
import BreadcrumbSchema       from '@/components/seo/BreadcrumbSchema';
import GlobalSeoSchema        from '@/components/seo/GlobalSeoSchema';
import { defaultMetadata }    from '@/lib/seo';

const GOOGLE_ANALYTICS_ID = 'G-SZTN4DC4TE';

/* ── Font ── */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/* ── Metadata — export depuis lib/seo.ts ── */
export const metadata = defaultMetadata;

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor:   '#0B8F3A',
  viewportFit:  'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <meta charSet="UTF-8" />
        {/* ── NGO Schema — GEO / MEO / IA engines ── */}
        <GlobalSeoSchema />
        {/* ── Organization Schema — Google Knowledge Graph / IA ── */}
        {/* ── WebSite Schema + SearchAction — IA crawlers ── */}
        {/* ── FAQ Schema — ChatGPT / Perplexity / Gemini / Bing Copilot ── */}
      </head>
      <body className={inter.className}>
        <BreadcrumbSchema />
        <Providers>
          <ConditionalHeader />
          {children}
          <ConditionalFooter />
          <SalamChatbot />
        </Providers>
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  );
}

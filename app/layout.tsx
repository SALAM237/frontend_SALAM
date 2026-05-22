import type { Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConditionalHeader } from '@/components/layout/ConditionalHeader';
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';
import { Providers }         from '@/components/shared/Providers';
import SalamChatbot          from '@/components/chat/SalamChatbot';
import { defaultMetadata, schemaOrg, organizationSchema, websiteSchema, faqSchema } from '@/lib/seo';

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
        {/* ── NGO Schema — GEO / MEO / IA engines ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        {/* ── Organization Schema — Google Knowledge Graph / IA ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* ── WebSite Schema + SearchAction — IA crawlers ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* ── FAQ Schema — ChatGPT / Perplexity / Gemini / Bing Copilot ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <ConditionalHeader />
          {children}
          <ConditionalFooter />
          <SalamChatbot />
        </Providers>
      </body>
    </html>
  );
}

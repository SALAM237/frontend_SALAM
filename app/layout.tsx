import type { Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import 'react-phone-number-input/style.css';
import { ConditionalHeader } from '@/components/layout/ConditionalHeader';
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';
import { Providers } from '@/components/shared/Providers';
import SalamChatbot from '@/components/chat/SalamChatbot';
import AnalyticsClickTracker from '@/components/analytics/AnalyticsClickTracker';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import GlobalSeoSchema from '@/components/seo/GlobalSeoSchema';
import { defaultMetadata } from '@/lib/seo';

const GOOGLE_ANALYTICS_ID = 'G-SZTN4DC4TE';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = defaultMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B8F3A',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className}>
        <GlobalSeoSchema />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
        <BreadcrumbSchema />
        <Providers>
          <AnalyticsClickTracker />
          <ConditionalHeader />
          {children}
          <ConditionalFooter />
          <SalamChatbot />
        </Providers>
      </body>
    </html>
  );
}

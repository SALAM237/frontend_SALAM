export const revalidate = 3600;

import dynamic from 'next/dynamic';
import { HeroSection }      from '@/components/public/HeroSection';
import { MarqueeSection }   from '@/components/public/MarqueeSection';
import SalamStatsSection    from '@/components/public/SalamStatsSection';
import { ParallaxBanner }   from '@/components/public/ParallaxBanner';
import MissionsSection      from '@/components/public/MissionsSection';
import { EngagementSection } from '@/components/public/EngagementStection';
import { CTABanner }        from '@/components/public/CTABanner';

import FeaturedSpotlight from '@/components/public/FeaturedSpotlight';
import type { FeaturedItem } from '@/lib/api/featured';
const ActivityPreview = dynamic(() => import('@/components/public/ActivityPreview').then(mod => mod.ActivityPreview));
const OpportunityPreview = dynamic(() => import('@/components/public/OpportunityPreview').then(mod => mod.OpportunityPreview));
const NewsPreview = dynamic(() => import('@/components/public/NewsPreview').then(mod => mod.NewsPreview));
const GalleryPreview = dynamic(() => import('@/components/public/GalleryPreview').then(mod => mod.GalleryPreview));

async function featuredItems(): Promise<FeaturedItem[]> {
  try {
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const response = await fetch(api + '/api/v1/public/featured', { next: { revalidate: 60 } });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch { return []; }
}

export default async function HomePage() {
  const featured = await featuredItems();
  return (
    <main className="overflow-x-clip">
      <HeroSection />
      <FeaturedSpotlight initialItems={featured} />
      <MarqueeSection />
      <SalamStatsSection />
      <ParallaxBanner />
      <MissionsSection />
      <EngagementSection />
      <ActivityPreview />
      <OpportunityPreview />
      <NewsPreview />
      <GalleryPreview />
      <CTABanner />
    </main>
  );
}

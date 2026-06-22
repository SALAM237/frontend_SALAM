export const revalidate = 3600;

import dynamic from 'next/dynamic';
import { HeroSection }      from '@/components/public/HeroSection';
import { MarqueeSection }   from '@/components/public/MarqueeSection';
import SalamStatsSection    from '@/components/public/SalamStatsSection';
import { ParallaxBanner }   from '@/components/public/ParallaxBanner';
import MissionsSection      from '@/components/public/MissionsSection';
import { EngagementSection } from '@/components/public/EngagementStection';
import { CTABanner }        from '@/components/public/CTABanner';
import { HomeScrollExperience } from '@/components/public/HomeScrollExperience';

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
      <HomeScrollExperience>
        <div data-scroll-scene><div data-scroll-content><FeaturedSpotlight initialItems={featured} /></div></div>
        <div data-scroll-scene><div data-scroll-content><MarqueeSection /></div></div>
        <div data-scroll-scene data-scroll-drift="true"><div data-scroll-content><SalamStatsSection /></div></div>
        <div data-scroll-scene><div data-scroll-content><ParallaxBanner /></div></div>
        <div data-scroll-scene data-scroll-drift="true"><div data-scroll-content><MissionsSection /></div></div>
        <div data-scroll-scene><div data-scroll-content><EngagementSection /></div></div>
        <div data-scroll-scene data-scroll-drift="true"><div data-scroll-content><ActivityPreview /></div></div>
        <div data-scroll-scene><div data-scroll-content><OpportunityPreview /></div></div>
        <div data-scroll-scene data-scroll-drift="true"><div data-scroll-content><NewsPreview /></div></div>
        <div data-scroll-scene><div data-scroll-content><GalleryPreview /></div></div>
        <div data-scroll-scene><div data-scroll-content><CTABanner /></div></div>
      </HomeScrollExperience>
    </main>
  );
}

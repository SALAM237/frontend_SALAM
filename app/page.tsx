export const revalidate = 3600;

import dynamic from 'next/dynamic';
import { HeroSection }      from '@/components/public/HeroSection';
import { MarqueeSection }   from '@/components/public/MarqueeSection';
import SalamStatsSection    from '@/components/public/SalamStatsSection';
import { ParallaxBanner }   from '@/components/public/ParallaxBanner';
import MissionsSection      from '@/components/public/MissionsSection';
import { EngagementSection } from '@/components/public/EngagementStection';
import { CTABanner }        from '@/components/public/CTABanner';

const ActivityPreview = dynamic(() => import('@/components/public/ActivityPreview').then(mod => mod.ActivityPreview));
const OpportunityPreview = dynamic(() => import('@/components/public/OpportunityPreview').then(mod => mod.OpportunityPreview));
const GalleryPreview = dynamic(() => import('@/components/public/GalleryPreview').then(mod => mod.GalleryPreview));

export default function HomePage() {
  return (
    <main className="overflow-x-clip">
      <HeroSection />
      <MarqueeSection />
      <SalamStatsSection />
      <ParallaxBanner />
      <MissionsSection />
      <EngagementSection />
      <ActivityPreview />
      <OpportunityPreview />
      <GalleryPreview />
      <CTABanner />
    </main>
  );
}

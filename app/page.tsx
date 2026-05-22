export const revalidate = 3600;

import { HeroSection }      from '@/components/public/HeroSection';
import { MarqueeSection }   from '@/components/public/MarqueeSection';
import SalamStatsSection    from '@/components/public/SalamStatsSection';
import { ParallaxBanner }   from '@/components/public/ParallaxBanner';
import MissionsSection      from '@/components/public/MissionsSection';
import { EngagementSection } from '@/components/public/EngagementStection';
import { ActivityPreview }  from '@/components/public/ActivityPreview';
import { OpportunityPreview } from '@/components/public/OpportunityPreview';
import { GalleryPreview }   from '@/components/public/GalleryPreview';
import { CTABanner }        from '@/components/public/CTABanner';

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

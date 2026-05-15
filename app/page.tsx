import { HeroSection }      from '@/components/public/HeroSection';
import { MarqueeSection }   from '@/components/public/MarqueeSection';
import SalamStatsSection    from '@/components/public/SalamStatsSection';
import { ParallaxBanner }   from '@/components/public/ParallaxBanner';
import MissionsSection      from '@/components/public/MissionsSection';
import { ValuesSection }    from '@/components/public/ValuesSection';
import { ActivityPreview }  from '@/components/public/ActivityPreview';
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
      <ValuesSection />
      <ActivityPreview />
      <GalleryPreview />
      <CTABanner />
    </main>
  );
}

import { Suspense } from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedServices, FeaturedServicesSkeleton } from '@/components/home/featured-services';
import { TrustSection } from '@/components/home/trust-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { Footer } from '@/components/home/footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Services */}
      <Suspense fallback={<FeaturedServicesSkeleton />}>
        <FeaturedServices />
      </Suspense>

      {/* Trust Section */}
      <TrustSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}

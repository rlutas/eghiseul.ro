import { Suspense } from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { SocialProofSection } from '@/components/home/social-proof-section';
import { FeaturedServices, FeaturedServicesSkeleton } from '@/components/home/featured-services';
import { UseCasesSection } from '@/components/home/use-cases-section';
import { PainPointsSection } from '@/components/home/pain-points-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { PricingSection } from '@/components/home/pricing-section';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { FAQSection } from '@/components/home/faq-section';
import { FinalCTASection } from '@/components/home/final-cta-section';
import { Footer } from '@/components/home/footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Social Proof - Stats & Trust */}
      <SocialProofSection />

      {/* 3. Featured Services */}
      <section id="servicii">
        <Suspense fallback={<FeaturedServicesSkeleton />}>
          <FeaturedServices />
        </Suspense>
      </section>

      {/* 4. Use Cases - When you need us */}
      <UseCasesSection />

      {/* 5. Pain Points - Problems we solve */}
      <PainPointsSection />

      {/* 6. How It Works - Process */}
      <HowItWorksSection />

      {/* 7. Pricing */}
      <PricingSection />

      {/* 8. Testimonials */}
      <TestimonialsSection />

      {/* 9. FAQ */}
      <FAQSection />

      {/* 10. Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}

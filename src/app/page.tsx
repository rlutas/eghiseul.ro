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
import { HOMEPAGE_FAQS } from '@/components/home/faq-data';
import { ArticlesSection } from '@/components/home/articles-section';
import { FinalCTASection } from '@/components/home/final-cta-section';
import { Footer } from '@/components/home/footer';
import { buildHomepageGraph } from '@/lib/seo/homepage-schema';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Site-wide JSON-LD: Organization + WebSite + WebPage + ItemList + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHomepageGraph(HOMEPAGE_FAQS)) }}
      />

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

      {/* 10. Ghiduri & articole recente (parity cu site-ul WP + internal linking) */}
      <ArticlesSection />

      {/* 11. Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}

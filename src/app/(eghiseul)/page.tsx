import { HeroSection } from '@/components/home/hero-section';
import { FeaturedServices } from '@/components/home/featured-services';
import { WhyUsSection } from '@/components/home/why-us-section';
import { UseCasesSection } from '@/components/home/use-cases-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { FAQSection } from '@/components/home/faq-section';
import { buildHomepageFaqItems, toFaqSchemaPairs } from '@/components/home/faq-data';
import { ServiceLinksSection } from '@/components/home/service-links-section';
import { ArticlesSection } from '@/components/home/articles-section';
import { FinalCTASection } from '@/components/home/final-cta-section';
import { Footer } from '@/components/home/footer';
import { buildHomepageGraph } from '@/lib/seo/homepage-schema';
import { getPublicServiceFacts } from '@/lib/services/public-facts';

// Prețul și termenul vin din tabela `services` (aceeași sursă ca paginile de
// serviciu); o schimbare din admin ajunge aici în cel mult o oră. Pagina rămâne
// statică (ISR) — nu citi `headers()`/cookies aici.
export const revalidate = 3600;

const HOMEPAGE_SERVICE_SLUGS = [
  'cazier-judiciar',
  'cazier-judiciar-persoana-juridica',
  'cazier-fiscal',
  'cazier-auto',
  'certificat-integritate',
  'extras-carte-funciara',
  'certificat-constatator',
  'certificat-nastere',
  'certificat-casatorie',
  'certificat-celibat',
  'extras-multilingv-certificat-nastere',
  'extras-multilingv-certificat-casatorie',
];

export default async function HomePage() {
  const facts = await getPublicServiceFacts(HOMEPAGE_SERVICE_SLUGS);
  const faqItems = buildHomepageFaqItems(facts);
  return (
    <main id="main-content" className="min-h-screen">
      {/* Site-wide JSON-LD: Organization + WebSite + WebPage + ItemList + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHomepageGraph(toFaqSchemaPairs(faqItems))) }}
      />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 1b. Linkuri cu ancoră exactă spre fiecare pagină de serviciu (hub de brand) */}
      <ServiceLinksSection facts={facts} />

      {/* 2. Cum funcționează în 3 pași (sub hero) — include bara de trust */}
      <HowItWorksSection />

      {/* 3. Featured Services */}
      <section id="servicii">
        <FeaturedServices facts={facts} />
      </section>

      {/* 4. De ce eGhișeul — trust & diferențiere */}
      <WhyUsSection />

      {/* 5. Recenzii Google — social proof */}
      <TestimonialsSection />

      {/* 6. Use Cases - When you need us */}
      <UseCasesSection />

      {/* 7. Final CTA — deasupra FAQ */}
      <FinalCTASection />

      {/* 8. FAQ */}
      <FAQSection items={faqItems} />

      {/* 9. Ghiduri & articole recente (parity cu site-ul WP + internal linking) */}
      <ArticlesSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}

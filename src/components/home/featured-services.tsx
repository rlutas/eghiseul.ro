import { createPublicClient } from '@/lib/supabase/public';
import { ServiceCard } from '@/components/services/service-card';
import { ServiceCardSkeleton } from '@/components/services/service-card-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Service } from '@/types/services';

async function getFeaturedServices(): Promise<Service[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(6);

  if (error) {
    console.error('Error fetching featured services:', error);
    return [];
  }

  return (data as Service[]) || [];
}

export async function FeaturedServices() {
  const services = await getFeaturedServices();

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-[1100px]">
        {/* Section Heading */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4">
            Servicii populare
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-secondary-900 mb-3 sm:mb-4">
            Documente oficiale, livrate rapid
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-neutral-600 max-w-2xl mx-auto px-2">
            Cele mai solicitate servicii de la clienții noștri. Toate documentele sunt oficiale și recunoscute de autorități.
          </p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {services.length > 0 ? (
            services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            // Show skeletons if no services
            <>
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
            </>
          )}
        </div>

        {/* View All Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <Button
            asChild
            className="bg-secondary-900 hover:bg-secondary-800 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl transition-all duration-200 hover:shadow-lg"
          >
            <Link href="/services">
              Vezi Toate Serviciile (12)
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Loading skeleton for suspense
export function FeaturedServicesSkeleton() {
  return (
    <section className="py-16 lg:py-24 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-[1100px]">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-block px-4 py-1.5 bg-primary-100 rounded-full mb-4">
            <div className="h-4 w-24 bg-primary-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-80 bg-neutral-200 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-neutral-200 rounded mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>
      </div>
    </section>
  );
}

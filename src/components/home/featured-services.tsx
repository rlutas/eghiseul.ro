import { createPublicClient } from '@/lib/supabase/public';
import { ServiceCard } from '@/components/services/service-card';
import { ServiceCardSkeleton } from '@/components/services/service-card-skeleton';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
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
    .limit(3);

  if (error) {
    console.error('Error fetching featured services:', error);
    return [];
  }

  return (data as Service[]) || [];
}

export async function FeaturedServices() {
  const services = await getFeaturedServices();

  return (
    <section id="servicii" className="py-16 lg:py-24 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Servicii Populare
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Cele mai solicitate documente oficiale, la un click distanta
          </p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
            <Link href="/services">
              Vezi Toate Serviciile (12)
              <ChevronRight className="ml-2 h-5 w-5" />
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
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Servicii Populare
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Cele mai solicitate documente oficiale, la un click distanta
          </p>
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

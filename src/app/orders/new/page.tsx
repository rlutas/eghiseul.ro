import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import { OrderWizardProvider } from '@/providers/order-wizard-provider';
import { OrderWizard } from '@/components/orders/order-wizard';
import { Service, ServiceOption } from '@/types/services';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Comandă Nouă - eGhișeul.ro',
  description: 'Plasează o comandă pentru documente oficiale românești',
};

// Fetch service by slug
async function getService(slug: string): Promise<{ service: Service; options: ServiceOption[] } | null> {
  const supabase = createPublicClient();

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !service) {
    return null;
  }

  const { data: options } = await supabase
    .from('service_options')
    .select('*')
    .eq('service_id', service.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return {
    service: service as Service,
    options: (options as ServiceOption[]) || [],
  };
}

// Loading component
function WizardLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-neutral-600">Se încarcă formularul...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OrderNewPageProps {
  searchParams: Promise<{ service?: string; step?: string }>;
}

export default async function OrderNewPage({ searchParams }: OrderNewPageProps) {
  const params = await searchParams;
  const serviceSlug = params.service;

  // Redirect if no service specified
  if (!serviceSlug) {
    redirect('/#servicii');
  }

  // Fetch service data
  const serviceData = await getService(serviceSlug);

  if (!serviceData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-50 pt-16">
      <Suspense fallback={<WizardLoading />}>
        <OrderWizardProvider>
          <OrderWizard
            initialService={serviceData.service}
            initialOptions={serviceData.options}
          />
        </OrderWizardProvider>
      </Suspense>
    </main>
  );
}

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import { ModularWizardProvider } from '@/providers/modular-wizard-provider';
import { ModularOrderWizard } from '@/components/orders/modular-order-wizard';
import { Service, ServiceOption } from '@/types/services';
import { Loader2 } from 'lucide-react';
import { getImobiliareServices } from '@/lib/services/imobiliare';
import { ServiceSwitcher } from '@/components/services/service-switcher';
import { OrderFlowDisclosure } from '@/components/legal/order-flow-disclosure';
import { createClient } from '@/lib/supabase/server';
import { buildUserPrefillData, type UserPrefillData } from '@/lib/account/prefill';

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

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const data = await getService(serviceSlug);

  if (!data) {
    return {
      title: 'Comandă - eGhișeul.ro',
    };
  }

  return {
    title: `Comandă ${data.service.name} - eGhișeul.ro`,
    description: `Completează comanda pentru ${data.service.name}. Proces simplu și rapid.`,
  };
}

// Loading component
function WizardLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-4">
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

interface OrderPageProps {
  params: Promise<{ service: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { service: serviceSlug } = await params;

  // Fetch service data
  const serviceData = await getService(serviceSlug);

  if (!serviceData) {
    notFound();
  }

  // For cadastral (imobiliare) services, offer a quick service switcher above
  // the wizard — like cfunciara's service-type dropdown on the order form.
  const isImobiliare = serviceData.service.category === 'imobiliare';
  const switcherServices = isImobiliare ? await getImobiliareServices() : [];

  const switcher =
    isImobiliare && switcherServices.length > 1 ? (
      <ServiceSwitcher
        services={switcherServices}
        currentSlug={serviceData.service.slug}
        mode="order"
        inline
        className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
      />
    ) : undefined;

  // The signed-in customer's account data, so the wizard's first paint
  // already carries it (feedback 18.09.2026, #3). Not in phone mode: the team
  // is signed in with ITS account and the order is the caller's.
  const phoneMode = (await searchParams)?.telefonic === '1';
  let initialPrefill: UserPrefillData | null = null;
  if (!phoneMode) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) initialPrefill = await buildUserPrefillData(supabase, user);
    } catch (prefillError) {
      console.warn('[comanda] prefill unavailable, the wizard will fetch it:', prefillError);
      initialPrefill = null;
    }
  }

  return (
    // Header renders its own fixed-header spacer — no pt needed here (a
    // duplicate pt-16 stacked ~64px of dead space above the form).
    <main className="min-h-screen bg-neutral-50">
      <Suspense fallback={<WizardLoading />}>
        <ModularWizardProvider initialPrefill={initialPrefill}>
          <ModularOrderWizard
            initialService={serviceData.service}
            initialOptions={serviceData.options}
            headerExtra={switcher}
          />
        </ModularWizardProvider>
      </Suspense>
      <OrderFlowDisclosure />
    </main>
  );
}

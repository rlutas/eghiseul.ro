import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Clock,
  Shield,
  Zap,
  FileText,
  CheckCircle,
  ChevronLeft,
  Building2,
  Car,
  User,
  Scale,
  Home as HomeIcon
} from 'lucide-react';
import { Service, ServiceOption } from '@/types/services';
import { Footer } from '@/components/home/footer';

// Generate static pages for MVP services
export async function generateStaticParams() {
  return [
    { slug: 'cazier-fiscal' },
    { slug: 'extras-carte-funciara' },
    { slug: 'certificat-constatator' },
  ];
}

// Enable ISR with 1-hour revalidation
export const revalidate = 3600;

// Allow dynamic routes for services not in generateStaticParams
export const dynamicParams = true;

// Fetch service data
async function getService(slug: string): Promise<{ service: Service; options: ServiceOption[] } | null> {
  const supabase = createPublicClient();

  // Get service
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (serviceError || !service) {
    return null;
  }

  // Get service options
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getService(slug);

  if (!data) {
    return {
      title: 'Serviciu Negasit',
    };
  }

  const { service } = data;
  const title = service.meta_title || `${service.name} - eGhiseul.ro`;
  const description = service.meta_description || service.short_description || service.description || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://eghiseul.ro/services/${service.slug}`,
      siteName: 'eGhiseul.ro',
      locale: 'ro_RO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://eghiseul.ro/services/${service.slug}`,
    },
  };
}

const categoryIcons: Record<string, React.ReactNode> = {
  fiscale: <FileText className="h-8 w-8" />,
  juridice: <Scale className="h-8 w-8" />,
  imobiliare: <HomeIcon className="h-8 w-8" />,
  comerciale: <Building2 className="h-8 w-8" />,
  auto: <Car className="h-8 w-8" />,
  personale: <User className="h-8 w-8" />,
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getService(slug);

  if (!data) {
    notFound();
  }

  const { service, options } = data;
  const icon = categoryIcons[service.category] || <FileText className="h-8 w-8" />;

  // Parse processing steps from config
  const processingSteps = (service.config as { processing_steps?: string[] })?.processing_steps || [
    'Completeaza formularul online',
    'Incarca documentele necesare',
    'Efectueaza plata',
    'Primesti documentul prin email',
  ];

  // Parse required documents from config
  const requiredDocuments = (service.config as { required_documents?: string[] })?.required_documents || [
    'Carte de identitate (CI)',
    'Selfie cu documentul',
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.name,
            description: service.description,
            provider: {
              '@type': 'Organization',
              name: 'eGhiseul.ro',
              url: 'https://eghiseul.ro',
            },
            offers: {
              '@type': 'Offer',
              price: service.base_price,
              priceCurrency: service.currency,
              availability: 'https://schema.org/InStock',
            },
            areaServed: {
              '@type': 'Country',
              name: 'Romania',
            },
          }),
        }}
      />

      <main className="min-h-screen bg-neutral-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-neutral-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-neutral-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Acasa
              </Link>
              <ChevronLeft className="h-4 w-4 rotate-180" />
              <Link href="/#servicii" className="hover:text-blue-600 transition-colors">
                Servicii
              </Link>
              <ChevronLeft className="h-4 w-4 rotate-180" />
              <span className="text-neutral-900 font-medium">{service.name}</span>
            </nav>
          </div>
        </div>

        {/* Service Header */}
        <section className="bg-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Icon and Title */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      {icon}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                        {service.name}
                      </h1>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {service.urgent_available && (
                          <Badge className="bg-amber-500 text-white">
                            <Zap className="h-3 w-3 mr-1" />
                            Urgent Disponibil
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-lg text-neutral-600 leading-relaxed">
                    {service.description || service.short_description}
                  </p>
                </div>

                {/* Price Card (Sticky on desktop) */}
                <div className="md:w-80">
                  <Card className="sticky top-4 border-2 border-blue-100">
                    <CardHeader className="bg-blue-50 border-b border-blue-100">
                      <CardTitle className="text-center">
                        <span className="text-sm text-neutral-600 block">Pret de la</span>
                        <span className="text-4xl font-bold text-blue-600">
                          {service.base_price} RON
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="h-5 w-5 text-neutral-400" />
                        <div>
                          <p className="font-medium text-neutral-900">Termen Standard</p>
                          <p className="text-neutral-600">
                            {service.estimated_days === 1 ? '24 ore' : `${service.estimated_days} zile lucratoare`}
                          </p>
                        </div>
                      </div>

                      {service.urgent_available && service.urgent_days && (
                        <div className="flex items-center gap-3 text-sm">
                          <Zap className="h-5 w-5 text-amber-500" />
                          <div>
                            <p className="font-medium text-neutral-900">Termen Urgent</p>
                            <p className="text-neutral-600">
                              {service.urgent_days === 1 ? '24 ore' : `${service.urgent_days} zile lucratoare`}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-neutral-900">100% Legal</p>
                          <p className="text-neutral-600">Document oficial cu valabilitate juridica</p>
                        </div>
                      </div>

                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6" size="lg">
                        <Link href={`/orders/new?service=${service.slug}`}>
                          Comanda Acum
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>

                      <p className="text-xs text-center text-neutral-500">
                        Plata securizata prin Stripe
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Options */}
        {options.length > 0 && (
          <section className="py-12 lg:py-16 bg-neutral-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-neutral-900 mb-8">
                  Optiuni Disponibile
                </h2>

                <div className="grid gap-4">
                  {options.map((option) => (
                    <Card key={option.id} className="bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-neutral-900">{option.name}</h3>
                            {option.description && (
                              <p className="text-sm text-neutral-600 mt-1">{option.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-blue-600">
                              +{option.price_modifier} RON
                            </span>
                            {option.is_required && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Obligatoriu
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* How It Works for this service */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">
                Cum Functioneaza?
              </h2>

              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-neutral-900">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Required Documents */}
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">
                Documente Necesare
              </h2>

              <div className="grid gap-3">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-neutral-900">{doc}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-2">Important</h3>
                <p className="text-sm text-blue-800">
                  Asigura-te ca documentele incarcate sunt clare si lizibile.
                  Fotografiile trebuie sa fie bine iluminate si fara reflexii.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16 bg-blue-600">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-white sm:text-3xl mb-4">
                Pregatit sa Comandezi?
              </h2>
              <p className="text-blue-100 mb-8">
                Obtine {service.name.toLowerCase()} in doar cateva minute, fara deplasari la ghiseu.
              </p>
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href={`/orders/new?service=${service.slug}`}>
                  Incepe Comanda
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

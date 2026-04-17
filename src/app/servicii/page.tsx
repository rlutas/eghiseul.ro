import { Metadata } from 'next';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/home/footer';
import {
  ArrowRight,
  Clock,
  Zap,
  FileText,
  Building2,
  Car,
  User,
  Scale,
  Home,
  CheckCircle,
  Shield,
} from 'lucide-react';
import type { Service, ServiceCategory } from '@/types/services';

export const metadata: Metadata = {
  title: 'Servicii | Documente oficiale online pentru România | eGhișeul',
  description:
    'Catalogul complet al serviciilor eGhișeul.ro: cazier judiciar, cazier fiscal, certificat constatator, extras carte funciară, rovinietă și altele. 12 servicii digitale, 100% online.',
  keywords: [
    'servicii online',
    'documente oficiale',
    'cazier judiciar',
    'cazier fiscal',
    'certificat constatator',
    'extras carte funciară',
    'rovinietă',
    'eghiseul',
  ],
  openGraph: {
    title: 'Servicii | Documente oficiale online | eGhișeul',
    description:
      '12 servicii digitale pentru documente oficiale din România. Comandă online, livrare rapidă.',
    type: 'website',
    url: 'https://eghiseul.ro/servicii',
    siteName: 'eGhiseul.ro',
    locale: 'ro_RO',
  },
  alternates: {
    canonical: 'https://eghiseul.ro/servicii',
  },
};

const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
  fiscale: <FileText className="h-6 w-6" />,
  juridice: <Scale className="h-6 w-6" />,
  imobiliare: <Home className="h-6 w-6" />,
  comerciale: <Building2 className="h-6 w-6" />,
  auto: <Car className="h-6 w-6" />,
  personale: <User className="h-6 w-6" />,
};

const categoryLabels: Record<ServiceCategory, string> = {
  fiscale: 'Fiscale',
  juridice: 'Juridice',
  imobiliare: 'Imobiliare',
  comerciale: 'Comerciale',
  auto: 'Auto',
  personale: 'Personale',
};

async function getActiveServices(): Promise<Service[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error.message, error.code);
    return [];
  }

  return (data as Service[]) || [];
}

export default async function ServiciiPage() {
  const services = await getActiveServices();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Servicii eGhișeul.ro',
            description: 'Catalogul serviciilor digitale pentru documente oficiale din România.',
            itemListElement: services.map((service, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Service',
                name: service.name,
                description: service.short_description || service.description || undefined,
                url: `https://eghiseul.ro/comanda/${service.slug}`,
                offers: {
                  '@type': 'Offer',
                  price: service.base_price,
                  priceCurrency: service.currency || 'RON',
                },
              },
            })),
          }),
        }}
      />

      <main className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-16 lg:pb-24">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 max-w-[1280px]">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="bg-primary-500 text-secondary-900 font-bold px-4 py-1.5 mb-6">
                <FileText className="h-4 w-4 mr-2" />
                Catalog servicii
              </Badge>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                Serviciile noastre
              </h1>

              <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8">
                12 servicii digitale pentru documente oficiale din România. Comandă online, semnezi electronic, primești documentul acasă.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">Livrare rapidă</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">Documente oficiale</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">100% online</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 lg:py-20 bg-neutral-50 -mt-8">
          <div className="container mx-auto px-4 max-w-[1100px]">
            {services.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-600 text-lg">
                  Momentan nu avem servicii active. Te rugăm să revii în curând.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {services.map((service) => {
                  const icon =
                    categoryIcons[service.category] ?? <FileText className="h-6 w-6" />;
                  const detailHref = `/servicii/${service.slug}`;
                  const orderHref = `/comanda/${service.slug}`;

                  return (
                    <Card
                      key={service.id}
                      className="relative overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-500 border-t border-r border-b border-neutral-200 hover:border-primary-300 hover:-translate-y-1 flex flex-col h-full rounded-2xl"
                    >
                      {service.urgent_available && (
                        <Badge className="absolute top-4 right-4 bg-primary-500 text-secondary-900 font-bold px-3 py-1 rounded-full">
                          <Zap className="h-3 w-3 mr-1 inline" />
                          Urgent
                        </Badge>
                      )}

                      <CardHeader className="space-y-4 p-6">
                        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                          {icon}
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
                            {categoryLabels[service.category] ?? 'Serviciu'}
                          </span>
                          <CardTitle className="text-xl font-bold text-secondary-900">
                            {service.name}
                          </CardTitle>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 flex-1 px-6 pb-0">
                        <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3">
                          {service.short_description ||
                            service.description ||
                            'Document oficial disponibil pentru comandă online.'}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                          <div className="space-y-1">
                            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                              Preț
                            </p>
                            <p className="text-lg font-bold text-secondary-900">
                              <span className="text-primary-600">{service.base_price}</span>{' '}
                              {service.currency || 'RON'}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                              Termen
                            </p>
                            <p className="text-sm font-semibold text-secondary-900 flex items-center gap-1">
                              <Clock className="h-4 w-4 text-primary-500" />
                              {service.estimated_days === 1
                                ? '24 ore'
                                : `${service.estimated_days} zile`}
                            </p>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-6 pt-4 flex flex-col gap-2">
                        <Button
                          asChild
                          className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl h-12 shadow-[0_4px_12px_rgba(236,185,95,0.25)] hover:shadow-[0_6px_16px_rgba(236,185,95,0.35)] hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <Link href={orderHref}>
                            Comandă acum
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full text-secondary-900 hover:text-primary-700 font-semibold"
                        >
                          <Link href={detailHref}>Vezi detalii</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

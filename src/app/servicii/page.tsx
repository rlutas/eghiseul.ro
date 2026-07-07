import { Metadata } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/home/footer';
import { Clock, FileText, CheckCircle, Shield } from 'lucide-react';
import type { Service } from '@/types/services';
import { serviceUrl } from '@/lib/seo/constants';
import { ServicesFilter } from '@/components/servicii/services-filter';

// Cazier Judiciar PF/PJ are surfaced via the hub page, not as separate cards.
const HIDDEN_FROM_INDEX = new Set([
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
]);

export const metadata: Metadata = {
  title: 'Servicii | Documente online pentru România',
  description:
    'Catalogul complet al serviciilor eGhișeul.ro: cazier judiciar, cazier fiscal, certificat constatator, extras carte funciară, acte cadastrale, rovinietă și altele. 100% online.',
  keywords: [
    'servicii online',
    'documente',
    'cazier judiciar',
    'cazier fiscal',
    'certificat constatator',
    'extras carte funciară',
    'rovinietă',
    'eghiseul',
  ],
  openGraph: {
    title: 'Servicii | Documente online',
    description:
      'Servicii digitale pentru documente din România: caziere, stare civilă, acte cadastrale, firme. Comandă online, livrare rapidă.',
    type: 'website',
    url: 'https://eghiseul.ro/servicii',
    siteName: 'eGhiseul.ro',
    locale: 'ro_RO',
  },
  alternates: {
    canonical: 'https://eghiseul.ro/servicii',
  },
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
  const services = (await getActiveServices()).filter(
    (s) => !HIDDEN_FROM_INDEX.has(s.slug)
  );

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
            description: 'Catalogul serviciilor digitale pentru documente din România.',
            itemListElement: services.map((service, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Service',
                name: service.name,
                description: service.short_description || service.description || undefined,
                url: `https://eghiseul.ro${serviceUrl(service.slug)}`,
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
                {services.length} de servicii digitale pentru documente din România — caziere, stare civilă, acte cadastrale și firme. Comandă online, semnezi electronic, primești documentul acasă.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">Livrare rapidă</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">Documente</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">100% online</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Searchable + filterable catalog (client). Default view keeps the
            SEO-friendly grouping by issuing institution. */}
        <section className="py-12 lg:py-16 bg-neutral-50 -mt-8">
          <div className="container mx-auto px-4 max-w-[1280px]">
            {services.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-600 text-lg">
                  Momentan nu avem servicii active. Te rugăm să revii în curând.
                </p>
              </div>
            ) : (
              <ServicesFilter services={services} />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

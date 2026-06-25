import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createPublicClient } from '@/lib/supabase/public';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
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
import { serviceUrl } from '@/lib/seo/constants';

// Cazier Judiciar PF/PJ are surfaced via the hub page, not as separate cards.
const HIDDEN_FROM_INDEX = new Set([
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
]);

// Specimen document images per service (same assets as the homepage cards).
const SERVICE_SPECIMENS: Record<string, string> = {
  'cazier-judiciar': '/images/specimens/cazier-judiciar.png',
  'cazier-fiscal': '/images/specimens/cazier-fiscal.png',
  'cazier-auto': '/images/specimens/cazier-auto.png',
  'certificat-integritate': '/images/specimens/certificat-integritate.png',
  'certificat-nastere': '/images/specimens/certificat-nastere.webp',
  'certificat-casatorie': '/images/specimens/certificat-casatorie.webp',
  'certificat-celibat': '/images/specimens/certificat-celibat.webp',
  'certificat-constatator': '/images/specimens/certificat-constatator.png',
  'rovinieta': '/images/specimens/rovinieta.webp',
  'extras-carte-funciara': '/images/specimens/extras-cf.png',
};

/**
 * Specimen image for a service card. Cadastral (imobiliare) services without a
 * dedicated specimen reuse the Extras CF sample — they are all OCPI/CF documents
 * that look alike, so it reads as a representative cadastral document.
 */
function serviceSpecimen(service: Service): string | null {
  return (
    SERVICE_SPECIMENS[service.slug] ||
    (service.category === 'imobiliare' ? '/images/specimens/extras-cf.png' : null)
  );
}

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

const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
  fiscale: <FileText className="h-6 w-6" />,
  juridice: <Scale className="h-6 w-6" />,
  imobiliare: <Home className="h-6 w-6" />,
  comerciale: <Building2 className="h-6 w-6" />,
  auto: <Car className="h-6 w-6" />,
  personale: <User className="h-6 w-6" />,
};

// Services grouped by the issuing state institution (display order top→bottom).
const INSTITUTION_GROUPS: { key: ServiceCategory; title: string; authority: string }[] = [
  { key: 'imobiliare', title: 'Carte Funciară & Cadastru', authority: 'ANCPI / OCPI' },
  { key: 'juridice', title: 'Caziere & Integritate', authority: 'IGPR / Ministerul Justiției' },
  { key: 'comerciale', title: 'Firme', authority: 'ONRC' },
  { key: 'fiscale', title: 'Fiscal', authority: 'ANAF' },
  { key: 'personale', title: 'Stare Civilă', authority: 'Primării / D.E.P.A.B.D.' },
  { key: 'auto', title: 'Auto', authority: 'Poliția Rutieră / CNAIR' },
];

function ServiceCardItem({ service }: { service: Service }) {
  const icon = categoryIcons[service.category] ?? <FileText className="h-6 w-6" />;
  const detailHref = serviceUrl(service.slug);
  // Cazier Judiciar parent: order goes to the hub so the user picks PF vs PJ.
  const orderHref = service.slug === 'cazier-judiciar' ? serviceUrl(service.slug) : `/comanda/${service.slug}`;
  const specimen = serviceSpecimen(service);

  return (
    <Card className="group relative overflow-hidden bg-white p-0 hover:shadow-[0_12px_30px_rgba(6,16,31,0.12)] transition-all duration-300 border border-neutral-200 hover:border-primary-400 hover:-translate-y-1.5 flex flex-col h-full rounded-2xl">
      {/* Specimen image header — larger than the homepage cards */}
      <div className="relative w-full bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100" style={{ paddingTop: '92%' }}>
        {service.urgent_available && (
          <span className="absolute top-3 right-3 z-10 inline-flex items-center rounded-md bg-primary-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary-900 shadow-sm">
            <Zap className="h-3 w-3 mr-1" />
            Urgent
          </span>
        )}
        {specimen ? (
          <Image
            src={specimen}
            alt={`Specimen ${service.name}`}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 300px"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">{icon}</span>
          </span>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <CardTitle className="text-[15px] font-bold text-secondary-900 leading-snug mb-1.5">{service.name}</CardTitle>
        <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {service.short_description || service.description || 'Document disponibil pentru comandă online.'}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3 border-t border-neutral-100">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide font-medium">Preț</p>
            <p className="text-base font-extrabold text-secondary-900">
              <span className="text-primary-600">{service.base_price}</span>{' '}
              <span className="text-xs font-bold text-neutral-500">{service.currency || 'RON'}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide font-medium">Termen</p>
            <p className="text-xs font-semibold text-secondary-900 flex items-center justify-end gap-1">
              <Clock className="h-3.5 w-3.5 text-primary-500" />
              {service.estimated_days === 1 ? '24 ore' : `${service.estimated_days} zile`}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-1.5">
        <Button asChild className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl h-10 shadow-[0_4px_12px_rgba(236,185,95,0.25)] hover:shadow-[0_6px_16px_rgba(236,185,95,0.35)] hover:-translate-y-0.5 transition-all duration-200">
          <Link href={orderHref}>Comandă acum<ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="ghost" className="w-full text-secondary-900 hover:text-primary-700 font-semibold h-8 text-sm">
          <Link href={detailHref}>Vezi detalii</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

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

        {/* Services grouped by issuing institution — 4 per row */}
        <section className="py-12 lg:py-16 bg-neutral-50 -mt-8">
          <div className="container mx-auto px-4 max-w-[1280px]">
            {services.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-600 text-lg">
                  Momentan nu avem servicii active. Te rugăm să revii în curând.
                </p>
              </div>
            ) : (
              INSTITUTION_GROUPS.map((group) => {
                const items = services.filter((s) => s.category === group.key);
                if (items.length === 0) return null;
                return (
                  <div key={group.key} className="mb-12 last:mb-0 scroll-mt-24" id={group.key}>
                    <div className="mb-6 flex items-baseline gap-3 border-b border-neutral-200 pb-3">
                      <h2 className="text-xl sm:text-2xl font-bold text-secondary-900">{group.title}</h2>
                      <span className="text-sm font-semibold text-primary-600">{group.authority}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {items.map((service) => (
                        <ServiceCardItem key={service.id} service={service} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

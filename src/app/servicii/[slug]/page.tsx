import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Footer } from '@/components/home/footer';
import {
  ArrowRight,
  Clock,
  Shield,
  CheckCircle,
  ChevronRight,
  FileText,
  FileSignature,
  CreditCard,
  Mail,
  Zap,
  Star,
  Users,
  Award,
} from 'lucide-react';
import type { Service, ServiceOption, ServiceCategory } from '@/types/services';

// Revalidate once per hour — services rarely change
export const revalidate = 3600;

// Enhancement extras to surface in the "Extras" section
const ENHANCEMENT_EXTRAS = new Set<string>([
  'traducere',
  'apostila_haga',
  'apostila_notari',
  'legalizare',
  'verificare_expert',
]);

const categoryLabels: Record<ServiceCategory, string> = {
  fiscale: 'Fiscale',
  juridice: 'Juridice',
  imobiliare: 'Imobiliare',
  comerciale: 'Comerciale',
  auto: 'Auto',
  personale: 'Personale',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Service;
}

async function getServiceOptions(serviceId: string): Promise<ServiceOption[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('service_options')
    .select('*')
    .eq('service_id', serviceId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as ServiceOption[];
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from('services')
    .select('slug')
    .eq('is_active', true);

  return (data || []).map((s: { slug: string }) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: 'Serviciu indisponibil | eGhișeul',
      description: 'Serviciul solicitat nu este disponibil.',
    };
  }

  const title =
    service.meta_title ||
    `${service.name} Online | Livrare rapidă | eGhișeul.ro`;
  const description =
    service.meta_description ||
    service.short_description ||
    service.description ||
    `Obține ${service.name} online, 100% digital. Livrare în ${service.estimated_days} zile lucrătoare. Tarif de la ${service.base_price} RON.`;

  const url = `https://eghiseul.ro/servicii/${service.slug}`;

  return {
    title,
    description,
    keywords: [
      service.name.toLowerCase(),
      `${service.name.toLowerCase()} online`,
      'documente oficiale',
      'eghiseul',
      categoryLabels[service.category]?.toLowerCase() ?? 'servicii',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'eGhiseul.ro',
      locale: 'ro_RO',
    },
  };
}

function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(2).replace(/\.00$/, '');
}

function getEstimatedLabel(days: number): string {
  if (days === 0) return 'Instant';
  if (days === 1) return '24 ore';
  return `${days} zile lucrătoare`;
}

// Generic FAQ shared across services. Content kept inline since it's generic
// and only rendered server-side as static HTML.
function buildFaqs(service: Service): { q: string; a: string }[] {
  const name = service.name;
  const urgentDays = service.urgent_days ?? 1;
  const standardLabel = getEstimatedLabel(service.estimated_days);
  const urgentLabel = getEstimatedLabel(urgentDays);

  return [
    {
      q: `Ce este ${name} și la ce îmi folosește?`,
      a: `${name} este un document oficial eliberat de autoritățile competente din România. ${
        service.short_description || service.description || ''
      } Îl poți solicita pentru proceduri administrative, angajare, licitații publice, parteneriate comerciale sau pentru a atesta o situație legală.`,
    },
    {
      q: `Cât durează obținerea ${name}?`,
      a: `Pentru varianta standard, documentul se eliberează în ${standardLabel}. ${
        service.urgent_available
          ? `Dacă alegi procesarea urgentă, termenul se reduce la ${urgentLabel}.`
          : ''
      } Vei primi notificări pe email pe măsură ce comanda trece prin fiecare etapă.`,
    },
    {
      q: 'Cum primesc documentul final?',
      a: 'Documentul este livrat în format digital (PDF) pe email sau prin curier (Fan Courier / Sameday) la adresa specificată. Poți alege metoda preferată în timpul comenzii. Pentru documente oficiale cu ștampilă, livrarea fizică prin curier este recomandată.',
    },
    {
      q: 'Ce documente trebuie să încarc pentru a comanda?',
      a: 'Pentru persoane fizice: copie act de identitate (CI sau pașaport) față-verso și un selfie cu documentul în mână pentru verificare KYC. Pentru persoane juridice: CUI firmă (completarea datelor este automată prin integrarea cu ANAF) și actul reprezentantului legal. Toate fișierele sunt stocate securizat pe AWS S3.',
    },
    {
      q: 'Este sigur să comand online? Plata este protejată?',
      a: 'Da. Procesăm plata prin Stripe (card bancar, Apple Pay, Google Pay) cu criptare de nivel bancar. Datele personale sunt protejate conform GDPR și stocate pe servere AWS în Uniunea Europeană. Semnătura electronică este conformă cu Regulamentul eIDAS (UE) 910/2014.',
    },
    {
      q: 'Pot anula sau modifica comanda după plată?',
      a: 'Poți contacta echipa noastră la contact@eghiseul.ro sau +40 312 299 399 pentru modificări. Conform OUG 34/2014 art. 16 lit. m), dreptul de retragere nu se aplică după începerea procesării efective a documentului oficial, dar vom face tot posibilul să te ajutăm în orice situație.',
    },
  ];
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const options = await getServiceOptions(service.id);
  const enhancementExtras = options.filter((o) => ENHANCEMENT_EXTRAS.has(o.code));
  const urgentOption = options.find((o) => o.code === 'urgenta');

  const basePrice = parseFloat(String(service.base_price));
  const urgentPrice = urgentOption
    ? basePrice + parseFloat(String(urgentOption.price))
    : basePrice;

  const orderHref = `/comanda/${service.slug}`;
  const faqs = buildFaqs(service);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description:
      service.description ||
      service.short_description ||
      `${service.name} online, livrare rapidă.`,
    provider: {
      '@type': 'Organization',
      name: 'eGhișeul.ro',
      url: 'https://eghiseul.ro',
    },
    areaServed: { '@type': 'Country', name: 'Romania' },
    offers: {
      '@type': 'Offer',
      price: basePrice.toString(),
      priceCurrency: service.currency || 'RON',
      availability: 'https://schema.org/InStock',
      url: `https://eghiseul.ro/servicii/${service.slug}`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Acasă',
        item: 'https://eghiseul.ro',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Servicii',
        item: 'https://eghiseul.ro/servicii',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.name,
        item: `https://eghiseul.ro/servicii/${service.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero */}
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
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
              <Link href="/" className="hover:text-primary-500 transition-colors">
                Acasă
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/servicii" className="hover:text-primary-500 transition-colors">
                Servicii
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">{service.name}</span>
            </nav>

            <div className="text-center max-w-3xl mx-auto">
              <Badge className="bg-primary-500 text-secondary-900 font-bold px-4 py-1.5 mb-6">
                <FileText className="h-4 w-4 mr-2" />
                {categoryLabels[service.category] ?? 'Serviciu'}
              </Badge>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                {service.name} Online
              </h1>

              <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8">
                {service.short_description ||
                  service.description ||
                  `Obține ${service.name} rapid, 100% digital. Fără drumuri, fără cozi.`}
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">
                    Livrare {getEstimatedLabel(service.estimated_days)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">Document oficial</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">100% online</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl h-14 px-8 shadow-[0_4px_12px_rgba(236,185,95,0.25)] hover:shadow-[0_6px_16px_rgba(236,185,95,0.35)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Link href={orderHref}>
                    Comandă acum
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <div className="inline-flex items-baseline gap-2 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                  <span className="text-sm text-white/70">de la</span>
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(service.base_price)} {service.currency || 'RON'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust signals bar */}
        <section className="bg-white border-b border-neutral-200">
          <div className="container mx-auto px-4 max-w-[1100px] py-8 lg:py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-7 w-7 text-primary-600" />
                <p className="text-2xl lg:text-3xl font-extrabold text-secondary-900">
                  10.000+
                </p>
                <p className="text-sm text-neutral-600">clienți mulțumiți</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-7 w-7 text-primary-600" />
                <p className="text-2xl lg:text-3xl font-extrabold text-secondary-900">
                  25.000+
                </p>
                <p className="text-sm text-neutral-600">documente emise</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Star className="h-7 w-7 text-primary-600" />
                <p className="text-2xl lg:text-3xl font-extrabold text-secondary-900">
                  4.9/5
                </p>
                <p className="text-sm text-neutral-600">rating clienți</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-7 w-7 text-primary-600" />
                <p className="text-2xl lg:text-3xl font-extrabold text-secondary-900">
                  {getEstimatedLabel(service.estimated_days)}
                </p>
                <p className="text-sm text-neutral-600">termen mediu livrare</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ce este */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce este {service.name}?
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-neutral-200 space-y-4">
              {service.description ? (
                <p className="text-neutral-700 leading-relaxed">
                  {service.description}
                </p>
              ) : (
                <p className="text-neutral-700 leading-relaxed">
                  {service.name} este un document oficial necesar în multe proceduri
                  administrative și legale. Îl obții integral online, fără deplasări la
                  ghișee, cu plată securizată și livrare pe email sau prin curier.
                </p>
              )}

              {service.short_description && service.description && (
                <p className="text-neutral-700 leading-relaxed">
                  {service.short_description}
                </p>
              )}

              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">
                    Document oficial cu valoare legală
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">
                    Semnătură electronică eIDAS
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">
                    Livrare pe email sau curier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Extras available */}
        {enhancementExtras.length > 0 && (
          <section className="py-12 lg:py-20 bg-white">
            <div className="container mx-auto px-4 max-w-[1000px]">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                  Servicii adiționale disponibile
                </h2>
                <p className="text-neutral-600 max-w-xl mx-auto">
                  Adaugă opțional la comandă traducere, apostilă, legalizare sau
                  verificare de expert.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enhancementExtras.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-start justify-between gap-3 p-5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-secondary-900 mb-1">
                        {opt.name}
                      </p>
                      {opt.description && (
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {opt.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold text-primary-600">
                        +{formatPrice(opt.price)}
                      </span>
                      <p className="text-xs text-neutral-500">RON</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pricing */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Alege pachetul potrivit
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                Prețuri fixe, TVA inclus, fără costuri ascunse.
              </p>
            </div>

            <div
              className={`grid gap-6 ${
                service.urgent_available ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-md mx-auto'
              }`}
            >
              {/* Standard plan */}
              <Card className="relative border-2 border-neutral-200 hover:border-primary-500 transition-all hover:shadow-lg flex flex-col">
                <CardContent className="p-6 lg:p-8 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Standard
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-extrabold text-secondary-900">
                      {formatPrice(service.base_price)}
                    </span>
                    <span className="ml-1 text-sm text-neutral-500">
                      {service.currency || 'RON'}
                    </span>
                    <p className="text-xs text-neutral-500 mt-1">TVA inclus</p>
                  </div>
                  <p className="text-sm font-medium text-primary-600 mb-5">
                    Livrare {getEstimatedLabel(service.estimated_days)}
                  </p>
                  <ul className="space-y-2 flex-1 mb-6">
                    <li className="flex items-start gap-2 text-sm text-neutral-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      Document oficial complet
                    </li>
                    <li className="flex items-start gap-2 text-sm text-neutral-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      PDF pe email + tracking comandă
                    </li>
                    <li className="flex items-start gap-2 text-sm text-neutral-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      Plată securizată prin Stripe
                    </li>
                    <li className="flex items-start gap-2 text-sm text-neutral-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      Asistență inclusă
                    </li>
                  </ul>
                  <Button
                    asChild
                    className="w-full bg-white border-2 border-secondary-900 text-secondary-900 hover:bg-secondary-900 hover:text-white font-bold rounded-xl h-12"
                    variant="outline"
                  >
                    <Link href={orderHref}>Comandă standard</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Urgent plan */}
              {service.urgent_available && urgentOption && (
                <Card className="relative border-2 border-primary-500 shadow-xl flex flex-col">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-primary-500 text-secondary-900 px-3 py-1 text-xs font-bold shadow-sm">
                      <Zap className="mr-1 h-3 w-3" />
                      Cel mai rapid
                    </span>
                  </div>
                  <CardContent className="p-6 lg:p-8 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      Urgent
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-extrabold text-secondary-900">
                        {formatPrice(urgentPrice)}
                      </span>
                      <span className="ml-1 text-sm text-neutral-500">
                        {service.currency || 'RON'}
                      </span>
                      <p className="text-xs text-neutral-500 mt-1">TVA inclus</p>
                    </div>
                    <p className="text-sm font-medium text-primary-600 mb-5">
                      Livrare{' '}
                      {getEstimatedLabel(service.urgent_days ?? 1)}
                    </p>
                    <ul className="space-y-2 flex-1 mb-6">
                      <li className="flex items-start gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        Toate avantajele pachetului Standard
                      </li>
                      <li className="flex items-start gap-2 text-sm text-neutral-700">
                        <Zap className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                        Procesare prioritară
                      </li>
                      <li className="flex items-start gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        Suport dedicat
                      </li>
                      <li className="flex items-start gap-2 text-sm text-neutral-700">
                        <Award className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                        Garanție termen respectat
                      </li>
                    </ul>
                    <Button
                      asChild
                      className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl h-12 shadow-[0_4px_12px_rgba(236,185,95,0.25)]"
                    >
                      <Link href={orderHref}>Comandă urgent</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Cum funcționează */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
                Simplu și rapid
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-secondary-900">
                Cum funcționează
              </h2>
              <p className="mt-3 text-neutral-600 max-w-xl mx-auto">
                {service.name} în 4 pași simpli, fără deplasări la ghișee.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: FileText,
                  title: 'Completezi formularul',
                  desc: 'Introduci datele în formularul online securizat.',
                },
                {
                  icon: FileSignature,
                  title: 'Încarci documentele',
                  desc: 'Adaugi actul de identitate și verificarea KYC.',
                },
                {
                  icon: CreditCard,
                  title: 'Plătești online',
                  desc: 'Card bancar, Apple Pay sau Google Pay prin Stripe.',
                },
                {
                  icon: Mail,
                  title: 'Primești documentul',
                  desc: 'PDF pe email sau livrare prin curier la adresa ta.',
                },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="relative flex flex-col items-center text-center p-6 bg-neutral-50 rounded-2xl border border-neutral-200"
                  >
                    <div className="relative mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                        <Icon className="h-7 w-7 text-primary-600" />
                      </div>
                      <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-secondary-900">
                        {idx + 1}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-secondary-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[800px]">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Întrebări frecvente
              </h2>
              <p className="text-neutral-600">
                Răspunsuri la cele mai comune întrebări despre {service.name}.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 lg:p-6 border border-neutral-200">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-base font-semibold text-secondary-900 hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-700 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
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

          <div className="relative container mx-auto px-4 max-w-[900px] text-center">
            <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
              Comandă {service.name} acum
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Primești documentul oficial rapid, fără drumuri la ghișee. Plată
              securizată, asistență dedicată.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl h-14 px-10 shadow-[0_4px_12px_rgba(236,185,95,0.25)] hover:shadow-[0_6px_16px_rgba(236,185,95,0.35)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Link href={orderHref}>
                Comandă acum
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <p className="mt-6 text-sm text-white/60">
              Procesare rapidă · Plată securizată · Suport dedicat
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

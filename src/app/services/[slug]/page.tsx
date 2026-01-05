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
  ChevronRight,
  Building2,
  Car,
  User,
  Scale,
  Home as HomeIcon,
  Star,
  Phone,
  Mail,
} from 'lucide-react';
import { Service, ServiceOption } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';

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
    'Completează formularul online cu datele tale',
    'Încarcă documentele necesare (CI)',
    'Efectuează plata securizată',
    'Primești documentul prin email în termenul specificat',
  ];

  // Parse required documents from config
  const requiredDocuments = (service.config as { required_documents?: string[] })?.required_documents || [
    'Carte de identitate (față și verso)',
    'Selfie cu documentul de identitate',
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

      <main className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-16 lg:pb-24">
          {/* Background pattern */}
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
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
              <Link href="/" className="hover:text-primary-500 transition-colors">
                Acasă
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/#servicii" className="hover:text-primary-500 transition-colors">
                Servicii
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">{service.name}</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">
              {/* Left Content */}
              <div className="flex-1 max-w-[700px]">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.urgent_available && (
                    <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                  </Badge>
                </div>

                {/* H1 */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  {service.slug === 'cazier-fiscal'
                    ? 'Cazier Fiscal Online - Obține Rapid și Ușor'
                    : service.slug === 'extras-carte-funciara'
                    ? 'Extras Carte Funciară Online - Obținere Rapidă'
                    : service.slug === 'certificat-constatator'
                    ? 'Certificat Constatator ONRC Online'
                    : service.name}
                </h1>

                {/* Description */}
                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description || service.short_description}
                </p>

                {/* SEO Content Box - Service Specific */}
                {service.slug === 'cazier-fiscal' && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                    <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                      <strong className="text-primary-500">Cazierul Fiscal</strong> este un document oficial emis
                      de ANAF care atestă că nu ai datorii la bugetul de stat. La eGhiseul.ro obții documentul simplu:
                    </p>
                    <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Completezi formularul online (5 minute)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Încarci act identitate + selfie KYC
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Plătești securizat prin Stripe
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Primești documentul email + curier în 5 zile
                      </li>
                    </ul>
                    <p className="mt-3 text-white/70 text-xs">
                      Valabil <strong className="text-white">30 de zile</strong> de la emitere. Acceptat de orice instituție din România.
                    </p>
                  </div>
                )}

                {/* SEO Content Box - Extras Carte Funciara */}
                {service.slug === 'extras-carte-funciara' && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                    <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                      <strong className="text-primary-500">Extrasul de Carte Funciară</strong> este documentul oficial de la ANCPI/OCPI
                      care conține toate informațiile despre un imobil: proprietar, suprafață, sarcini și ipoteci.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Introduci numărul cadastral/CF
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Selectezi județul și localitatea
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Plătești securizat prin Stripe
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Primești extrasul CF pe email
                      </li>
                    </ul>
                    <p className="mt-3 text-white/70 text-xs">
                      Disponibil și <strong className="text-white">urgență în 30 minute</strong>. Peste 34,000 comenzi procesate.
                    </p>
                  </div>
                )}

                {/* SEO Content Box - Certificat Constatator */}
                {service.slug === 'certificat-constatator' && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                    <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                      <strong className="text-primary-500">Certificatul Constatator</strong> este documentul oficial de la ONRC
                      care confirmă datele actuale ale unei firme: denumire, sediu, asociați, administratori, capital social.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Introduci CUI-ul firmei
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Selectezi tipul de certificat
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Plătești securizat prin Stripe
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        Primești certificatul pe email
                      </li>
                    </ul>
                    <p className="mt-3 text-white/70 text-xs">
                      Pentru SRL, SA, PFA, II, IF. <strong className="text-white">Urgență în 30 minute</strong> disponibilă.
                    </p>
                  </div>
                )}

                {/* Google Reviews Badge */}
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Google Logo */}
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm font-semibold text-secondary-900">Google Reviews</span>
                  </div>
                  <div className="w-px h-5 sm:h-6 bg-neutral-200" />
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FBBC04] fill-[#FBBC04]"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-secondary-900">4.9</span>
                  <span className="text-[10px] sm:text-xs text-neutral-500">• 391 recenzii</span>
                </div>
              </div>

              {/* Price Card - Sticky on mobile, centered on desktop */}
              <div className="lg:w-[360px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                  {/* Header with price */}
                  <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F] p-6 text-center">
                    {/* Decorative */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                      <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-3">
                        PREȚ COMPLET
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl lg:text-6xl font-black text-white">
                          {service.base_price}
                        </span>
                        <span className="text-xl font-bold text-white/70">RON</span>
                      </div>
                      <p className="text-white/60 text-sm mt-2">Fără taxe ascunse</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-5 space-y-3">
                    {/* Delivery time */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare în {service.estimated_days} zile</p>
                        <p className="text-xs text-neutral-500">Zile lucrătoare</p>
                      </div>
                    </div>

                    {/* Urgent option */}
                    {service.urgent_available && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-secondary-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-secondary-900 text-sm">Urgent: 1-2 zile</p>
                            <span className="text-xs font-bold text-white bg-primary-600 px-2 py-1 rounded-lg">+99 RON</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email delivery */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Livrare pe Email</p>
                        <p className="text-xs text-neutral-500">PDF + opțional curier</p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      asChild
                      className="w-full h-14 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold text-lg rounded-xl shadow-[0_4px_14px_rgba(236,185,95,0.4)] hover:shadow-[0_6px_20px_rgba(236,185,95,0.5)] hover:-translate-y-0.5 transition-all mt-4"
                      size="lg"
                    >
                      <Link href={`/comanda/${service.slug}`}>
                        Comandă Acum
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1 text-neutral-500">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs">Securizat</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Garanție</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Options */}
        {options.length > 0 && (
          <section className="py-12 lg:py-20 bg-white">
            <div className="container mx-auto px-4 max-w-[1400px]">
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                  Personalizare
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                  Opțiuni Disponibile
                </h2>
                <p className="text-neutral-600 max-w-xl mx-auto">
                  Adaugă servicii extra pentru comanda ta
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {options.map((option) => (
                  <Card key={option.id} className="border-2 border-neutral-200 hover:border-primary-400 transition-all hover:shadow-md">
                    <CardContent className="p-4 lg:p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-secondary-900 text-sm lg:text-base">{option.name}</h3>
                          {option.is_required && (
                            <Badge className="bg-secondary-900 text-white text-[10px] flex-shrink-0">
                              Obligatoriu
                            </Badge>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-xs lg:text-sm text-neutral-600 mb-3 flex-1">{option.description}</p>
                        )}
                        <span className="font-bold text-primary-600 text-base lg:text-lg mt-auto">
                          +{option.price_modifier} RON
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why You Need This - Expanded */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Cazuri de utilizare
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                {service.slug === 'cazier-fiscal'
                  ? 'Când Ai Nevoie de Cazier Fiscal?'
                  : `Când ai nevoie de ${service.name}?`}
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Documentul este solicitat în numeroase situații oficiale. Iată principalele cazuri de utilizare.
              </p>
            </div>

            {/* Categorized Use Cases for Cazier Fiscal - 3 per row */}
            {service.slug === 'cazier-fiscal' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Angajare */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">1</span>
                    Angajare și Carieră
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Angajare sector public/privat',
                      'Numire în funcție publică',
                      'Promovare sau transfer',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">2</span>
                    Înființare Companie
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Înființare SRL/PFA',
                      'Asociație sau Fundație',
                      'Parteneriat comercial',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Licitații și Fonduri */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">3</span>
                    Licitații și Fonduri
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Licitații publice/achiziții',
                      'Fonduri europene, APIA',
                      'Programul RABLA',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financiar */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">4</span>
                    Servicii Financiare
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Credit bancar/de consum',
                      'Contract asigurări, leasing',
                      'Deschidere cont business',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Autorizații */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">5</span>
                    Autorizații și Licențe
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Obținere autorizație/licență',
                      'Înscriere Barou, CECCAR',
                      'Direcția Generală a Vămilor',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Altele */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">6</span>
                    Alte Situații
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Înscriere examen/concurs',
                      'Verificare stare fiscală',
                      'Încheierea contractelor',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : service.slug === 'extras-carte-funciara' ? (
              /* Use cases for Extras Carte Funciara */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">1</span>
                    Tranzacții Imobiliare
                  </h3>
                  <div className="space-y-2">
                    {['Vânzare/cumpărare apartament', 'Vânzare/cumpărare casă', 'Tranzacții teren'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">2</span>
                    Credite Ipotecare
                  </h3>
                  <div className="space-y-2">
                    {['Credit ipotecar bancă', 'Refinanțare credit', 'Evaluare imobil'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">3</span>
                    Verificare Proprietate
                  </h3>
                  <div className="space-y-2">
                    {['Verificare proprietar', 'Verificare sarcini/ipoteci', 'Due diligence'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">4</span>
                    Notariat
                  </h3>
                  <div className="space-y-2">
                    {['Contract vânzare-cumpărare', 'Donație imobil', 'Succesiune'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">5</span>
                    Construcții
                  </h3>
                  <div className="space-y-2">
                    {['Autorizație construire', 'Intabulare construcție', 'Dezmembrare teren'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">6</span>
                    Altele
                  </h3>
                  <div className="space-y-2">
                    {['Închiriere imobil', 'Litigii proprietate', 'Actualizare date CF'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : service.slug === 'certificat-constatator' ? (
              /* Use cases for Certificat Constatator */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">1</span>
                    Licitații Publice
                  </h3>
                  <div className="space-y-2">
                    {['Achiziții publice SEAP', 'Licitații locale', 'Contracte cadru'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">2</span>
                    Fonduri și Finanțări
                  </h3>
                  <div className="space-y-2">
                    {['Fonduri europene', 'APIA, AFIR', 'IMM Invest, Start-Up Nation'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">3</span>
                    Parteneriate
                  </h3>
                  <div className="space-y-2">
                    {['Due diligence parteneri', 'Verificare furnizori', 'Contracte comerciale'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">4</span>
                    Bănci și Credite
                  </h3>
                  <div className="space-y-2">
                    {['Credit bancar firmă', 'Deschidere cont curent', 'Leasing echipamente'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">5</span>
                    Autorități
                  </h3>
                  <div className="space-y-2">
                    {['ANAF, Finanțe', 'Primărie, Consiliu Local', 'Tribunal, Judecătorie'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-secondary-900 text-xs font-bold">6</span>
                    Altele
                  </h3>
                  <div className="space-y-2">
                    {['Modificări ONRC', 'Fuziuni/Divizări', 'Insolvență'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum Funcționează?
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Obții {service.name.toLowerCase()} în 4 pași simpli, 100% online. Fără deplasări, fără cozi, fără bătăi de cap.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                {
                  step: 1,
                  title: 'Completează Formularul',
                  desc: 'Introdu datele personale în formularul nostru securizat. Durează maxim 5 minute.',
                  icon: FileText,
                },
                {
                  step: 2,
                  title: 'Încarcă Documentele',
                  desc: 'Fotografiază actul de identitate (față + verso) și fă un selfie pentru verificare KYC.',
                  icon: User,
                },
                {
                  step: 3,
                  title: 'Plătește Securizat',
                  desc: 'Alege metoda de plată preferată. Acceptăm card, Apple Pay, Google Pay prin Stripe.',
                  icon: Shield,
                },
                {
                  step: 4,
                  title: 'Primești Documentul',
                  desc: `În ${service.estimated_days} zile lucrătoare primești documentul pe email + opțional curier.`,
                  icon: CheckCircle,
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-neutral-50 rounded-2xl p-6 h-full border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-secondary-900 font-bold text-lg group-hover:scale-110 transition-transform">
                        {item.step}
                      </div>
                      <item.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-5 w-5 text-primary-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Required Documents */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1280px]">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Documente Necesare
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                Pregătește aceste documente înainte de a începe comanda
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
              {requiredDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-green-200 hover:bg-green-50/50 transition-all"
                >
                  <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-secondary-900 font-medium">{doc}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-200 max-w-3xl mx-auto">
              <h3 className="font-bold text-secondary-900 mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-600" />
                Important
              </h3>
              <p className="text-sm text-secondary-700 leading-relaxed">
                Asigură-te că documentele încărcate sunt clare și lizibile.
                Fotografiile trebuie să fie bine iluminate și fără reflexii pentru a fi procesate corect.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section - Accordion Style */}
        <ServiceFAQ
          title={service.slug === 'cazier-fiscal'
            ? 'Întrebări Frecvente - Cazier Fiscal'
            : service.slug === 'extras-carte-funciara'
            ? 'Întrebări Frecvente - Extras Carte Funciară'
            : service.slug === 'certificat-constatator'
            ? 'Întrebări Frecvente - Certificat Constatator'
            : 'Întrebări Frecvente'}
          faqs={service.slug === 'cazier-fiscal' ? [
            {
              q: 'Ce este exact un Cazier Fiscal?',
              a: 'Document oficial emis de ANAF (Agenția Națională de Administrare Fiscală) care atestă că o persoană fizică nu are datorii la bugetul de stat. Este o dovadă de moralitate fiscală.'
            },
            {
              q: 'Care este diferența între Cazier Fiscal și Cazier Judiciar?',
              a: 'Cazier Fiscal = datorii la stat (emis de ANAF). Cazier Judiciar = condamnări penale (emis de Poliție). Sunt documente complet diferite de la instituții diferite.'
            },
            {
              q: 'Cât timp este valabil Cazierul Fiscal?',
              a: '30 de zile de la data emiterii. După aceea, trebuie solicitat din nou dacă instituția care îl cere vrea document proaspăt.'
            },
            {
              q: 'Câte zile durează procesarea?',
              a: '5 zile lucrătoare în mod standard. 1-2 zile cu opțiunea Urgență (+99 RON). Contăm luni-vineri, weekendurile și sărbătorile NU se numără.'
            },
            {
              q: 'Ce metode de plată acceptați?',
              a: 'Card (Visa, Mastercard, Amex), Apple Pay, Google Pay și transfer bancar. Toate sunt 100% sigure prin Stripe.'
            },
            {
              q: 'Este plata online sigură?',
              a: 'Absolut! Folosim Stripe cu certificare PCI DSS Nivel 1 - cel mai sigur standard global pentru procesare plăți.'
            },
            {
              q: 'Cum primesc documentul?',
              a: 'Pe email ca PDF imediat după procesare + opțional prin curier fizic la adresa de livrare (România +25 RON, Internațional +89.25 RON).'
            },
            {
              q: 'De ce aveți nevoie de selfie cu actul de identitate?',
              a: 'Verificare Anti-Fraudă (KYC). Trebuie să confirmăm că tu ești persoana din act. ANAF cere verificare de identitate oficială.'
            },
            {
              q: 'Pot cere Cazier Fiscal dacă sunt cetățean străin?',
              a: 'Da! Dar ai nevoie și de Permis de Rezidență sau Certificat Înregistrare Fiscală în România.'
            },
            {
              q: 'Am datorii la ANAF. Ce se întâmplă?',
              a: 'Cazierul tău va arăta datoriile. Documentul se emite oricum - reflectă situația reală. Negociezi plata cu ANAF separat.'
            },
            {
              q: 'Pot cere traducere a Cazierului Fiscal?',
              a: 'Da! Traducere autorizată disponibilă în 8 limbi (Engleză, Franceză, Germană, Italiană, Spaniolă, Portugheză, Arabă) - +178.50 RON.'
            },
            {
              q: 'Ce este apostila și când am nevoie?',
              a: 'Certificare internațională pentru uz în alte țări (Convenția de la Haga). Necesară doar dacă documentul va fi folosit în străinătate - +83.30 RON.'
            },
          ] : service.slug === 'extras-carte-funciara' ? [
            {
              q: 'Ce este Extrasul de Carte Funciară?',
              a: 'Document oficial emis de ANCPI/OCPI care conține toate informațiile despre un imobil: proprietar actual, suprafață, sarcini, ipoteci și servituți. Este obligatoriu pentru orice tranzacție imobiliară.'
            },
            {
              q: 'Ce informații conține Extrasul CF?',
              a: 'Partea I: Descrierea imobilului (suprafață, adresă). Partea II: Proprietarii și modul de dobândire. Partea III: Sarcini - ipoteci, servituți, interdicții.'
            },
            {
              q: 'De ce am nevoie de numărul cadastral?',
              a: 'Numărul cadastral identifică unic imobilul în baza de date ANCPI. Îl găsești pe actul de proprietate, contract de vânzare-cumpărare sau extrasul CF anterior.'
            },
            {
              q: 'Cât durează obținerea extrasului CF?',
              a: 'Standard: în funcție de complexitate. Urgență: 30 minute (+19.99 RON). Disponibil doar în zilele lucrătoare.'
            },
            {
              q: 'Pot obține extras CF pentru orice imobil?',
              a: 'Da, extrasul CF este document public. Poți solicita extras pentru orice imobil din România, nu trebuie să fii proprietar.'
            },
            {
              q: 'Ce este Extrasul CF Colectivă?',
              a: 'Pentru blocuri de apartamente - conține informații despre toate unitățile individuale și părțile comune. Preț: 169.99 RON.'
            },
            {
              q: 'Pot afla cine este proprietarul unui imobil?',
              a: 'Da, prin serviciul "Identificare imobil după adresă" (249.99 RON). Durează până la 5 zile lucrătoare.'
            },
            {
              q: 'Cum primesc documentul?',
              a: 'Pe email în format PDF. Opțional și pe WhatsApp pentru acces rapid de pe telefon.'
            },
          ] : service.slug === 'certificat-constatator' ? [
            {
              q: 'Ce este Certificatul Constatator?',
              a: 'Document oficial emis de ONRC (Oficiul Național al Registrului Comerțului) care confirmă datele actuale ale unei firme: denumire, sediu, asociați, administratori, capital social, obiect de activitate.'
            },
            {
              q: 'Pentru ce tip de entități pot obține certificat?',
              a: 'SRL, SA, SCS, SCA, SNC, PFA, II (Întreprindere Individuală), IF (Întreprindere Familială). NU se eliberează pentru: ONG-uri, asociații, fundații, cabinete medicale/avocatură.'
            },
            {
              q: 'Ce este Certificatul Constatator cu Istoric?',
              a: 'Include toate modificările din viața firmei: schimbări de asociați, sediu, administratori, capital. Preț: 499.99 RON. Util pentru due diligence complet.'
            },
            {
              q: 'Cât durează obținerea certificatului?',
              a: 'Standard: în funcție de complexitate. Urgență: 30 minute (+22.99 RON). Disponibil doar în zilele lucrătoare, program ONRC.'
            },
            {
              q: 'Ce CUI trebuie să introduc?',
              a: 'CUI-ul (Codul Unic de Identificare) al firmei pentru care dorești certificatul. Îl găsești pe orice factură emisă de firmă sau pe site-ul Ministerului Finanțelor.'
            },
            {
              q: 'Ce înseamnă "Document solicitat să servească la"?',
              a: 'Certificatul va menționa instituția destinatară (ANAF, bancă, licitație etc.). Alege corect pentru că unele instituții cer certificat emis special pentru ele.'
            },
            {
              q: 'Pot alege perioada certificatului?',
              a: 'Da, poți selecta "De la înființare până în prezent" sau o perioadă custom (de la data X până la data Y).'
            },
            {
              q: 'Cum primesc documentul?',
              a: 'Pe email în format PDF. Opțional și pe WhatsApp pentru acces rapid de pe telefon.'
            },
          ] : []}
        />

        {/* CTA Section - Navy like homepage */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          {/* Background pattern */}
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

          <div className="relative container mx-auto px-4 max-w-[900px]">
            <div className="text-center">
              <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
                Gata să obții {service.name}?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Completează formularul în 5 minute și primești documentul în {service.estimated_days} zile lucrătoare.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  asChild
                  className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Link href={`/comanda/${service.slug}`}>
                    Comandă Acum
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl transition-all duration-200"
                >
                  <a href="tel:+40312299399">
                    <Phone className="mr-2 w-5 h-5" />
                    Sună-ne
                  </a>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 lg:gap-8 mb-12">
                <div className="flex items-center gap-2 text-white/70">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium">Livrare {service.estimated_days} zile</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Shield className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium">Plată securizată</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium">Garanție rambursare</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <a
                  href="tel:+40312299399"
                  className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary-500/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/50">Telefon suport</p>
                    <p className="text-white font-semibold">+40 312 299 399</p>
                  </div>
                </a>
                <a
                  href="mailto:contact@eghiseul.ro"
                  className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary-500/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/50">Email</p>
                    <p className="text-white font-semibold">contact@eghiseul.ro</p>
                  </div>
                </a>
              </div>

              {/* Google Rating */}
              <div className="mt-10 pt-10 border-t border-white/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-[#FBBC04] fill-[#FBBC04]"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white font-bold">
                  4.9/5 din 391 recenzii pe Google
                </p>
                <p className="text-white/50 text-sm mt-1">
                  „Cel mai rapid mod de a obține documente oficiale!" — Client verificat
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Clock,
  Shield,
  Zap,
  FileText,
  CheckCircle,
  ChevronRight,
  Building2,
  Scale,
  Phone,
  Mail,
  Briefcase,
  FileCheck,
  Handshake,
  Euro,
  AlertTriangle,
} from 'lucide-react';
import { Service, ServiceOption } from '@/types/services';
import { Footer } from '@/components/home/footer';
import { ServiceFAQ } from '@/components/services/service-faq';

// Database slug for this service
const SERVICE_SLUG = 'cazier-judiciar-persoana-juridica';

// Enable ISR with 1-hour revalidation
export const revalidate = 3600;

// Fetch service data
async function getService(): Promise<{ service: Service; options: ServiceOption[] } | null> {
  const supabase = createPublicClient();

  // Get service
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('slug', SERVICE_SLUG)
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

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const data = await getService();

  if (!data) {
    return {
      title: 'Cazier Judiciar Persoană Juridică | Firme | eGhișeul',
      description: 'Obține cazierul judiciar pentru firma ta online.',
    };
  }

  const { service } = data;
  const title = service.meta_title || 'Cazier Judiciar Persoană Juridică Online | Firme | eGhișeul';
  const description = service.meta_description || service.description || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://eghiseul.ro/servicii/cazier-judiciar-online/persoana-juridica',
      siteName: 'eGhiseul.ro',
      locale: 'ro_RO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: 'https://eghiseul.ro/servicii/cazier-judiciar-online/persoana-juridica',
    },
  };
}

export default async function CazierJudiciarPJPage() {
  const data = await getService();

  if (!data) {
    notFound();
  }

  const { service, options } = data;

  // Use cases for Cazier Judiciar PJ
  const useCases = [
    {
      icon: FileCheck,
      title: 'Licitații Publice',
      items: ['Achiziții publice SEAP', 'Licitații locale', 'Contracte cadru'],
    },
    {
      icon: Handshake,
      title: 'Contracte cu Statul',
      items: ['Instituții publice', 'Ministere', 'Administrație locală'],
    },
    {
      icon: Euro,
      title: 'Fonduri Europene',
      items: ['PNRR', 'Fonduri structurale', 'Programul IMM'],
    },
    {
      icon: Briefcase,
      title: 'Parteneriate',
      items: ['Due diligence', 'Joint ventures', 'Fuziuni/Achiziții'],
    },
  ];

  // Company types supported
  const companyTypes = [
    { code: 'SRL', name: 'Societate cu Răspundere Limitată' },
    { code: 'SA', name: 'Societate pe Acțiuni' },
    { code: 'SCS', name: 'Societate în Comandită Simplă' },
    { code: 'SNC', name: 'Societate în Nume Colectiv' },
    { code: 'PFA', name: 'Persoană Fizică Autorizată', note: 'Se eliberează pe persoana fizică' },
    { code: 'II', name: 'Întreprindere Individuală', note: 'Se eliberează pe persoana fizică' },
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
            name: 'Cazier Judiciar Persoană Juridică',
            description: service.description,
            provider: {
              '@type': 'Organization',
              name: 'eGhiseul.ro',
              url: 'https://eghiseul.ro',
            },
            offers: {
              '@type': 'Offer',
              price: service.base_price,
              priceCurrency: 'RON',
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
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8 flex-wrap">
              <Link href="/" className="hover:text-primary-500 transition-colors">
                Acasă
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/#servicii" className="hover:text-primary-500 transition-colors">
                Servicii
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/servicii/cazier-judiciar-online" className="hover:text-primary-500 transition-colors">
                Cazier Judiciar
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">Persoană Juridică</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">
              {/* Left Content */}
              <div className="flex-1 max-w-[700px]">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-blue-500 text-white font-bold px-3 py-1">
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    Persoană Juridică
                  </Badge>
                  {service.urgent_available && (
                    <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1" />
                      Urgent Disponibil
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Scale className="h-3.5 w-3.5 mr-1" />
                    Juridice
                  </Badge>
                </div>

                {/* H1 */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Cazier Judiciar Online
                  <span className="block text-blue-400">Persoană Juridică / Firmă</span>
                </h1>

                {/* Description */}
                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* SEO Content Box */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-blue-400">Cazierul Judiciar pentru Firmă</strong> atestă că
                    persoana juridică nu are antecedente penale. Procesul este simplu:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      Introduci CUI-ul firmei (auto-completare date)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      Completezi datele reprezentantului legal
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      Plătești securizat prin Stripe
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      Primești documentul în {service.estimated_days} zile
                    </li>
                  </ul>
                </div>

                {/* Google Reviews Badge */}
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg">
                  <div className="flex items-center gap-1.5 sm:gap-2">
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

              {/* Price Card */}
              <div className="lg:w-[360px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                  {/* Header with price */}
                  <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-[#0C1A2F] p-6 text-center">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                      <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full mb-3">
                        PREȚ FIRMĂ
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
                    {service.urgent_days && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-secondary-900 text-sm">Urgent: {service.urgent_days} zile</p>
                            <span className="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded-lg">+99 RON</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CUI Auto-complete */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Auto-completare CUI</p>
                        <p className="text-xs text-neutral-500">Date firmă preluate automat</p>
                      </div>
                    </div>

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
                      className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 transition-all mt-4"
                      size="lg"
                    >
                      <Link href={`/comanda/${SERVICE_SLUG}`}>
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

        {/* Company Types */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Tipuri de Entități Acceptate
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                Cazierul judiciar pentru persoane juridice este disponibil pentru aceste tipuri de firme
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {companyTypes.map((type) => (
                <div key={type.code} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 text-center hover:border-blue-300 transition-colors">
                  <p className="text-xl font-black text-secondary-900 mb-1">{type.code}</p>
                  <p className="text-xs text-neutral-600">{type.name}</p>
                  {type.note && (
                    <p className="text-[10px] text-orange-600 mt-2 flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {type.note}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Warning for PFA/II/IF */}
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 max-w-2xl mx-auto">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Important pentru PFA, II, IF</p>
                <p className="text-amber-700 text-sm">
                  Pentru Persoană Fizică Autorizată, Întreprindere Individuală și Întreprindere Familială,
                  cazierul se eliberează pe numele persoanei fizice titulare. Poți folosi serviciul pentru{' '}
                  <Link href="/servicii/cazier-judiciar-online/persoana-fizica" className="underline font-semibold">
                    Persoană Fizică
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Options */}
        {options.length > 0 && (
          <section className="py-12 lg:py-20 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-[1400px]">
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
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
                  <Card key={option.id} className="border-2 border-neutral-200 hover:border-blue-400 transition-all hover:shadow-md">
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
                        <span className="font-bold text-blue-600 text-base lg:text-lg mt-auto">
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

        {/* Use Cases */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
                Cazuri de utilizare
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Când Ai Nevoie de Cazier Judiciar pentru Firmă?
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Documentul este solicitat în numeroase situații de business
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <useCase.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">{useCase.title}</h3>
                  <div className="space-y-2">
                    {useCase.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
                Proces simplu
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cum Funcționează?
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Obții cazierul judiciar pentru firmă în 4 pași simpli
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                {
                  step: 1,
                  title: 'Introdu CUI-ul',
                  desc: 'Sistemul preia automat datele firmei de la ONRC.',
                  icon: Building2,
                },
                {
                  step: 2,
                  title: 'Date Reprezentant',
                  desc: 'Completează datele reprezentantului legal care semnează.',
                  icon: FileText,
                },
                {
                  step: 3,
                  title: 'Plătește Securizat',
                  desc: 'Card, Apple Pay, Google Pay - toate prin Stripe.',
                  icon: Shield,
                },
                {
                  step: 4,
                  title: 'Primești Documentul',
                  desc: `În ${service.estimated_days} zile primești cazierul pe email.`,
                  icon: CheckCircle,
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-6 h-full border border-neutral-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                        {item.step}
                      </div>
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-5 w-5 text-blue-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Required Documents */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1280px]">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce Ai Nevoie
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                Pregătește aceste informații înainte de a începe
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
              {[
                'CUI-ul firmei (Cod Unic de Identificare)',
                'Date reprezentant legal (CNP, adresă)',
                'Carte identitate reprezentant',
                'Semnătură electronică',
              ].map((doc, index) => (
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
          </div>
        </section>

        {/* FAQ Section */}
        <ServiceFAQ
          title="Întrebări Frecvente - Cazier Judiciar Firmă"
          faqs={[
            {
              q: 'Ce este Cazierul Judiciar pentru Persoană Juridică?',
              a: 'Este un document oficial care atestă că firma (persoana juridică) nu are antecedente penale. Se emite de Poliția Română.',
            },
            {
              q: 'Ce firmă poate solicita cazier judiciar?',
              a: 'SRL, SA, SCS, SNC și alte forme juridice. PFA, II și IF primesc cazier pe persoana fizică titulară.',
            },
            {
              q: 'Cum funcționează auto-completarea CUI?',
              a: 'Introduci CUI-ul și sistemul preia automat datele firmei de la ONRC: denumire, sediu, reprezentanți.',
            },
            {
              q: 'Cine poate solicita cazierul pentru firmă?',
              a: 'Reprezentantul legal al firmei (administratorul) sau o persoană împuternicită cu delegație notarială.',
            },
            {
              q: 'Câte zile durează procesarea?',
              a: `${service.estimated_days} zile lucrătoare în mod standard. ${service.urgent_days} zile cu opțiunea Urgență (+99 RON).`,
            },
            {
              q: 'Ce se întâmplă dacă firma are antecedente?',
              a: 'Cazierul va arăta condamnările definitive ale persoanei juridice. Documentul se emite oricum.',
            },
            {
              q: 'Este valabil pentru licitații SEAP?',
              a: 'Da, cazierul judiciar pentru PJ este acceptat pentru licitații publice, fonduri europene și contracte cu statul.',
            },
            {
              q: 'Cum primesc documentul?',
              a: 'Pe email ca PDF + opțional prin curier fizic la sediul firmei sau altă adresă.',
            },
          ]}
        />

        {/* CTA Section */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-b from-blue-900 to-[#0C1A2F] overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 max-w-[900px]">
            <div className="text-center">
              <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
                Gata să obții Cazierul Judiciar pentru Firmă?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Completează formularul în 5 minute și primești documentul în {service.estimated_days} zile.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  asChild
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(59,130,246,0.35)] hover:shadow-[0_10px_20px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Link href={`/comanda/${SERVICE_SLUG}`}>
                    Comandă Acum
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white font-bold px-8 py-6 text-lg rounded-xl transition-all duration-200"
                >
                  <a href="tel:+40312299399">
                    <Phone className="mr-2 w-5 h-5" />
                    Sună-ne
                  </a>
                </Button>
              </div>

              {/* Contact Info */}
              <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <a
                  href="tel:+40312299399"
                  className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/50">Telefon suport</p>
                    <p className="text-white font-semibold">+40 312 299 399</p>
                  </div>
                </a>
                <a
                  href="mailto:contact@eghiseul.ro"
                  className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/50">Email</p>
                    <p className="text-white font-semibold">contact@eghiseul.ro</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

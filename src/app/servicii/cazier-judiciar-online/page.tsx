import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/home/footer';
import {
  ArrowRight,
  User,
  Building2,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  ChevronRight,
  Phone,
  Mail,
  Scale,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cazier Judiciar Online | Persoane Fizice și Firme | eGhișeul',
  description: 'Obține cazierul judiciar online rapid și simplu. Pentru persoane fizice sau firme. Livrare în 5-7 zile lucrătoare. Document oficial de la Poliție.',
  openGraph: {
    title: 'Cazier Judiciar Online | Persoane Fizice și Firme | eGhișeul',
    description: 'Obține cazierul judiciar online rapid și simplu. Pentru persoane fizice sau firme.',
    type: 'website',
    url: 'https://eghiseul.ro/servicii/cazier-judiciar-online',
    siteName: 'eGhiseul.ro',
    locale: 'ro_RO',
  },
  alternates: {
    canonical: 'https://eghiseul.ro/servicii/cazier-judiciar-online',
  },
};

export default function CazierJudiciarHubPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Cazier Judiciar Online',
            description: 'Obținem cazierul judiciar de la Poliție/Parchet pentru persoane fizice și juridice.',
            provider: {
              '@type': 'Organization',
              name: 'eGhiseul.ro',
              url: 'https://eghiseul.ro',
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
              <span className="text-white font-medium">Cazier Judiciar</span>
            </nav>

            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <Badge className="bg-primary-500 text-secondary-900 font-bold px-4 py-1.5 mb-6">
                <Scale className="h-4 w-4 mr-2" />
                Servicii Juridice
              </Badge>

              {/* H1 */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                Cazier Judiciar Online
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8">
                Obținem cazierul judiciar de la Poliție/Parchet. Documentul oficial atestă că nu ai antecedente penale.
                Disponibil pentru <strong className="text-primary-500">persoane fizice</strong> și <strong className="text-primary-500">persoane juridice (firme)</strong>.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-white/70 bg-white/5 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">Livrare 5-7 zile</span>
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
            </div>
          </div>
        </section>

        {/* Service Selection */}
        <section className="py-12 lg:py-20 bg-white -mt-8">
          <div className="container mx-auto px-4 max-w-[1000px]">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Alege Tipul de Cazier
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                Selectează serviciul potrivit pentru situația ta
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Persoana Fizica Card */}
              <Link href="/servicii/cazier-judiciar-online/persoana-fizica" className="group">
                <Card className="h-full border-2 border-neutral-200 hover:border-primary-500 transition-all hover:shadow-xl cursor-pointer">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex flex-col h-full">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary-500 group-hover:scale-110 transition-all">
                        <User className="w-8 h-8 text-primary-600 group-hover:text-secondary-900" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                        Persoană Fizică
                      </h3>

                      {/* Description */}
                      <p className="text-neutral-600 mb-5 flex-1">
                        Solicit cazier judiciar pentru mine personal. Necesar pentru angajare, emigrare, adopție sau alte proceduri legale.
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {[
                          'Verificare identitate cu CI/Pașaport',
                          'Selfie pentru confirmare KYC',
                          'Semnătură electronică',
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-5 border-t border-neutral-200">
                        <div>
                          <span className="text-3xl font-black text-secondary-900">169</span>
                          <span className="text-lg font-bold text-neutral-500 ml-1">RON</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:text-primary-700">
                          Comandă
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Persoana Juridica Card */}
              <Link href="/servicii/cazier-judiciar-online/persoana-juridica" className="group">
                <Card className="h-full border-2 border-neutral-200 hover:border-primary-500 transition-all hover:shadow-xl cursor-pointer">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex flex-col h-full">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary-500 group-hover:scale-110 transition-all">
                        <Building2 className="w-8 h-8 text-blue-600 group-hover:text-secondary-900" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                        Persoană Juridică
                      </h3>

                      {/* Description */}
                      <p className="text-neutral-600 mb-5 flex-1">
                        Solicit cazier judiciar pentru firma mea. Necesar pentru licitații publice, contracte cu statul sau parteneriate comerciale.
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {[
                          'Validare CUI cu auto-completare',
                          'Date reprezentant legal',
                          'Semnătură electronică',
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-5 border-t border-neutral-200">
                        <div>
                          <span className="text-3xl font-black text-secondary-900">199</span>
                          <span className="text-lg font-bold text-neutral-500 ml-1">RON</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:text-primary-700">
                          Comandă
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Urgent Badge */}
            <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200 flex items-center justify-center gap-4">
              <Zap className="w-6 h-6 text-primary-600" />
              <p className="text-secondary-900">
                <strong>Urgență disponibilă:</strong> Livrare în 1-2 zile (+99 RON)
              </p>
            </div>
          </div>
        </section>

        {/* What is Cazier Judiciar */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1000px]">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce este Cazierul Judiciar?
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-neutral-200">
              <p className="text-neutral-700 leading-relaxed mb-6">
                <strong className="text-secondary-900">Cazierul Judiciar</strong> este un document oficial emis de
                Poliția Română sau Parchet care atestă că o persoană fizică sau juridică nu are antecedente penale
                sau, dacă are, menționează condamnările definitive.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-xl p-5">
                  <h3 className="font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    Pentru Persoane Fizice
                  </h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Angajare în sectorul public sau privat
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Emigrare sau obținere viză
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Adopție sau tutelă
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Permis port-armă
                    </li>
                  </ul>
                </div>

                <div className="bg-neutral-50 rounded-xl p-5">
                  <h3 className="font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Pentru Persoane Juridice
                  </h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Licitații publice și achiziții
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Contracte cu statul
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Parteneriate comerciale
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Fonduri europene
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
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

          <div className="relative container mx-auto px-4 max-w-[900px]">
            <div className="text-center">
              <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
                Ai nevoie de ajutor?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Echipa noastră este disponibilă să te ajute să alegi serviciul potrivit.
              </p>

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
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Monitor, Users } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] -mt-16 lg:-mt-[112px]">
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

      <div className="relative container mx-auto px-4 max-w-[1280px] pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-40 lg:pb-24">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 lg:gap-12 xl:gap-16">
          {/* Left Column - Text */}
          <div className="flex-1 min-w-[280px] max-w-[680px] text-center lg:text-left px-1 sm:px-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-5xl leading-[1.2]">
              Cazier Judiciar și Documente Oficiale Online –{' '}
              <span className="text-primary-500">Fără Cozi, Livrare 24-48h</span>
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/85 leading-relaxed">
              Obțineți cazier judiciar, certificat de integritate, cazier fiscal, extras
              carte funciară și toate certificatele de stare civilă{' '}
              <strong className="text-white">fără cozi, fără deplasări</strong>.
              eGhișeul.ro gestionează tot procesul – livrare rapidă în România și
              internațional.
            </p>

            {/* USP Highlight Box */}
            <div className="mt-5 sm:mt-6 bg-primary-500/10 border-l-[3px] border-primary-500 rounded-r-xl px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-white/95 text-xs sm:text-sm leading-relaxed">
                <strong className="text-primary-500">Peste 200.000 de documente</strong>{' '}
                procesate din 2023. Tu completezi formularul online, noi ne ocupăm de
                restul – certificare, apostilare și livrare la ușa ta.
              </p>
            </div>

            {/* Google Reviews Badge */}
            <div className="mt-6 sm:mt-8 flex justify-center lg:justify-start">
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
          </div>

          {/* Right Column - Services Box */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 w-full max-w-[480px] shadow-2xl">
            <h2 className="text-base sm:text-lg font-bold text-secondary-900 text-center mb-4 sm:mb-5">
              Servicii Disponibile
            </h2>

            {/* Services Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group relative flex flex-col p-3 sm:p-3.5 bg-neutral-50 rounded-xl border border-transparent hover:border-primary-500 hover:bg-white hover:shadow-md transition-all min-h-[72px] sm:min-h-[80px]"
                >
                  {/* Top row: Icon + Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <service.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-primary-600" />
                    </div>
                    {service.badge && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          service.badge === 'Popular'
                            ? 'bg-primary-500 text-secondary-900'
                            : 'bg-success-500 text-white'
                        }`}
                      >
                        {service.badge}
                      </span>
                    )}
                  </div>
                  {/* Service name */}
                  <span className="text-xs sm:text-[13px] font-semibold text-secondary-900 leading-tight group-hover:text-secondary-900">
                    {service.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              asChild
              className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold h-11 sm:h-12 rounded-xl shadow-md hover:shadow-lg transition-all mb-3 sm:mb-4"
            >
              <Link href="/#servicii">
                Toate Serviciile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-3 sm:pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
                <span className="text-[10px] sm:text-xs text-neutral-600 font-medium">Livrare 24-48h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
                <span className="text-[10px] sm:text-xs text-neutral-600 font-medium">100% Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
                <span className="text-[10px] sm:text-xs text-neutral-600 font-medium">150k+ Clienți</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Services data with icons
import {
  FileText,
  Shield,
  Receipt,
  Car,
  User,
  Globe,
  Heart,
  CheckCircle,
  Building,
  type LucideIcon,
} from 'lucide-react';

interface ServiceItem {
  name: string;
  slug: string;
  icon: LucideIcon;
  badge?: 'Popular' | 'NOU';
}

const services: ServiceItem[] = [
  { name: 'Cazier Judiciar', slug: 'cazier-judiciar', icon: FileText, badge: 'Popular' },
  { name: 'Certificat Integritate', slug: 'certificat-integritate', icon: Shield },
  { name: 'Cazier Fiscal', slug: 'cazier-fiscal', icon: Receipt },
  { name: 'Rovinieta Online', slug: 'rovinieta', icon: Car, badge: 'NOU' },
  { name: 'Cazier Auto', slug: 'cazier-auto', icon: Car },
  { name: 'Certificat Naștere', slug: 'certificat-nastere', icon: User, badge: 'Popular' },
  { name: 'Extras Multilingv', slug: 'extras-multilingv-nastere', icon: Globe },
  { name: 'Certificat Căsătorie', slug: 'certificat-casatorie', icon: Heart },
  { name: 'Extras Multilingv', slug: 'extras-multilingv-casatorie', icon: Globe },
  { name: 'Certificat Celibat', slug: 'certificat-celibat', icon: CheckCircle, badge: 'Popular' },
  { name: 'Extras Carte Funciară', slug: 'extras-carte-funciara', icon: Building },
  { name: 'Certificat Constatator', slug: 'certificat-constatator', icon: Building },
];

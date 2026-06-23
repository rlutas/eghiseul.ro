'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Zap, FileText, Building2, Car, User, Scale, Home } from 'lucide-react';
import { Service } from '@/types/services';
import { serviceUrl } from '@/lib/seo/constants';

interface ServiceCardProps {
  service: Service;
}

const categoryIcons: Record<string, React.ReactNode> = {
  fiscale: <FileText className="h-9 w-9" />,
  juridice: <Scale className="h-9 w-9" />,
  imobiliare: <Home className="h-9 w-9" />,
  comerciale: <Building2 className="h-9 w-9" />,
  auto: <Car className="h-9 w-9" />,
  personale: <User className="h-9 w-9" />,
};

/** DB slug -> document specimen image (preluat din WordPress). Serviciile fără
 *  specimen (rovinietă, plan cadastral, identificare, multilingv) cad pe iconiță. */
const SPECIMEN_BY_SLUG: Record<string, string> = {
  'cazier-judiciar': '/images/specimens/cazier-judiciar.png',
  'cazier-judiciar-persoana-fizica': '/images/specimens/cazier-judiciar.png',
  'cazier-judiciar-persoana-juridica': '/images/specimens/cazier-judiciar.png',
  'cazier-fiscal': '/images/specimens/cazier-fiscal.png',
  'cazier-fiscal-persoana-fizica': '/images/specimens/cazier-fiscal.png',
  'cazier-fiscal-persoana-juridica': '/images/specimens/cazier-fiscal.png',
  'cazier-auto': '/images/specimens/cazier-auto.png',
  'certificat-integritate': '/images/specimens/certificat-integritate.png',
  'extras-carte-funciara': '/images/specimens/extras-cf.png',
  'certificat-constatator': '/images/specimens/certificat-constatator.png',
  'certificat-nastere': '/images/specimens/certificat-nastere.webp',
  'certificat-casatorie': '/images/specimens/certificat-casatorie.webp',
  'certificat-celibat': '/images/specimens/certificat-celibat.png',
};

export function ServiceCard({ service }: ServiceCardProps) {
  const icon = categoryIcons[service.category] || <FileText className="h-9 w-9" />;
  const specimen = SPECIMEN_BY_SLUG[service.slug];

  return (
    <Card className="group relative overflow-hidden bg-white hover:shadow-[0_18px_40px_rgba(6,16,31,0.12)] transition-all duration-300 border border-neutral-200 hover:border-primary-300 hover:-translate-y-1 flex flex-col h-full rounded-2xl">
      {/* Document "sheet" floating on a navy spotlight — full document visible */}
      <div className="relative h-60 overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F] flex items-center justify-center">
        {/* gold dot texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '22px 22px' }}
          aria-hidden="true"
        />
        {/* warm glow behind the document */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/20 blur-3xl"
          aria-hidden="true"
        />

        {specimen ? (
          <div className="relative z-10 w-[150px] aspect-[1000/1414] overflow-hidden rounded-md bg-white ring-1 ring-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:rotate-[1deg]">
            <Image
              src={specimen}
              alt={`Cum arată documentul: ${service.name} — specimen`}
              fill
              className="object-cover"
              sizes="170px"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-secondary-900 shadow-[0_10px_28px_rgba(236,185,95,0.4)] transition-transform duration-300 group-hover:-translate-y-1.5">
            {icon}
          </div>
        )}

        {/* Urgency badge */}
        {service.urgent_available && (
          <Badge className="absolute top-3.5 right-3.5 z-20 bg-primary-500 text-secondary-900 font-bold px-3 py-1 rounded-full shadow-md">
            <Zap className="h-3 w-3 mr-1 inline" />
            Urgent
          </Badge>
        )}
        {/* hairline accent under the banner */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" aria-hidden="true" />
      </div>

      <CardContent className="space-y-4 flex-1 px-5 sm:px-6 pt-5 pb-0">
        {/* Service Name */}
        <h3 className="text-xl font-bold text-secondary-900 leading-snug group-hover:text-primary-700 transition-colors">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3">
          {service.short_description || service.description || 'Document disponibil pentru comandă online.'}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
          {/* Price */}
          <div className="space-y-1">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Preț</p>
            <p className="text-lg font-bold text-secondary-900">
              <span className="text-primary-600">{service.base_price}</span> RON
            </p>
          </div>

          {/* Processing Time */}
          <div className="space-y-1">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Termen</p>
            <p className="text-sm font-semibold text-secondary-900 flex items-center gap-1">
              <Clock className="h-4 w-4 text-primary-500" />
              {service.estimated_days === 1 ? '24 ore' : `${service.estimated_days} zile`}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 sm:p-6 pt-4">
        <Button
          asChild
          className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl h-12 shadow-[0_4px_12px_rgba(236,185,95,0.25)] hover:shadow-[0_6px_16px_rgba(236,185,95,0.35)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <Link href={serviceUrl(service.slug)}>
            Vezi detalii
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

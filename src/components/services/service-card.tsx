'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Zap, FileText, Building2, Car, User, Scale, Home } from 'lucide-react';
import { Service } from '@/types/services';
import { serviceUrl } from '@/lib/seo/constants';

interface ServiceCardProps {
  service: Service;
}

const categoryIcons: Record<string, React.ReactNode> = {
  fiscale: <FileText className="h-10 w-10" />,
  juridice: <Scale className="h-10 w-10" />,
  imobiliare: <Home className="h-10 w-10" />,
  comerciale: <Building2 className="h-10 w-10" />,
  auto: <Car className="h-10 w-10" />,
  personale: <User className="h-10 w-10" />,
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
  'certificat-nastere': '/images/specimens/certificat-nastere.png',
  'certificat-casatorie': '/images/specimens/certificat-casatorie.png',
  'certificat-celibat': '/images/specimens/certificat-celibat.png',
};

export function ServiceCard({ service }: ServiceCardProps) {
  const icon = categoryIcons[service.category] || <FileText className="h-10 w-10" />;
  const specimen = SPECIMEN_BY_SLUG[service.slug];

  return (
    <Card className="group relative overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border border-neutral-200 hover:border-primary-300 hover:-translate-y-1 flex flex-col h-full rounded-2xl">
      {/* Document preview (specimen photo) — sau placeholder cu iconiță */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-neutral-100 bg-neutral-100">
        {specimen ? (
          <Image
            src={specimen}
            alt={`Cum arată documentul: ${service.name} — specimen`}
            fill
            className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300 motion-reduce:transition-none"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 360px"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-500">
            {icon}
          </div>
        )}
        {/* Soft fade into the card body (only over a real document) */}
        {specimen && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
        )}
        {/* Urgency Badge */}
        {service.urgent_available && (
          <Badge className="absolute top-3 right-3 bg-primary-500 text-secondary-900 font-bold px-3 py-1 rounded-full shadow-sm">
            <Zap className="h-3 w-3 mr-1 inline" />
            Urgent
          </Badge>
        )}
      </div>

      <CardHeader className="p-5 sm:p-6 pb-0">
        <CardTitle className="text-xl font-bold text-secondary-900">
          {service.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 px-5 sm:px-6 pt-3 pb-0">
        {/* Description */}
        <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3">
          {service.short_description || service.description || 'Document oficial disponibil pentru comandă online.'}
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

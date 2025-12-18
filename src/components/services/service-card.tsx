'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Zap, FileText, Building2, Car, User, Scale, Home } from 'lucide-react';
import { Service } from '@/types/services';

interface ServiceCardProps {
  service: Service;
}

const categoryIcons: Record<string, React.ReactNode> = {
  fiscale: <FileText className="h-6 w-6" />,
  juridice: <Scale className="h-6 w-6" />,
  imobiliare: <Home className="h-6 w-6" />,
  comerciale: <Building2 className="h-6 w-6" />,
  auto: <Car className="h-6 w-6" />,
  personale: <User className="h-6 w-6" />,
};

export function ServiceCard({ service }: ServiceCardProps) {
  const icon = categoryIcons[service.category] || <FileText className="h-6 w-6" />;

  return (
    <Card className="relative overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-500 border-t border-r border-b border-neutral-200 hover:border-primary-300 hover:-translate-y-1 flex flex-col h-full rounded-2xl">
      {/* Urgency Badge */}
      {service.urgent_available && (
        <Badge className="absolute top-4 right-4 bg-primary-500 text-secondary-900 font-bold px-3 py-1 rounded-full">
          <Zap className="h-3 w-3 mr-1 inline" />
          Urgent
        </Badge>
      )}

      <CardHeader className="space-y-4 p-6">
        {/* Service Icon */}
        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
          {icon}
        </div>

        {/* Service Name */}
        <CardTitle className="text-xl font-bold text-secondary-900">
          {service.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 px-6 pb-0">
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

      <CardFooter className="p-6 pt-4">
        <Button
          asChild
          className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl h-12 shadow-[0_4px_12px_rgba(236,185,95,0.25)] hover:shadow-[0_6px_16px_rgba(236,185,95,0.35)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <Link href={`/services/${service.slug}`}>
            Comandă Acum
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

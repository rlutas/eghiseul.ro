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
    <Card className="relative overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 border border-neutral-200 flex flex-col h-full">
      {/* Urgency Badge */}
      {service.urgent_available && (
        <Badge className="absolute top-4 right-4 bg-amber-500 text-white font-semibold px-3 py-1">
          <Zap className="h-3 w-3 mr-1 inline" />
          Urgent Disponibil
        </Badge>
      )}

      <CardHeader className="space-y-4">
        {/* Service Icon */}
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>

        {/* Service Name */}
        <CardTitle className="text-xl font-bold text-neutral-900">
          {service.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        {/* Description */}
        <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3">
          {service.short_description || service.description || 'Document oficial disponibil pentru comandă online.'}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
          {/* Price */}
          <div className="space-y-1">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Pret</p>
            <p className="text-lg font-bold text-neutral-900">
              de la <span className="text-blue-600">{service.base_price} RON</span>
            </p>
          </div>

          {/* Processing Time */}
          <div className="space-y-1">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Termen</p>
            <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1">
              <Clock className="h-4 w-4 text-neutral-400" />
              {service.estimated_days === 1 ? '24 ore' : `${service.estimated_days} zile`}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6">
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Link href={`/services/${service.slug}`}>
            Comanda Acum
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

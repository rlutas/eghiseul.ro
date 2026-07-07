'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Search,
  X,
} from 'lucide-react';
import type { Service, ServiceCategory } from '@/types/services';
import { serviceUrl } from '@/lib/seo/constants';
import { filterServices, CATEGORY_LABELS } from '@/lib/services/service-search';
import { cn } from '@/lib/utils';

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

const SERVICE_SPECIMENS: Record<string, string> = {
  'cazier-judiciar': '/images/specimens/cazier-judiciar.png',
  'cazier-fiscal': '/images/specimens/cazier-fiscal.png',
  'cazier-auto': '/images/specimens/cazier-auto.png',
  'certificat-integritate': '/images/specimens/certificat-integritate.png',
  'certificat-nastere': '/images/specimens/certificat-nastere.webp',
  'certificat-casatorie': '/images/specimens/certificat-casatorie.webp',
  'certificat-celibat': '/images/specimens/certificat-celibat.webp',
  'certificat-constatator': '/images/specimens/certificat-constatator.png',
  rovinieta: '/images/specimens/rovinieta.webp',
  'extras-carte-funciara': '/images/specimens/extras-cf.png',
};

function serviceSpecimen(service: Service): string | null {
  return (
    SERVICE_SPECIMENS[service.slug] ||
    (service.category === 'imobiliare' ? '/images/specimens/extras-cf.png' : null)
  );
}

function ServiceCardItem({ service }: { service: Service }) {
  const icon = categoryIcons[service.category] ?? <FileText className="h-6 w-6" />;
  const detailHref = serviceUrl(service.slug);
  const orderHref =
    service.slug === 'cazier-judiciar' ? serviceUrl(service.slug) : `/comanda/${service.slug}`;
  const specimen = serviceSpecimen(service);

  return (
    <Card className="group relative overflow-hidden bg-white p-0 hover:shadow-[0_12px_30px_rgba(6,16,31,0.12)] transition-all duration-300 border border-neutral-200 hover:border-primary-400 hover:-translate-y-1.5 flex flex-col h-full rounded-2xl">
      <div
        className="relative w-full bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100"
        style={{ paddingTop: '92%' }}
      >
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
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              {icon}
            </span>
          </span>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <CardTitle className="text-[15px] font-bold text-secondary-900 leading-snug mb-1.5">
          {service.name}
        </CardTitle>
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
        <Button
          asChild
          className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl h-10 shadow-[0_4px_12px_rgba(236,185,95,0.25)] hover:shadow-[0_6px_16px_rgba(236,185,95,0.35)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <Link href={orderHref}>
            Comandă acum
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="w-full text-secondary-900 hover:text-primary-700 font-semibold h-8 text-sm"
        >
          <Link href={detailHref}>Vezi detalii</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ServicesFilter({ services }: { services: Service[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ServiceCategory | 'all'>('all');

  // Only offer chips for categories that actually have services.
  const chips = useMemo(() => {
    const present = new Set(services.map((s) => s.category));
    return INSTITUTION_GROUPS.filter((g) => present.has(g.key)).map((g) => ({
      key: g.key,
      label: CATEGORY_LABELS[g.key],
    }));
  }, [services]);

  const isFiltering = category !== 'all' || query.trim() !== '';
  const results = useMemo(
    () => filterServices(services, category, query),
    [services, category, query]
  );

  const reset = () => {
    setQuery('');
    setCategory('all');
  };

  return (
    <div>
      {/* Search + chips — sticky on mobile so it stays reachable while scrolling. */}
      <div className="sticky top-16 z-30 -mx-4 mb-8 bg-neutral-50/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-neutral-50/80 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută serviciu (ex. cazier, carte funciară, firmă)…"
            aria-label="Caută serviciu"
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-12 pr-11 text-[15px] text-secondary-900 shadow-sm outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Șterge căutarea"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-secondary-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
            Toate
          </FilterChip>
          {chips.map((c) => (
            <FilterChip key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>
              {c.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Results.
          Default (no filter): keep the SEO-friendly grouping by institution.
          Any active filter: flat grid + count. */}
      {!isFiltering ? (
        INSTITUTION_GROUPS.map((group) => {
          const items = results.filter((s) => s.category === group.key);
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
      ) : results.length > 0 ? (
        <>
          <p className="mb-6 text-sm font-medium text-neutral-500">
            {results.length} {results.length === 1 ? 'serviciu găsit' : 'servicii găsite'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {results.map((service) => (
              <ServiceCardItem key={service.id} service={service} />
            ))}
          </div>
        </>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-neutral-600">Niciun serviciu nu se potrivește căutării.</p>
          <Button
            onClick={reset}
            variant="outline"
            className="mt-4 rounded-xl border-2 border-neutral-200 font-semibold"
          >
            Resetează filtrele
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        active
          ? 'border-primary-500 bg-primary-500 text-secondary-900 shadow-sm'
          : 'border-neutral-200 bg-white text-secondary-700 hover:border-primary-300 hover:bg-primary-50'
      )}
    >
      {children}
    </button>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, FileText } from 'lucide-react';
import { formatMissing } from '@/lib/account/service-readiness';
import { serviceIconBySlug } from '@/config/services-nav';
import { SpecimenInfoButton } from '@/components/orders/specimen-info-button';

export interface AccountServiceRow {
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  /** Institution group heading, e.g. "Carte Funciară & Cadastru". */
  group: string;
  ready: boolean;
  missing: string[];
  /** „Așa arată documentul" — the wizard's specimen, when the service has one. */
  specimen?: { src: string; alt: string } | null;
}

/**
 * The service catalogue, inside the account.
 *
 * Until now the account had no list of what we actually do — just a "Comandă
 * nouă" button that threw the customer back out to /servicii. Here each service
 * also says how much of the form the account already covers, which is the only
 * thing the catalogue can tell a signed-in customer that the public page cannot.
 *
 * Nothing is disabled: every row is orderable regardless of what is missing.
 */
export default function ServicesTab({
  services,
  couponCode = null,
}: {
  services: AccountServiceRow[];
  /** Welcome coupon: carried on every link, applied by the order form itself. */
  couponCode?: string | null;
}) {
  const orderHref = (slug: string) =>
    couponCode ? `/comanda/${slug}/?coupon=${encodeURIComponent(couponCode)}` : `/comanda/${slug}/`;
  if (services.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
        <p className="text-neutral-600">Momentan nu avem servicii active.</p>
      </div>
    );
  }

  const groups = services.reduce<Record<string, AccountServiceRow[]>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* No heading here: the panel around this already names itself
          ("Ce pot comanda"), and two headings saying the same thing read as a
          mistake. */}
      <p className="text-sm text-neutral-600">
        Poți comanda orice serviciu. Sub fiecare scrie ce îți mai cerem în formular — restul se
        completează din contul tău.
      </p>

      {Object.entries(groups).map(([group, rows]) => (
        <section key={group}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-2 px-1">
            {group}
          </h4>
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
            {rows.map((service) => {
              const Icon = serviceIconBySlug(service.slug) ?? FileText;
              return (
                <div
                  key={service.slug}
                  className="flex items-start gap-3 p-4 min-h-[64px] hover:bg-neutral-50 transition-colors"
                >
                  {/* The site's own icon for the service; the ready state is
                      the colour, plus a small tick when everything is on file. */}
                  <span className="relative mt-0.5 flex-shrink-0">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        service.ready ? 'bg-green-50 text-green-700' : 'bg-primary-50 text-primary-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {service.ready && (
                      <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-white ring-2 ring-white">
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                      </span>
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <Link
                      href={orderHref(service.slug)}
                      className="group flex items-start justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                    >
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-semibold text-secondary-900 group-hover:underline">{service.name}</span>
                          {service.price != null && (
                            <span className="text-sm font-medium text-neutral-500">
                              de la {service.price} RON
                            </span>
                          )}
                        </span>
                        <span className="block text-sm text-neutral-600 mt-0.5">
                          {service.ready
                            ? 'Avem toate datele tale — completezi doar detaliile cererii.'
                            : `Îți vom cere în formular: ${formatMissing(service.missing)}.`}
                        </span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-neutral-400" />
                    </Link>
                    {service.specimen && (
                      <span className="mt-2 flex items-center gap-2">
                        <Image
                          src={service.specimen.src}
                          alt=""
                          width={36}
                          height={48}
                          className="h-12 w-9 rounded border border-neutral-200 object-cover object-top"
                        />
                        <SpecimenInfoButton
                          src={service.specimen.src}
                          alt={service.specimen.alt}
                          label="Vezi cum arată documentul"
                        />
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

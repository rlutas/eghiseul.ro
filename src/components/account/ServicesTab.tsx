'use client';

import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { formatMissing } from '@/lib/account/service-readiness';

export interface AccountServiceRow {
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  /** Institution group heading, e.g. "Carte Funciară & Cadastru". */
  group: string;
  ready: boolean;
  missing: string[];
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
export default function ServicesTab({ services }: { services: AccountServiceRow[] }) {
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
            {rows.map((service) => (
              <Link
                key={service.slug}
                href={`/comanda/${service.slug}/`}
                className="flex items-start gap-3 p-4 min-h-[64px] hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                    service.ready ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                  }`}
                >
                  {service.ready ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-secondary-900">{service.name}</span>
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
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
